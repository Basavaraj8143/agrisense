const { createHash } = require("crypto");
const { Blob } = require("buffer");

const { HttpError } = require("../utils/http-error");

const defaultKindwiseUrl =
  "https://insect.kindwise.com/api/v1/identification?details=name,common_names,description_gpt,image";
const defaultMlServiceUrl = "http://127.0.0.1:5000/detect_pest";

const mockCatalog = [
  {
    scientificName: "Spodoptera frugiperda",
    commonNames: "Fall Armyworm",
    treatmentSummary: "Use pheromone traps early, scout in the whorl, and target larvae before heavy infestation.",
  },
  {
    scientificName: "Nilaparvata lugens",
    commonNames: "Brown Planthopper",
    treatmentSummary: "Reduce excess nitrogen, drain standing water when possible, and use targeted hopper control if thresholds are crossed.",
  },
  {
    scientificName: "Aphis gossypii",
    commonNames: "Cotton Aphid",
    treatmentSummary: "Encourage beneficial insects, manage ant activity, and use a selective spray only when colonies continue expanding.",
  },
];

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

function normalizeKindwiseResponse(payload) {
  const suggestion = payload?.result?.classification?.suggestions?.[0];
  const details = suggestion?.details || {};

  if (!suggestion) {
    throw new HttpError(503, "Pest inference provider returned an invalid response", "ML_SERVICE_UNAVAILABLE");
  }

  return {
    scientificName: suggestion.name || "Unknown",
    confidencePercent: Number(((suggestion.probability || 0) * 100).toFixed(1)),
    commonNames: toJoinedNames(details.common_names),
    treatmentSummary: toTreatmentSummary(details.description_gpt, details.description),
    imageUrl: details.image?.value || details.image || null,
  };
}

async function detectWithMock({ fileBuffer }) {
  const imageHash = createHash("sha256").update(fileBuffer).digest("hex");
  const mockEntry = mockCatalog[parseInt(imageHash.slice(0, 8), 16) % mockCatalog.length];
  const confidenceSeed = parseInt(imageHash.slice(8, 12), 16) % 120;

  return {
    result: {
      scientificName: mockEntry.scientificName,
      confidencePercent: Number((78 + confidenceSeed / 10).toFixed(1)),
      commonNames: mockEntry.commonNames,
      treatmentSummary: mockEntry.treatmentSummary,
      imageUrl: null,
    },
    provider: {
      name: "mock",
      providerResponseId: `mock_${imageHash.slice(0, 12)}`,
    },
    source: "mock-provider",
  };
}

async function detectWithKindwise({ fileBuffer, mimeType }) {
  const providerApiKey = process.env.PEST_PROVIDER_API_KEY;
  if (!providerApiKey) {
    throw new HttpError(503, "Pest inference provider is not configured", "ML_SERVICE_UNAVAILABLE");
  }

  const timeoutMs = Number(process.env.PEST_PROVIDER_TIMEOUT_MS) || 10000;
  const providerUrl = process.env.PEST_PROVIDER_API_URL || defaultKindwiseUrl;
  const payload = {
    images: [`data:${mimeType};base64,${fileBuffer.toString("base64")}`],
    similar_images: true,
    datetime: new Date().toISOString(),
  };

  let response;

  try {
    response = await fetch(providerUrl, {
      method: "POST",
      headers: {
        "Api-Key": providerApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new HttpError(503, "Pest inference provider unavailable", "ML_SERVICE_UNAVAILABLE", [
      { field: "provider", issue: error.message },
    ]);
  }

  if (!response.ok) {
    const providerMessage = await response.text();
    throw new HttpError(503, "Pest inference provider unavailable", "ML_SERVICE_UNAVAILABLE", [
      { field: "provider", issue: providerMessage.slice(0, 240) || `HTTP ${response.status}` },
    ]);
  }

  const payloadJson = await response.json();
  const normalized = normalizeKindwiseResponse(payloadJson);

  return {
    result: normalized,
    provider: {
      name: "kindwise",
      providerResponseId: payloadJson?.id || payloadJson?.access_token || null,
    },
    source: "kindwise",
  };
}

async function detectWithMlService({ fileBuffer, mimeType, originalName }) {
  const timeoutMs = Number(process.env.PEST_PROVIDER_TIMEOUT_MS) || 10000;
  const providerUrl = process.env.PEST_ML_SERVICE_URL || defaultMlServiceUrl;
  const form = new FormData();

  form.append("image", new Blob([fileBuffer], { type: mimeType }), originalName || "pest-image.jpg");

  let response;

  try {
    response = await fetch(providerUrl, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new HttpError(503, "ML pest service unavailable", "ML_SERVICE_UNAVAILABLE", [
      { field: "provider", issue: error.message },
    ]);
  }

  if (!response.ok) {
    const providerMessage = await response.text();
    throw new HttpError(503, "ML pest service unavailable", "ML_SERVICE_UNAVAILABLE", [
      { field: "provider", issue: providerMessage.slice(0, 240) || `HTTP ${response.status}` },
    ]);
  }

  const payloadJson = await response.json();
  const normalized = normalizeMlServiceResponse(payloadJson);

  return {
    result: normalized,
    provider: {
      name: "ml-service",
      providerResponseId: payloadJson?.requestId || payloadJson?.id || null,
    },
    source: "ml-service",
  };
}

async function detectPest({ fileBuffer, mimeType, originalName }) {
  const providerName = (process.env.PEST_PROVIDER || "mock").trim().toLowerCase();

  if (!fileBuffer || !mimeType) {
    throw new HttpError(400, "Image file is required", "VALIDATION_ERROR", [
      { field: "image", issue: "Missing uploaded image data" },
    ]);
  }

  if (providerName === "kindwise") {
    return detectWithKindwise({ fileBuffer, mimeType });
  }

  if (providerName === "ml-service") {
    return detectWithMlService({ fileBuffer, mimeType, originalName });
  }

  return detectWithMock({ fileBuffer, mimeType, originalName });
}

module.exports = {
  detectPest,
};
