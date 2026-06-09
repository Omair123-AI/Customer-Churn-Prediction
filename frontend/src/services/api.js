/**
 * api.js
 * ------
 * Centralised Axios-based API service layer.
 * All calls to the Flask backend go through this module.
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — add auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalise errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

// ── Prediction API ────────────────────────────────────────────────────────────
export const predictChurn = (customerData) =>
  api.post("/predict", customerData);

// ── Analytics API ─────────────────────────────────────────────────────────────
export const getDashboardData = () =>
  api.get("/analytics/dashboard");

export const getSummary = () =>
  api.get("/analytics/summary");

// ── Report API ────────────────────────────────────────────────────────────────
export const generateReport = async (customerData) => {
  const response = await axios.post(`${BASE_URL}/report/generate`, customerData, {
    responseType: "blob",
    timeout: 30000,
  });
  const url  = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href  = url;
  link.setAttribute("download", `churn_report_${customerData.customerID || "customer"}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ── Health check ──────────────────────────────────────────────────────────────
export const checkHealth = () => api.get("/health");

export default api;
