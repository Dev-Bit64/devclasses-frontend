/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { handleLogout } from "../utils/auth";
import { encryptData } from "../utils/cryptoHelper";
import { APIEndpoints } from "../constants/constants";

const endPoint = import.meta.env.VITE_REACT_APP_API_ENDPOINT;

// Endpoints reachable while logged out — a 401 here means bad credentials, not an expired session
const PUBLIC_AUTH_ENDPOINTS: string[] = [
  APIEndpoints.LOGIN,
  APIEndpoints.REGISTER,
  APIEndpoints.ForgotPasswordMail,
  APIEndpoints.ResetPassword,
];

// Create axios instance
const axiosInstance = axios.create();

// Intercept outgoing requests to encrypt payload if conditions are met
axiosInstance.interceptors.request.use(
  async (config) => {
    const contentType = config.headers?.["Content-Type"] || config.headers?.["content-type"];
    const isMultipart = typeof contentType === "string" && contentType.includes("multipart/form-data");

    if (config.data && !isMultipart && config.method !== "get" && config.method !== "GET") {
      try {
        const encrypted = await encryptData(config.data);
        config.data = { payload: encrypted };
        config.headers["x-payload-encrypted"] = "true";
      } catch (err) {
        console.error("Payload encryption failed:", err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 unauthorized
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check both standard HTTP status and standardized API statusCode
    if (error.response?.status === 401 || error.response?.data?.statusCode === 401) {
      // Let the public auth forms surface their own error instead of forcing a logout redirect
      const requestUrl = error.config?.url || "";
      const isPublicAuthRequest = PUBLIC_AUTH_ENDPOINTS.some((path) => requestUrl.includes(path));

      // Access path dynamically to avoid static freeze at page load
      if (!isPublicAuthRequest && window.location.pathname !== "/") {
        handleLogout();
      }
    }
    return Promise.reject(error);
  }
);

const apiConfig = (flag = false, params?: any, responseType: any = "json") => {
  if (localStorage.getItem("accessToken")) {
    return {
      params: params,
      responseType: responseType,
      headers: {
        Authorization: `bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": flag ? "multipart/form-data" : "application/json",
      },
      method: "PUT,DELETE,POST,GET,OPTION",
    };
  }
  return { withCredentials: false };
};

export const getApi = (url?: string, params?: any) => {
  return axiosInstance.get(`${endPoint}${url}`, {
    ...apiConfig(false, params),
  });
};

export const postApi = (url: string, apiData?: any, flag?: boolean) => {
  return axiosInstance.post(`${endPoint}${url}`, apiData, apiConfig(flag));
};

export const putApi = (url: string, apiData: any, flag?: boolean) => {
  return axiosInstance.put(`${endPoint}${url}`, apiData, apiConfig(flag));
};

export const postApiBlob = (url: string, apiData?: any) => {
  return axiosInstance.post(
    `${endPoint}${url}`,
    apiData,
    apiConfig(false, null, "blob") // <-- IMPORTANT
  );
};

export const patchApi = (url: string, apiData: any, flag?: boolean) => {
  return axiosInstance.patch(`${endPoint}${url}`, apiData, apiConfig(flag));
};

/**
 * Helper function to make DELETE requests with optional request body
 * 
 * @param url - API endpoint
 * @param data - Optional body data (e.g. { userIds: [...] })
 */
export const deleteApi = (url: string, data?: any) => {
  return axiosInstance.delete(`${endPoint}${url}`, {
    ...apiConfig(),
    data, // axios requires body data to be passed under `data` key
  });
};
