import axios from "axios";

export const api = axios.create({
  baseURL: "https://rayon.maafricapay.com",
  timeout: 60000,
});

// 🔐 Attach JWT + handle FormData
api.interceptors.request.use((config) => {
  // Use localStorage instead of sessionStorage
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let browser set multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]; 
  }

  return config;
});

// 🚪 Auto logout on auth failure
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("token"); // ✅ changed
      localStorage.removeItem("user");
      window.location.href = "/"; // redirect to login page
    }
    return Promise.reject(err);
  }
);

export default api;
