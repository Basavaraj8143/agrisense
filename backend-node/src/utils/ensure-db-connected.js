const { getDbState, isDbConnected } = require("../db/connect");
const { HttpError } = require("./http-error");

function ensureDbConnected() {
  if (!isDbConnected()) {
    const state = getDbState();
    throw new HttpError(503, "Database unavailable", "SERVICE_UNAVAILABLE", [
      { field: "database", issue: state.lastError || "No active PostgreSQL connection" },
    ]);
  }
}

module.exports = {
  ensureDbConnected,
};
