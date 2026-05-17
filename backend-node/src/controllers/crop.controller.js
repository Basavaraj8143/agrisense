const { prisma } = require("../db/prisma");
const {
  recommendCrops,
  requestCropRecommendationFromMlService,
} = require("../services/crop-recommendation.service");
const { ensureDbConnected } = require("../utils/ensure-db-connected");
const { logInfo, logWarn } = require("../utils/logger");

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
    const requestId = req.requestId;
    let result;
    let responseMessage = "Recommendation generated";
    let source = "ml-service";
    let fallbackUsed = false;
    let upstreamRequestId = null;

    try {
      const mlResponse = await requestCropRecommendationFromMlService(input, { requestId });
      result = mlResponse.result;
      source = result.meta?.source || "ml-service";
      upstreamRequestId = mlResponse.upstreamRequestId;

      logInfo("Crop recommendation resolved through ml-service", {
        requestId,
        upstreamRequestId,
        source,
      });
    } catch (error) {
      if (error.code !== "ML_SERVICE_UNAVAILABLE") {
        throw error;
      }

      fallbackUsed = true;
      source = "node-rules-fallback";
      responseMessage = "Recommendation generated using fallback rules";
      result = recommendCrops(input);

      logWarn("Falling back to Node crop rules because ml-service is unavailable", {
        requestId,
        issue: error.message,
      });
    }

    const latencyMs = Date.now() - startedAt;

    const cropQuery = await prisma.cropQuery.create({
      data: {
        userId: req.user.id,
        input,
        result: {
          primaryCrop: result.primaryCrop,
          alternatives: result.alternatives,
        },
        meta: {
          source,
          latencyMs,
          requestId,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: responseMessage,
      data: {
        queryId: cropQuery.id,
        primaryCrop: result.primaryCrop,
        alternatives: result.alternatives,
        meta: {
          source,
          latencyMs,
          autofillUsed: input.autofill.used,
          requestId,
          fallbackUsed,
          upstreamRequestId,
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
