const { randomUUID } = require("crypto");

function attachRequestContext(req, res, next) {
  const incomingRequestId = req.headers["x-request-id"];
  const normalizedRequestId =
    typeof incomingRequestId === "string" && incomingRequestId.trim()
      ? incomingRequestId.trim()
      : `req_${randomUUID()}`;

  req.requestId = normalizedRequestId;
  res.setHeader("X-Request-Id", normalizedRequestId);

  return next();
}

module.exports = {
  attachRequestContext,
};
