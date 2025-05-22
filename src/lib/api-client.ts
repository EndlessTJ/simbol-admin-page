"use client";
import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { ApiError } from "./error-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
// 请求拦截：自动添加 Authorization Token :contentReference[oaicite:2]{index=2}
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：统一处理后端格式，抛出 ApiError :contentReference[oaicite:3]{index=3}
axiosInstance.interceptors.response.use(
  (response) => {
    const { status, code, message, data } = response.data;
    if (!status) {
      // 后端业务返回失败，抛出业务错误
      throw new ApiError(message || "Service Error", code || 500);
    }
    return data; // 只返回 data 部分，简化调用
  },
  (error) => {
    if (error.response.status === 401) {
      // 清除本地登录状态
      Cookies.remove("accessToken");
      // 跳转到登录页
      window.location.href = "/login";
      return Promise.reject(new ApiError("Unauthorized", 401));
      // location.href = "/login";
      // return axios.request(error.config);
    }
  // 网络或 HTTP 错误
  if (error.response) {
    const { status, data } = error.response;
    // 后端可能返回同样格式的错误 body
    if (data && typeof data === 'object') {
      throw new ApiError(data.message || 'Request Failed', status);
    }
    throw new ApiError(error.message, status);
  }
  // 无响应（网络错误、超时等）
  throw new ApiError(error.message, 0);
  }
);

// 封装get请求方法
export const requestGet = async <T>(url: string, params?: unknown): Promise<T> =>  await axiosInstance.get(url, { params });


// 封装post请求方法
export const requestPost = async <T>(url: string, data: unknown): Promise<T> =>  await axiosInstance.post(url, data);


// 封装put请求方法
export const requestPut = async <T>(url: string, data: unknown): Promise<T> => await axiosInstance.put(url, data);


// 封装put请求方法
export const requestDelete = async <T>(url: string, params?: unknown): Promise<T> =>  await axiosInstance.delete(url, { params });


export default axiosInstance;
