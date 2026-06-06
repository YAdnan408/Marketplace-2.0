import axios from "axios";

// ── Axios instance ────────────────────────────────────────────────────────────
// withCredentials: true — tells the browser to send httpOnly cookies on every
// request, including cross-origin ones. This is what replaces the manual
// Authorization header that we used before.

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// ── Axios response interceptor ────────────────────────────────────────────────
// If any request returns 401 (access token expired), automatically call
// /api/refresh to get a new access token cookie, then retry the original request.
// If refresh also fails (refresh token expired), the user must log in again.

let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and only once per request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh") &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/signup")
    ) {
      if (isRefreshing) {
        // Queue requests that arrive while a refresh is already in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth endpoints ────────────────────────────────────────────────────────────
// These functions interact with auth-related API endpoints.

export async function signup(data) {
  const res = await api.post("/signup", data);
  return res.data;
}

export async function login(data) {
  const res = await api.post("/login", data);
  return res.data;
}

export async function logoutUser() {
  const res = await api.post("/logout");
  return res.data;
}

export async function refreshToken() {
  const res = await api.post("/refresh");
  return res.data;
}

export async function getMe() {
  const res = await api.get("/me");
  return res.data;
}

// ── Profile endpoints ─────────────────────────────────────────────────────────

export async function getProfile() {
  const res = await api.get("/profile");
  return res.data;
}

export async function updateProfile(data) {
  const res = await api.put("/profile", data);
  return res.data;
}

export async function uploadProfileImage(file) {
  const form = new FormData();
  form.append("image", file);
  const res = await api.post("/profile/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export default api;