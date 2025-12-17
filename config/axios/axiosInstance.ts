import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";
import { BASE_URL } from "../constant/baseUrl";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
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
      console.log("Authentication failed -> Logging out user");

      // Clear all authentication data
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("ra_auth");

      // Redirect to login page
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;