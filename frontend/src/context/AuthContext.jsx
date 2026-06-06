import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, logoutUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Application auth state
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true); // true while checking session on mount

  // ── Restore session on page load / refresh ────────────────────────────────
  // Call GET /api/me on mount. If the access token cookie is still valid,
  // the backend returns the user payload and we restore the session silently.
  // If the access token is expired, the Axios interceptor in auth.js will
  // automatically call POST /api/refresh using the refresh token cookie,
  // get a new access token cookie, and retry GET /api/me transparently.
  // Only if both tokens are expired will the user be redirected to login.

  useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  // Called after a successful POST /api/login or POST /api/signup.
  // Cookies are already set by the backend response — we just store the
  // user payload in React state for the rest of the session.

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  // Calls POST /api/logout to clear both cookies on the backend, then
  // clears user state locally.

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Even if the request fails, clear local state
    } finally {
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}