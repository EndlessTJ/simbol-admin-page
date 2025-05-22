"use server";
import axios, { AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "./error-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "x-server-request": "true", // 标识服务端请求
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token?.value}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    const { status, code, message, data } = response.data;
    if (!status) {
      // 后端业务返回失败，抛出业务错误
      throw new ApiError(message || "Service Error", code || 500);
    }
    return data; // 只返回 data 部分，简化调用
  },
  async (error) => {
    if (error.response.status === 401) {
      const cookieStore = await cookies();
      // 清除本地登录状态
      cookieStore.delete("accessToken");
      // 跳转到登录页
      redirect("/login");
      return Promise.reject(new ApiError("Unauthorized", 401));
    }
    // 网络或 HTTP 错误
    if (error.response) {
      const { status, data } = error.response;
      // 后端可能返回同样格式的错误 body
      if (data && typeof data === "object") {
        throw new ApiError(data.message || "Request Failed", status);
      }
      throw new ApiError(error.message, status);
    }
    // 无响应（网络错误、超时等）
    throw new ApiError(error.message, 0);
  }
);

// const setRequestHeader = async () => {
//   const cookieStore = await cookies();
//   const token = cookieStore.get('accessToken');
//   serverRequest.defaults.headers.common['Authorization'] = `Bearer ${token?.value}`;
// }

export const requestGet = async <T>(url: string, params?: unknown): Promise<T> => await axiosInstance.get(url, { params });


export const requestPost = async <T>(url: string, data: unknown): Promise<T> =>await axiosInstance.post(url, data);


export default axiosInstance;
