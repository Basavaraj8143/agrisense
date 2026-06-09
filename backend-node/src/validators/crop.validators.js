const { z } = require("zod");

const supportedSeasons = ["kharif", "rabi", "zaid", "whole_year"];
const supportedSoilTypes = [
  "alluvial",
  "black",
  "clay",
  "laterite",
  "loamy",
  "mixed",
  "red",
  "sandy",
  "silty",
];

const soilTypeAliases = {
  "black cotton": "black",
  black_cotton: "black",
  clayey: "clay",
  other: "mixed",
};

const seasonAliases = {
  summer: "zaid",
  rubi: "rabi",
  overlapped: "whole_year",
};

function normalizeSoilType(value) {
  return soilTypeAliases[value] || value;
}

function normalizeSeason(value) {
  return seasonAliases[value] || value;
}

const locationSchema = z
  .object({
    mode: z.enum(["image_gps", "manual_location"]),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    district: z.string().trim().min(2, "District is required"),
    taluk: z.string().trim().min(2, "Taluk is required"),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "image_gps") {
      if (typeof value.lat !== "number") {
        ctx.addIssue({
          code: "custom",
          path: ["lat"],
          message: "Latitude is required when mode is image_gps",
        });
      }

      if (typeof value.lng !== "number") {
        ctx.addIssue({
          code: "custom",
          path: ["lng"],
          message: "Longitude is required when mode is image_gps",
        });
      }
    }
  });

const cropRecommendationSchema = z.object({
  location: locationSchema,
  soilType: z
    .string()
    .trim()
    .toLowerCase()
    .transform(normalizeSoilType)
    .refine((value) => supportedSoilTypes.includes(value), {
      message: `Soil type must be one of: ${supportedSoilTypes.join(", ")}`,
    }),
  season: z
    .string()
    .trim()
    .toLowerCase()
    .transform(normalizeSeason)
    .refine((value) => supportedSeasons.includes(value), {
      message: `Season must be one of: ${supportedSeasons.join(", ")}`,
    }),
  n: z.number().min(0, "N must be at least 0").max(300, "N must be at most 300"),
  p: z.number().min(0, "P must be at least 0").max(300, "P must be at most 300"),
  k: z.number().min(0, "K must be at least 0").max(300, "K must be at most 300"),
  ph: z.number().min(0, "pH must be at least 0").max(14, "pH must be at most 14"),
  previousCrop: z.string().trim().optional(),
  autofill: z
    .object({
      used: z.boolean(),
      source: z.enum(["taluk_average", "district_average", "default_fallback", "manual"]),
    })
    .optional(),
});

module.exports = {
  cropRecommendationSchema,
};
