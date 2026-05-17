const { createHash } = require("crypto");

const PestQuery = require("../models/pest-query.model");
const { detectPest } = require("../services/pest-inference.service");
const { ensureDbConnected } = require("../utils/ensure-db-connected");
const { HttpError } = require("../utils/http-error");
const { logInfo, logWarn } = require("../utils/logger");

async function detect(req, res, next) {
  const startedAt = Date.now();

  try {
    ensureDbConnected();

    if (!req.file) {
      throw new HttpError(400, "Image file is required", "VALIDATION_ERROR", [
        { field: "image", issue: "Upload an image file in form-data" },
      ]);
    }

    const requestId = req.requestId;
    const imageHash = createHash("sha256").update(req.file.buffer).digest("hex");
    let detection;

    try {
      detection = await detectPest({
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
        requestId,
      });

      logInfo("Pest detection resolved through ml-service", {
        requestId,
        upstreamRequestId: detection.upstreamRequestId,
      });
    } catch (error) {
      if (error.code === "ML_SERVICE_UNAVAILABLE") {
        logWarn("Pest detection failed because ml-service is unavailable", {
          requestId,
          issue: error.message,
        });

        throw new HttpError(
          503,
          "Pest analysis is temporarily unavailable because the ML service could not be reached. Please try again shortly.",
          "ML_SERVICE_UNAVAILABLE",
          error.details || []
        );
      }

      throw error;
    }

    const latencyMs = Date.now() - startedAt;

    const pestQuery = await PestQuery.create({
      userId: req.user._id,
      imageUrl: detection.result.imageUrl,
      imageHash,
      result: {
        scientificName: detection.result.scientificName,
        confidencePercent: detection.result.confidencePercent,
        commonNames: detection.result.commonNames,
        treatmentSummary: detection.result.treatmentSummary,
      },
      provider: detection.provider,
      meta: {
        source: detection.source,
        latencyMs,
        requestId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Pest analysis completed",
      data: {
        queryId: pestQuery._id,
        scientificName: detection.result.scientificName,
        confidencePercent: detection.result.confidencePercent,
        commonNames: detection.result.commonNames,
        treatmentSummary: detection.result.treatmentSummary,
        meta: {
          source: detection.source,
          latencyMs,
          requestId,
          upstreamRequestId: detection.upstreamRequestId,
        },
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  detect,
};
