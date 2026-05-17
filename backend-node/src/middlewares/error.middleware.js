const multer = require("multer");

function notFoundHandler(req, res, next) {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    error: {
      code: "RESOURCE_NOT_FOUND",
      details: [{ field: "route", issue: req.originalUrl }],
    },
    meta: {
      requestId: req.requestId || null,
      timestamp: new Date().toISOString(),
    },
  });
}

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const isFileSizeLimit = err.code === "LIMIT_FILE_SIZE";

    return res.status(isFileSizeLimit ? 413 : 400).json({
      success: false,
      message: isFileSizeLimit ? "Uploaded image exceeds the allowed size" : "Upload failed",
      error: {
        code: "VALIDATION_ERROR",
        details: [
          {
            field: "image",
            issue: isFileSizeLimit ? "Upload a file smaller than the configured limit" : err.message,
          },
        ],
      },
      meta: {
        requestId: req.requestId || null,
        timestamp: new Date().toISOString(),
      },
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (statusCode >= 500) {
    console.error("Unhandled error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: err.code || "INTERNAL_ERROR",
      details: err.details || [],
    },
    meta: {
      requestId: req.requestId || null,
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
