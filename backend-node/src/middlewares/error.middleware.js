function notFoundHandler(req, res, next) {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    error: {
      code: "RESOURCE_NOT_FOUND",
      details: [{ field: "route", issue: req.originalUrl }],
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

function errorHandler(err, req, res, next) {
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
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
