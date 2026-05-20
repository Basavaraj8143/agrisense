import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { ApiError, cropApi, toFieldErrors } from "../lib/api-client";
import { extractCoordinatesFromImage, reverseGeocodeCoordinates } from "../lib/image-location";
import { districtOptions, findDistrictByTaluk, findDistrictKey, findTalukForDistrict, getTaluksForDistrict } from "../lib/location-options";

const initialForm = {
  locationMethod: "image_upload",
  district: "",
  taluk: "",
  lat: "",
  lng: "",
  soilType: "",
  season: "",
  n: "",
  p: "",
  k: "",
  ph: "",
  previousCrop: "",
  autofillUsed: false,
  autofillSource: "manual",
};

const soilOptions = [
  { value: "alluvial", label: "Alluvial" },
  { value: "black", label: "Black" },
  { value: "laterite", label: "Laterite" },
  { value: "red", label: "Red" },
  { value: "loamy", label: "Loamy" },
  { value: "other", label: "Other" },
];

const seasonOptions = [
  { value: "rabi", label: "Rabi" },
  { value: "kharif", label: "Kharif" },
  { value: "overlapped", label: "Overlapped" },
  { value: "whole_year", label: "Whole year" },
];

const previousCropOptions = [
  "Arecanut/Banana",
  "Bajra",
  "Banana",
  "Bengalgram",
  "Byadagi Chilli",
  "Chilli",
  "Cotton",
  "Grapes",
  "Groundnut",
  "Jowar",
  "Maize",
  "Onion",
  "Paddy",
  "Pigeon pea / Tur",
  "Pomegranate",
  "Pulses",
];

function formatScore(score) {
  if (typeof score !== "number") {
    return "N/A";
  }

  return `${Math.round(score * 100)}%`;
}

function hasCoordinates(form) {
  return form.lat !== "" && form.lng !== "" && !Number.isNaN(Number(form.lat)) && !Number.isNaN(Number(form.lng));
}

function validateCropForm(form) {
  const errors = {};

  if (form.locationMethod === "image_upload" && !form.locationImage) {
    errors.locationImage = "Upload a field image or switch to manual location entry.";
  }

  if (form.district.trim().length < 2) {
    errors["location.district"] = "District is required.";
  }

  if (form.taluk.trim().length < 2) {
    errors["location.taluk"] = "Taluk is required.";
  }

  if (!form.soilType) {
    errors.soilType = "Select a soil type.";
  }

  if (!form.season) {
    errors.season = "Select a season.";
  }

  [
    ["n", 0, 300, "Nitrogen"],
    ["p", 0, 300, "Phosphorus"],
    ["k", 0, 300, "Potassium"],
    ["ph", 0, 14, "pH"],
  ].forEach(([field, min, max, label]) => {
    const value = Number(form[field] || 0);

    if (Number.isNaN(value) || value < min || value > max) {
      errors[field] = `${label} must be between ${min} and ${max}.`;
    }
  });

  return errors;
}

function toPayload(form) {
  const payload = {
    location: {
      mode: hasCoordinates(form) ? "image_gps" : "manual_location",
      district: form.district.trim(),
      taluk: form.taluk.trim(),
    },
    soilType: form.soilType,
    season: form.season,
    n: Number(form.n || 0),
    p: Number(form.p || 0),
    k: Number(form.k || 0),
    ph: Number(form.ph || 0),
    previousCrop: form.previousCrop || undefined,
    autofill: {
      used: form.autofillUsed,
      source: form.autofillUsed ? form.autofillSource : "manual",
    },
  };

  if (hasCoordinates(form)) {
    payload.location.lat = Number(form.lat);
    payload.location.lng = Number(form.lng);
  }

  return payload;
}

function CropResultCard({ crop, primary = false }) {
  if (!crop) {
    return null;
  }

  return (
    <article className={`legacy-crop-result-card ${primary ? "is-primary" : ""}`}>
      <div className={`legacy-crop-result-header ${primary ? "is-primary" : ""}`}>
        <h4>{crop.name}</h4>
        {primary ? <span className="legacy-best-match-badge">BEST MATCH</span> : null}
      </div>
      <div className="legacy-crop-result-body">
        <div className="legacy-crop-metrics">
          <div>
            <p>Match Score</p>
            <strong>{formatScore(crop.score)}</strong>
          </div>
          <div>
            <p>Yield Potential</p>
            <strong>{crop.yieldData || "High"}</strong>
          </div>
          <div>
            <p>Market Context</p>
            <strong>{crop.marketPrice || "Favorable"}</strong>
          </div>
        </div>
        <div className="legacy-result-actions">
          <button type="button" className="legacy-solid-button legacy-full-width">
            Choose this plant
          </button>
        </div>
      </div>
    </article>
  );
}

function CropPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(() => ({ ...initialForm, locationImage: null }));
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [extractingLocation, setExtractingLocation] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const availableTaluks = getTaluksForDistrict(form.district);

  useEffect(() => {
    if (!form.locationImage) {
      setImagePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(form.locationImage);
    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.locationImage]);

  function updateForm(updater) {
    setForm((current) => (typeof updater === "function" ? updater(current) : updater));
  }

  function updateDistrict(nextDistrict) {
    updateForm((current) => {
      const matchingDistrict = findDistrictKey(nextDistrict) || nextDistrict;
      const nextTaluks = getTaluksForDistrict(matchingDistrict);
      const preservedTaluk = nextTaluks.includes(current.taluk) ? current.taluk : "";

      return {
        ...current,
        district: matchingDistrict,
        taluk: preservedTaluk,
      };
    });
  }

  async function autofillLocationFromCoordinates(lat, lng, sourceLabel) {
    updateForm((current) => ({
      ...current,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }));

    setLocationStatus(`Coordinates extracted from ${sourceLabel}. Resolving district and taluk...`);

    try {
      const location = await reverseGeocodeCoordinates(lat, lng);
      updateForm((current) => {
        const detectedDistrict =
          findDistrictKey(location.district) ||
          findDistrictByTaluk(location.taluk) ||
          current.district;
        const detectedTaluk =
          findTalukForDistrict(detectedDistrict, location.taluk) ||
          findTalukForDistrict(detectedDistrict, current.taluk) ||
          "";

        return {
          ...current,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
          district: detectedDistrict,
          taluk: detectedTaluk,
          autofillUsed: true,
          autofillSource: "district_average",
        };
      });
      const matchedDistrict = findDistrictKey(location.district) || findDistrictByTaluk(location.taluk);
      const matchedTaluk = findTalukForDistrict(matchedDistrict, location.taluk);
      setLocationStatus(
        matchedDistrict && matchedTaluk
          ? `Location detected from ${sourceLabel}. Auto-selected ${matchedTaluk}, ${matchedDistrict}.`
          : matchedDistrict
            ? `Location detected from ${sourceLabel}. Auto-selected district ${matchedDistrict}. Please confirm taluk.`
            : `Coordinates detected from ${sourceLabel}. Please select district and taluk from the dropdowns.`
      );
    } catch {
      setLocationStatus(`Coordinates detected from ${sourceLabel}. Confirm district and taluk before submitting.`);
    }
  }

  async function handleImageChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setFieldErrors((current) => ({ ...current, locationImage: undefined }));
    setLocationStatus("");

    if (!nextFile) {
      updateForm((current) => ({ ...current, locationImage: null }));
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      updateForm((current) => ({ ...current, locationImage: null }));
      setFieldErrors((current) => ({ ...current, locationImage: "Please choose an image file." }));
      return;
    }

    updateForm((current) => ({ ...current, locationImage: nextFile }));
    setExtractingLocation(true);

    try {
      const coordinates = await extractCoordinatesFromImage(nextFile, (status) => setLocationStatus(status));

      if (!coordinates) {
        setLocationStatus("No coordinates were found in the image. You can still enter the location manually.");
        return;
      }

      await autofillLocationFromCoordinates(
        coordinates.lat,
        coordinates.lng,
        coordinates.source === "exif" ? "image metadata" : "OCR text"
      );
    } catch {
      setLocationStatus("Could not extract coordinates from this image. You can still continue with manual location entry.");
    } finally {
      setExtractingLocation(false);
    }
  }

  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by this browser.");
      return;
    }

    setGeolocating(true);
    setLocationStatus("Getting current device coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await autofillLocationFromCoordinates(position.coords.latitude, position.coords.longitude, "device location");
        setGeolocating(false);
      },
      () => {
        setLocationStatus("Unable to access current location. Please enter district and taluk manually.");
        setGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const clientErrors = validateCropForm(form);
    setFieldErrors(clientErrors);
    setErrorMessage("");

    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await cropApi.recommend(toPayload(form), token);
      setResult(response);
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors((current) => ({ ...current, ...toFieldErrors(error.details) }));
        setErrorMessage(error.message);
      } else {
        setErrorMessage("We could not generate a recommendation right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="legacy-section">
      <div className="legacy-container">
        <div className="legacy-page-intro centered">
          <h2 className="legacy-page-title">AI Crop Recommendation</h2>
          <p className="legacy-page-subtitle">Upload a field image or enter location manually to get personalized crop recommendations.</p>
        </div>

        <div className="legacy-workspace-grid">
          <div className="legacy-card legacy-form-card">
            <form onSubmit={handleSubmit}>
              <div className="legacy-field-group">
                <label className="legacy-field-label">Location</label>
                <div className="legacy-mode-toggle">
                  <button
                    type="button"
                    className={`legacy-mode-button ${form.locationMethod === "image_upload" ? "is-active" : ""}`}
                    onClick={() => updateForm((current) => ({ ...current, locationMethod: "image_upload" }))}
                  >
                    Upload Field Image
                  </button>
                  <button
                    type="button"
                    className={`legacy-mode-button ${form.locationMethod === "manual_location" ? "is-active" : ""}`}
                    onClick={() =>
                      updateForm((current) => ({
                        ...current,
                        locationMethod: "manual_location",
                        locationImage: null,
                        lat: "",
                        lng: "",
                      }))
                    }
                  >
                    Enter Manually
                  </button>
                </div>

                {form.locationMethod === "image_upload" ? (
                  <label className="legacy-upload-zone">
                    <input type="file" accept="image/*" className="legacy-hidden-input" onChange={handleImageChange} />
                    {imagePreviewUrl ? (
                      <div className="legacy-upload-preview">
                        <img src={imagePreviewUrl} alt="Field preview" className="legacy-upload-image" />
                        <p className="legacy-helper-text">Click to change image</p>
                      </div>
                    ) : (
                      <div className="legacy-upload-placeholder">
                        <div className="legacy-upload-icon">IMG</div>
                        <p className="legacy-upload-title">Click to upload field image</p>
                        <p className="legacy-helper-text">We will detect your location from the image when possible.</p>
                      </div>
                    )}
                  </label>
                ) : null}

                {fieldErrors.locationImage ? <small className="legacy-field-error">{fieldErrors.locationImage}</small> : null}

                {(locationStatus || hasCoordinates(form)) && (
                  <div className="legacy-location-box">
                    <div className="legacy-location-row">
                      <span>Coordinates</span>
                      <strong>
                        {form.lat || "--"}, {form.lng || "--"}
                      </strong>
                    </div>
                    <div className="legacy-location-row">
                      <span>Status</span>
                      <strong>{locationStatus || "Waiting for input"}</strong>
                    </div>
                  </div>
                )}

                {form.locationMethod === "image_upload" ? (
                  <button
                    type="button"
                    className="legacy-outline-button"
                    onClick={handleUseCurrentLocation}
                    disabled={geolocating || extractingLocation}
                  >
                    {geolocating ? "Getting Location..." : "Use Current Location"}
                  </button>
                ) : null}
              </div>

              <div className="legacy-field-group">
                <label className="legacy-field-label">District</label>
                <select
                  className="legacy-input"
                  value={form.district}
                  onChange={(event) => updateDistrict(event.target.value)}
                  required
                >
                  <option value="">Select District</option>
                  {districtOptions.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {fieldErrors["location.district"] ? <small className="legacy-field-error">{fieldErrors["location.district"]}</small> : null}
              </div>

              <div className="legacy-field-group">
                <label className="legacy-field-label">Taluk</label>
                <select
                  className="legacy-input"
                  value={form.taluk}
                  onChange={(event) => updateForm((current) => ({ ...current, taluk: event.target.value }))}
                  disabled={availableTaluks.length === 0}
                  required
                >
                  <option value="">{availableTaluks.length === 0 ? "Select District First" : "Select Taluk"}</option>
                  {availableTaluks.map((taluk) => (
                    <option key={taluk} value={taluk}>
                      {taluk}
                    </option>
                  ))}
                </select>
                {fieldErrors["location.taluk"] ? <small className="legacy-field-error">{fieldErrors["location.taluk"]}</small> : null}
              </div>

              <div className="legacy-field-group">
                <label className="legacy-field-label">Soil Type</label>
                <select
                  className="legacy-input"
                  value={form.soilType}
                  onChange={(event) => updateForm((current) => ({ ...current, soilType: event.target.value }))}
                  required
                >
                  <option value="">Select Soil Type</option>
                  {soilOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.soilType ? <small className="legacy-field-error">{fieldErrors.soilType}</small> : null}
              </div>

              <div className="legacy-field-group">
                <label className="legacy-field-label">Season</label>
                <select
                  className="legacy-input"
                  value={form.season}
                  onChange={(event) => updateForm((current) => ({ ...current, season: event.target.value }))}
                  required
                >
                  <option value="">Select Season</option>
                  {seasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.season ? <small className="legacy-field-error">{fieldErrors.season}</small> : null}
              </div>

              <div className="legacy-field-group">
                <label className="legacy-field-label">NPK Levels</label>
                <div className="legacy-three-grid">
                  <input
                    type="number"
                    className="legacy-input"
                    min="0"
                    max="300"
                    value={form.n}
                    onChange={(event) => updateForm((current) => ({ ...current, n: event.target.value }))}
                    placeholder="N"
                  />
                  <input
                    type="number"
                    className="legacy-input"
                    min="0"
                    max="300"
                    value={form.p}
                    onChange={(event) => updateForm((current) => ({ ...current, p: event.target.value }))}
                    placeholder="P"
                  />
                  <input
                    type="number"
                    className="legacy-input"
                    min="0"
                    max="300"
                    value={form.k}
                    onChange={(event) => updateForm((current) => ({ ...current, k: event.target.value }))}
                    placeholder="K"
                  />
                </div>
                {(fieldErrors.n || fieldErrors.p || fieldErrors.k) && (
                  <small className="legacy-field-error">{fieldErrors.n || fieldErrors.p || fieldErrors.k}</small>
                )}
              </div>

              <div className="legacy-field-group">
                <label className="legacy-field-label">pH Level (Optional)</label>
                <input
                  type="number"
                  className="legacy-input"
                  min="0"
                  max="14"
                  step="0.1"
                  value={form.ph}
                  onChange={(event) => updateForm((current) => ({ ...current, ph: event.target.value }))}
                  placeholder="6.5"
                />
                {fieldErrors.ph ? <small className="legacy-field-error">{fieldErrors.ph}</small> : null}
              </div>

              <div className="legacy-field-group">
                <label className="legacy-field-label">Previous Crop (Optional)</label>
                <select
                  className="legacy-input"
                  value={form.previousCrop}
                  onChange={(event) => updateForm((current) => ({ ...current, previousCrop: event.target.value }))}
                >
                  <option value="">Select Previous Crop</option>
                  {previousCropOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {errorMessage ? <div className="legacy-error-box">{errorMessage}</div> : null}

              <button type="submit" className="legacy-solid-button legacy-full-width" disabled={submitting || extractingLocation}>
                {submitting ? "Analyzing Your Inputs..." : extractingLocation ? "Extracting Location..." : "Get Recommendation"}
              </button>
            </form>

            <div className="legacy-tip-panel">
              <h5>Need Soil Testing?</h5>
              <p>Do not know your soil NPK values and pH? Use affordable soil testing kits for better accuracy.</p>
              <button type="button" className="legacy-blue-button">
                Request Testing Kit
              </button>
            </div>
          </div>

          <div className="legacy-card legacy-results-card">
            <h3 className="legacy-card-title">Recommendation Results</h3>
            {!result ? (
              <div className="legacy-empty-result">
                <div className="legacy-empty-icon">CROP</div>
                <p>Fill out the form to get personalized crop recommendations.</p>
              </div>
            ) : (
              <div className="legacy-results-stack">
                <CropResultCard crop={result.primaryCrop} primary />
                {result.alternatives?.map((crop) => (
                  <CropResultCard key={crop.name} crop={crop} />
                ))}
                <div className="legacy-tips-box">
                  <h4>Growing Tips</h4>
                  <ul className="legacy-list compact">
                    <li>Test soil before planting for better accuracy.</li>
                    <li>Consider crop rotation for improved yield.</li>
                    <li>Monitor weather forecasts regularly.</li>
                    <li>Consult local agriculture experts before planting.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CropPage;
