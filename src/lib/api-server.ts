'use server'
import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const serverRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'x-server-request': 'true' // 标识服务端请求
  }
});

serverRequest.interceptors.request.use(async (config) => {

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');
  config.headers.Authorization = `Bearer ${token?.value}`;
  return config;
});

serverRequest.interceptors.response.use(null, async (error) => {
  if (error.response.status === 401) {
    Promise.reject(error);
    redirect('/login');
  }
  return Promise.reject(error);
});


// const setRequestHeader = async () => {
//   const cookieStore = await cookies();
//   const token = cookieStore.get('accessToken');
//   serverRequest.defaults.headers.common['Authorization'] = `Bearer ${token?.value}`;
// }

export const requestGet = async (url: string, params?: unknown) => {
  try {
    const response = await serverRequest.get(url, { params });
    return response.data;
  } catch (error: unknown) {
    throw error;
  }

}

export const requestPost = async (url: string, data: unknown) => {
  try {
    // setRequestHeader();
    const response = await serverRequest.post(url, data);

    return response.data;
  } catch (error: unknown) {
    // if (error instanceof AxiosError) {
    //   if (error.response?.status === 401) {
    //     redirect('/login');
    //   }
    // }
    throw error;
  }

}

export default serverRequest;