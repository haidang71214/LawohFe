import axios from "axios";
import { LOGIN_USER } from "./constants/enum";
import { notifyRateLimit } from "@/utils/rateLimitToast";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3300/api/v1";
export const URL_SOCKET = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3300";
export const axiosInstance = axios.create({
   baseURL: `${BASE_URL}`,
});

// Add a request interceptor to include the Bearer token in all requests
axiosInstance.interceptors.request.use(
   (config:any) => {
      const token = localStorage.getItem(LOGIN_USER);
      if (token) {
         config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
   },
   (error) => Promise.reject(error)
);
// acesstoken / resetToken / 7d
// Function to extend the token when expired
const extendToken = async () => {
   try {
      const { data } = await axiosInstance.post(
         `/auth/refresh-token`,
         {},
         { withCredentials: true }
      );
      return data?.data?.accessToken || data?.accessToken || data?.newAccessToken;
   } catch {
   
   }
};

// Add a response interceptor to handle token renewal on 401 responses and rate limiting on 429
axiosInstance.interceptors.response.use(
   (response) => response, // Pass successful responses through
   async (error) => {
      // Global HTTP 429 Rate Limit toast handling
      if (error.response?.status === 429) {
         notifyRateLimit(error.response?.data);
      }

      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true; // Avoid infinite retries
         try {
            const newAccessToken = await extendToken();
            if (newAccessToken) {
               localStorage.setItem(LOGIN_USER, newAccessToken); // Save new token
               originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
               return axiosInstance(originalRequest); // Retry the original request
            }
         } catch (err) {
            console.log("Token renewal failed:", err);
         }
      }

      return Promise.reject(error); // Reject other errors
   }
);

// Fetch generic data from the API
export const fetchFromAPI = async (url:any) => {
   try {
      const { data } = await axiosInstance.get(url);
      return data;
   } catch (error) {
      console.error("Error fetching from API:", error);
      throw error;
   }
};

// Fetch all banners
export const getAllBanner = async () => {
   try {
      const { data } = await axiosInstance.get("/Banner/getAllBanner");
      return data;
   } catch (error) {
      console.error("Error fetching banners:", error);
      throw error;
   }
};