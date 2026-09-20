import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:5000/api"
      : "https://krishilink-backend-lovat.vercel.app/api"),
});

api.interceptors.request.use((config) => {
  if (localStorage.token) {
    config.headers.Authorization = `Bearer ${localStorage.token}`;
  }
  return config;
});

export default api;
