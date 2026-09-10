import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  if (localStorage.token) {
    config.headers.Authorization = `Bearer ${localStorage.token}`;
  }
  return config;
});

export default api;
