import axios from "axios";

export const api = axios.create({
  baseURL: "https://olee.maafricapay.com",
  timeout: 60000,
});

// 🔐 Attach JWT + handle FormData
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token"); // ✅ changed

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
      sessionStorage.removeItem("token"); // ✅ changed
      sessionStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;
