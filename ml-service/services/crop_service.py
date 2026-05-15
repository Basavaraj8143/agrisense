from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from utils.http import ServiceError


class CropRecommendationService:
    def __init__(self) -> None:
        self.base_dir = Path(__file__).resolve().parent.parent
        self.model_path = self.base_dir / "model" / "crop_recommender.pkl"
        self.region_data_path = self.base_dir / "data" / "cleaned" / "region_cleaned.csv"
        self.provider_name = "crop-model"
        self.is_ready = False

        self.model = None
        self.label_encoders = {}
        self.crop_data = pd.DataFrame()
        self.region_df = pd.DataFrame()
        self.npk_max_sum = 1.0
        self.startup_error = None

        self._load_assets()

    def _load_assets(self) -> None:
        try:
            bundle = joblib.load(self.model_path)
            self.model = bundle["model"]
            self.label_encoders = bundle.get("label_encoders", {})
            self.crop_data = bundle["crop_data"].copy()
            self.npk_max_sum = max(float(bundle.get("npk_max_sum", 1.0)), 1.0)
            self.region_df = pd.read_csv(self.region_data_path)
            self.region_df["district"] = self.region_df["district"].astype(str).str.lower().str.strip()
            self.region_df["taluq"] = self.region_df["taluq"].astype(str).str.lower().str.strip()
            self.is_ready = True
        except Exception as error:
            self.is_ready = False
            self.startup_error = str(error)

    @staticmethod
    def _to_number(value, default=0.0):
        numeric_value = pd.to_numeric(value, errors="coerce")
        if pd.isna(numeric_value):
            return default
        return float(numeric_value)

    def _safe_encode(self, column_name: str, value: str) -> int:
        encoder = self.label_encoders.get(column_name)
        if encoder is None:
            return 0

        normalized_value = str(value).lower().strip()
        classes = list(encoder.classes_)

        if normalized_value not in classes:
            classes.append(normalized_value)
            encoder.classes_ = np.array(classes)

        return int(encoder.transform([normalized_value])[0])

    @staticmethod
    def _format_crop_name(name: str) -> str:
        return " / ".join(part.strip().title() for part in str(name).split("/"))

    @staticmethod
    def _format_yield(value) -> str | None:
        if pd.isna(value):
            return None
        return f"{float(value):.1f} quintals/acre"

    @staticmethod
    def _format_market_price(value) -> str | None:
        if pd.isna(value):
            return None
        return f"Rs {int(float(value)):,}/qtl"

    def _find_region_row(self, district: str, taluk: str):
        direct_match = self.region_df[
            (self.region_df["district"] == district) & (self.region_df["taluq"] == taluk)
        ]

        if not direct_match.empty:
            return direct_match.iloc[0]

        partial_match = self.region_df[
            self.region_df["district"].str.contains(district, na=False)
            | self.region_df["taluq"].str.contains(taluk, na=False)
        ]

        if not partial_match.empty:
            return partial_match.iloc[0]

        return None

    def recommend(self, payload: dict) -> dict:
        if not self.is_ready or self.model is None:
            raise ServiceError(
                503,
                "Crop recommendation service is not ready",
                "ML_SERVICE_UNAVAILABLE",
                [{"field": "model", "issue": self.startup_error or "Assets not loaded"}],
            )

        location = payload["location"]
        district = location["district"]
        taluk = location["taluk"]
        soil = payload["soilType"]
        season = payload["season"]
        user_n = float(payload["n"])
        user_p = float(payload["p"])
        user_k = float(payload["k"])
        user_ph = float(payload["ph"])

        district_encoded = self._safe_encode("district", district)
        taluk_encoded = self._safe_encode("taluq", taluk)
        season_encoded = self._safe_encode("season", season)

        region_row = self._find_region_row(district, taluk)
        if region_row is not None:
            if season == "rabi":
                region_temp = region_row.get("avg_temp_rabi", np.nan)
            elif season == "kharif":
                region_temp = region_row.get("avg_temp_kharif", np.nan)
            else:
                region_temp = np.nanmean(
                    [region_row.get("avg_temp_rabi", np.nan), region_row.get("avg_temp_kharif", np.nan)]
                )

            rainfall_scaled = self._to_number(region_row.get("avg_rainfall", 0)) / 10.0
        else:
            region_temp = np.nan
            rainfall_scaled = np.nan

        candidates = []

        for _, crop in self.crop_data.iterrows():
            temp_mean = pd.to_numeric(crop.get("temp_mean"), errors="coerce")
            humidity_mean = pd.to_numeric(crop.get("humidity_mean"), errors="coerce")
            crop_n = self._to_number(crop.get("N"), 0.0)
            crop_p = self._to_number(crop.get("P"), 0.0)
            crop_k = self._to_number(crop.get("K"), 0.0)
            crop_ph = pd.to_numeric(crop.get("ph_mean"), errors="coerce")

            temp_diff = abs(region_temp - temp_mean) if pd.notna(region_temp) and pd.notna(temp_mean) else 0.0
            rain_diff = (
                abs(rainfall_scaled - humidity_mean)
                if pd.notna(rainfall_scaled) and pd.notna(humidity_mean)
                else 0.0
            )

            soil_crop = str(crop.get("main_soiltype", "")).strip().lower()
            soil_match = 1 if soil_crop and soil in soil_crop else 0

            feature_frame = pd.DataFrame(
                [
                    [
                        district_encoded,
                        taluk_encoded,
                        season_encoded,
                        temp_diff,
                        rain_diff,
                        soil_match,
                        crop_n,
                        crop_p,
                        crop_k,
                        float(crop_ph) if pd.notna(crop_ph) else 0.0,
                    ]
                ],
                columns=[
                    "district",
                    "taluq",
                    "season",
                    "temp_diff",
                    "rain_diff",
                    "soil_match",
                    "crop_N",
                    "crop_P",
                    "crop_K",
                    "crop_ph",
                ],
            )

            probability = float(self.model.predict_proba(feature_frame)[0][1])
            npk_diff_sum = abs(crop_n - user_n) + abs(crop_p - user_p) + abs(crop_k - user_k)
            npk_norm = npk_diff_sum / self.npk_max_sum
            ph_diff = abs(float(crop_ph) - user_ph) if pd.notna(crop_ph) else 0.0
            ph_norm = ph_diff / 14.0
            final_score = (0.6 * probability) + (0.4 * (1 - ((npk_norm + ph_norm) / 2.0)))
            final_score = max(0.0, min(1.0, float(final_score)))

            candidates.append(
                {
                    "name": self._format_crop_name(crop["crop"]),
                    "score": round(float(final_score), 4),
                    "yieldData": self._format_yield(crop.get("yield_qtl_per_acre")),
                    "marketPrice": self._format_market_price(crop.get("price_per_qtl_rs")),
                }
            )

        ranked = sorted(candidates, key=lambda item: item["score"], reverse=True)
        if not ranked:
            raise ServiceError(404, "No crop recommendations available", "RESOURCE_NOT_FOUND")

        return {
            "primaryCrop": ranked[0],
            "alternatives": ranked[1:4],
            "meta": {
                "source": self.provider_name,
                "modelPath": self.model_path.name,
                "regionMatchFound": region_row is not None,
            },
        }
