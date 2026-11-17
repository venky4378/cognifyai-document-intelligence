import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const normalizedBaseUrl = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL: normalizedBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return data?.message || data?.error || error?.message || fallback;
}

export async function registerUser(details) {
  const response = await api.post("/auth/register", details);
  return response.data;
}

export async function loginUser(credentials) {
  const response = await api.post("/auth/login", credentials);
  return response.data;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/documents/upload", formData);
  return response.data;
}

export async function getDocuments() {
  const response = await api.get("/documents");
  return response.data;
}

export async function deleteDocument(documentId) {
  await api.delete(`/documents/${documentId}`);
}

export async function sendForgotPasswordOtp(email) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}
export async function resetPasswordWithOtp(email, otp, newPassword) {
  const response = await api.post("/auth/reset-password-otp", { email, otp, newPassword });
  return response.data;
}

export async function askQuestion(question) {
  const response = await api.post("/documents/ask", { question });
  return response.data;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-expired"));
    }

    return Promise.reject(error);
  },
);

export default api;
