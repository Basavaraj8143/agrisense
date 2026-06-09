import { createContext, useContext, useEffect, useState } from "react";

import { authApi } from "../lib/api-client";
import { clearStoredToken, getStoredToken, setStoredToken } from "../lib/auth-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(token ? "checking" : "idle");

  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      if (!token) {
        setUser(null);
        setStatus("idle");
        return;
      }

      setStatus("checking");

      try {
        const profile = await authApi.me(token);

        if (!isCancelled) {
          setUser(profile);
          setStatus("authenticated");
        }
      } catch (error) {
        if (!isCancelled) {
          clearStoredToken();
          setToken(null);
          setUser(null);
          setStatus("idle");
        }
      }
    }

    bootstrap();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  async function login(credentials) {
    const response = await authApi.login(credentials);
    setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
    setStatus("authenticated");
    return response;
  }

  async function register(payload) {
    const response = await authApi.register(payload);
    setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
    setStatus("authenticated");
    return response;
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setStatus("idle");
  }

  function updateUser(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        status,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return value;
}
