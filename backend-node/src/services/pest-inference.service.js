const { Blob } = require("buffer");

const { HttpError } = require("../utils/http-error");
const { requestMlService } = require("../utils/ml-service-client");

function toJoinedNames(value) {
  if (Array.isArray(value) && value.length > 0) {
    return value.join(", ");
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "Unknown";
}

function toTreatmentSummary(value, fallback) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }

  return "Treatment guidance unavailable.";
}

function toConfidencePercent(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const normalizedValue = numericValue > 0 && numericValue <= 1 ? numericValue * 100 : numericValue;

  return Number(normalizedValue.toFixed(1));
}

function normalizeMlServiceResponse(payload) {
  const result = payload?.data?.result || payload?.result || payload?.data || payload;

  if (!result) {
    throw new HttpError(503, "Pest inference provider returned an invalid response", "ML_SERVICE_UNAVAILABLE");
  }

  return {
    scientificName: result.scientificName || result.scientific_name || "Unknown",
    confidencePercent: toConfidencePercent(
      result.confidencePercent || result.confidence_percent || result.confidence || 0
    ),
    commonNames: toJoinedNames(result.commonNames || result.common_names),
    treatmentSummary: toTreatmentSummary(result.treatmentSummary, result.about || result.description),
    imageUrl: result.imageUrl || result.image_url || null,
  };
}

async function detectPest({ fileBuffer, mimeType, originalName, requestId }) {
  if (!fileBuffer || !mimeType) {
    throw new HttpError(400, "Image file is required", "VALIDATION_ERROR", [
      { field: "image", issue: "Missing uploaded image data" },
    ]);
  }

  const form = new FormData();

  form.append("image", new Blob([fileBuffer], { type: mimeType }), originalName || "pest-image.jpg");

  const response = await requestMlService({
    path: process.env.ML_SERVICE_PEST_PATH || "/ml/pest-detect",
    method: "POST",
    body: form,
    requestId,
    operationName: "pest-detection",
  });
  const normalized = normalizeMlServiceResponse(response.payload);

  return {
    result: normalized,
    provider: {
      name: "ml-service",
      providerResponseId: response.upstreamRequestId,
    },
    source: "ml-service",
    upstreamRequestId: response.upstreamRequestId,
  }
}

module.exports = {
  detectPest,
};
