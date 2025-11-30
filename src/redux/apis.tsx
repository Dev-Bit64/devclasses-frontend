/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { handleLogout } from "../utils/auth";
// import { useDispatch } from "react-redux";

const endPoint = import.meta.env.VITE_REACT_APP_API_ENDPOINT;

// Create axios instance
const axiosInstance = axios.create();

const path = window.location.pathname;

// Add response interceptor to handle 401 unauthorized
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (path !== "/") {
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
