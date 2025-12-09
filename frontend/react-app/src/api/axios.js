// src/api/axios.js
import axios from "axios";
import { navigateTo } from "../utils/navigation";
import { setAccessTokenMemory, getAccessTokenMemory } from "./tokenStore";

const API = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// ------------------------------
// REQUEST INTERCEPTOR
// ------------------------------
api.interceptors.request.use(
  (config) => {
    const token = getAccessTokenMemory();
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------
// RESPONSE INTERCEPTOR
// ------------------------------
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    if (!error.response) return Promise.reject(error);

    const msg = error.response.data?.message;

    if (
      error.response.status === 401 &&
      msg === "ACCESS_TOKEN_EXPIRED" &&
      !original._retry
    ) {
      original._retry = true;

      try {
        const refresh = await axios.get(`${API}/api/auth/refresh`, {
          withCredentials: true,
        });

        const newAccess = refresh.data.accessToken;
        setAccessTokenMemory(newAccess);

        original.headers = original.headers || {};
        original.headers["Authorization"] = `Bearer ${newAccess}`;

        return api(original);
      } catch (refreshError) {
        console.log("🔴 Refresh failed → redirecting to login");
        navigateTo("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
