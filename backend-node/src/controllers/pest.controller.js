const { createHash, randomUUID } = require("crypto");

const PestQuery = require("../models/pest-query.model");
const { detectPest } = require("../services/pest-inference.service");
const { ensureDbConnected } = require("../utils/ensure-db-connected");
const { HttpError } = require("../utils/http-error");

async function detect(req, res, next) {
  const startedAt = Date.now();

  try {
    ensureDbConnected();

    if (!req.file) {
      throw new HttpError(400, "Image file is required", "VALIDATION_ERROR", [
        { field: "image", issue: "Upload an image file in form-data" },
      ]);
    }

    const requestId = `pest_${randomUUID()}`;
    const imageHash = createHash("sha256").update(req.file.buffer).digest("hex");
    const detection = await detectPest({
      fileBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
    });
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
