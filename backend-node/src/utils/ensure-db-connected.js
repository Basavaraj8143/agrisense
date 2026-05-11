const mongoose = require("mongoose");

const { HttpError } = require("./http-error");

function ensureDbConnected() {
  if (mongoose.connection.readyState !== 1) {
    throw new HttpError(503, "Database unavailable", "SERVICE_UNAVAILABLE");
  }
}

module.exports = {
  ensureDbConnected,
};
