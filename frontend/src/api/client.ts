// frontend/src/api/client.ts
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL;

if (!BASE) {
  console.warn("⚠️ VITE_API_BASE_URL is missing — API calls may fail.");
}

export const apiClient = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true, // keep true if backend uses cookies
});
