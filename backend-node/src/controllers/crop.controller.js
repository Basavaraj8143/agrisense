const { randomUUID } = require("crypto");

const CropQuery = require("../models/crop-query.model");
const { recommendCrops } = require("../services/crop-recommendation.service");
const { ensureDbConnected } = require("../utils/ensure-db-connected");

async function recommend(req, res, next) {
  const startedAt = Date.now();

  try {
    ensureDbConnected();

    const input = {
      ...req.validatedBody,
      autofill: req.validatedBody.autofill || {
        used: false,
        source: "manual",
      },
    };

    const result = recommendCrops(input);
    const requestId = `crop_${randomUUID()}`;
    const latencyMs = Date.now() - startedAt;

    const cropQuery = await CropQuery.create({
      userId: req.user._id,
      input,
      result,
      meta: {
        source: "node-rules",
        latencyMs,
        requestId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Recommendation generated",
      data: {
        queryId: cropQuery._id,
        primaryCrop: result.primaryCrop,
        alternatives: result.alternatives,
        meta: {
          source: "node-rules",
          latencyMs,
          autofillUsed: input.autofill.used,
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
  recommend,
};
