import axios from "axios";

export const api = axios.create({
  baseURL: "https://rayon.maafricapay.com",
  timeout: 60000,
});

// 🔐 Attach JWT + handle FormData
api.interceptors.request.use((config) => {
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
    const status = err.response?.status;

    // redirect when login credentials are wrong
   

    if ((status === 401 || status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Send authenticated users to Sign In
      window.location.href = "/auth/signin";
    }

    return Promise.reject(err);
  }
);

export default api;