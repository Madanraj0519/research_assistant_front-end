import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";
import { BASE_URL } from "../constant/baseUrl";
import { getCookie, deleteCookie } from "../../utils/cookie";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie("access_token");
    console.log("Axios Request Interceptor - URL:", config.url, "Token present:", !!token);
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle authentication failures (401) and forbidden access (403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log("Authentication failed - Status:", error.response.status, "URL:", error.config?.url, "-> Logging out user");

      // Clear all authentication data
      deleteCookie("access_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("ra_auth");

      // Redirect to login page
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;