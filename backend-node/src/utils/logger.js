function writeLog(level, message, context = {}) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

function logInfo(message, context) {
  writeLog("info", message, context);
}

function logWarn(message, context) {
  writeLog("warn", message, context);
}

function logError(message, context) {
  writeLog("error", message, context);
}

module.exports = {
  logInfo,
  logWarn,
  logError,
};
