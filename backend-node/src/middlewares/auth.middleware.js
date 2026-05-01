const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/user.model");
const { HttpError } = require("../utils/http-error");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new HttpError(401, "Authentication required", "AUTH_REQUIRED"));
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next(new HttpError(401, "Invalid authorization format", "AUTH_INVALID_TOKEN"));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(new HttpError(500, "Server auth configuration missing", "INTERNAL_ERROR"));
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (mongoose.connection.readyState !== 1) {
      return next(new HttpError(503, "Database unavailable", "SERVICE_UNAVAILABLE"));
    }

    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (!user) {
      return next(new HttpError(401, "User not found for token", "AUTH_INVALID_TOKEN"));
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new HttpError(401, "Invalid or expired token", "AUTH_INVALID_TOKEN"));
    }

    return next(error);
  }
}

module.exports = {
  requireAuth,
};
