'use client'
import axios from 'axios';
import Cookies from 'js-cookie';

const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

request.interceptors.request.use(async (config) => {
  const token = Cookies.get('accessToken');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});


request.interceptors.response.use(null, async (error) => {
  if (error.response.status === 401) {
    location.href = '/login';
    return axios.request(error.config);
  }
  return Promise.reject(error);
});

// 封装get请求方法
export const requestGet = async (url: string, params?: unknown) => {
  const response = await request.get(url, { params });
  return response.data;
}

// 封装post请求方法
export const requestPost = async (url: string, data: unknown) => {
  const response = await request.post(url, data);
  return response.data;
}


export default request;