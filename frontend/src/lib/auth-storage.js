const authTokenKey = "agrisense.auth.token";

function getStoredToken() {
  return window.localStorage.getItem(authTokenKey);
}

function setStoredToken(token) {
  window.localStorage.setItem(authTokenKey, token);
}

function clearStoredToken() {
  window.localStorage.removeItem(authTokenKey);
}

export { authTokenKey, clearStoredToken, getStoredToken, setStoredToken };
