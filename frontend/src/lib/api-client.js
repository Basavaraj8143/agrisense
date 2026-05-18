class ApiError extends Error {
  constructor(message, statusCode, details = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const defaultBaseUrl = "http://127.0.0.1:4000";
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;
const apiBaseUrl = configuredBaseUrl.replace(/\/$/, "");

async function apiRequest(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || "Request failed",
      response.status,
      payload?.error?.details || []
    );
  }

  return payload;
}

function toFieldErrors(details = []) {
  return details.reduce((accumulator, detail) => {
    if (!detail?.field || !detail?.issue) {
      return accumulator;
    }

    accumulator[detail.field] = detail.issue;
    return accumulator;
  }, {});
}

export const authApi = {
  async login(credentials) {
    const payload = await apiRequest("/api/auth/login", {
      method: "POST",
      body: credentials,
    });

    return payload.data;
  },

  async register(userData) {
    const payload = await apiRequest("/api/auth/register", {
      method: "POST",
      body: userData,
    });

    return payload.data;
  },

  async me(token) {
    const payload = await apiRequest("/api/auth/me", {
      token,
    });

    return payload.data;
  },
};

export const cropApi = {
  async recommend(payload, token) {
    const response = await apiRequest("/api/crop/recommend", {
      method: "POST",
      body: payload,
      token,
    });

    return response.data;
  },
};

export { ApiError, apiBaseUrl, toFieldErrors };
