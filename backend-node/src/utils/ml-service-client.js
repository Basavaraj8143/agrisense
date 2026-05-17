const { HttpError } = require("./http-error");
const { logWarn } = require("./logger");

const defaultBaseUrl = "http://127.0.0.1:5000";

function readNumber(envName, fallbackValue, { minimum = 0 } = {}) {
  const rawValue = process.env[envName];

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return fallbackValue;
  }

  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue) || numericValue < minimum) {
    return fallbackValue;
  }

  return numericValue;
}

function getBaseUrl() {
  return (process.env.ML_SERVICE_BASE_URL || defaultBaseUrl).replace(/\/$/, "");
}

function getTimeoutMs() {
  return readNumber("ML_SERVICE_TIMEOUT_MS", 10000, { minimum: 1 });
}

function getRetryCount() {
  return readNumber("ML_SERVICE_RETRY_COUNT", 1, { minimum: 0 });
}

function getRetryDelayMs() {
  return readNumber("ML_SERVICE_RETRY_DELAY_MS", 250, { minimum: 0 });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildServiceUrl(path) {
  return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildUnavailableError(message, requestId, issue) {
  return new HttpError(503, message, "ML_SERVICE_UNAVAILABLE", [
    { field: "mlService", issue },
    { field: "requestId", issue: requestId },
  ]);
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
}

function mapErrorFromResponse(response, payload, requestId) {
  const message =
    payload?.message ||
    (response.status >= 500 ? "ML service is temporarily unavailable" : "ML service request failed");
  const code =
    payload?.error?.code ||
    (response.status >= 500 ? "ML_SERVICE_UNAVAILABLE" : "UPSTREAM_REQUEST_FAILED");
  const details = Array.isArray(payload?.error?.details)
    ? payload.error.details
    : [{ field: "mlService", issue: payload?.message || `HTTP ${response.status}` }];

  return new HttpError(response.status, message, code, [
    ...details,
    { field: "requestId", issue: requestId },
  ]);
}

function isRetryableStatus(statusCode) {
  return statusCode >= 500;
}

function isRetryableError(error) {
  if (error instanceof HttpError) {
    return isRetryableStatus(error.statusCode);
  }

  return error?.name === "AbortError" || error?.name === "TimeoutError" || error?.cause?.code === "ECONNREFUSED";
}

async function requestMlService({ path, method = "POST", headers = {}, body, requestId, operationName }) {
  const url = buildServiceUrl(path);
  const timeoutMs = getTimeoutMs();
  const retryCount = getRetryCount();
  const retryDelayMs = getRetryDelayMs();
  let lastError;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const startedAt = Date.now();

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...headers,
          "X-Request-Id": requestId,
        },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
      const latencyMs = Date.now() - startedAt;
      const payload = await parseResponseBody(response);

      if (!response.ok) {
        const mappedError = mapErrorFromResponse(response, payload, requestId);

        if (attempt < retryCount && isRetryableStatus(response.status)) {
          logWarn("Retrying ML service request after upstream failure", {
            requestId,
            operationName,
            attempt: attempt + 1,
            statusCode: response.status,
            latencyMs,
          });
          await sleep(retryDelayMs);
          continue;
        }

        throw mappedError;
      }

      return {
        payload,
        latencyMs,
        upstreamRequestId: payload?.meta?.requestId || null,
      };
    } catch (error) {
      lastError =
        error instanceof HttpError
          ? error
          : buildUnavailableError(
              "ML service is temporarily unavailable",
              requestId,
              error?.message || "Unknown network error"
            );

      if (attempt < retryCount && isRetryableError(error)) {
        logWarn("Retrying ML service request after network/timeout failure", {
          requestId,
          operationName,
          attempt: attempt + 1,
          issue: error?.message || "Unknown network error",
        });
        await sleep(retryDelayMs);
        continue;
      }

      break;
    }
  }

  throw lastError || buildUnavailableError("ML service is temporarily unavailable", requestId, "Unknown failure");
}

module.exports = {
  requestMlService,
};
