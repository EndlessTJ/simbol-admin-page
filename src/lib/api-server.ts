'use server'
import axios, { AxiosError } from 'axios';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const serverRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'x-server-request': 'true' // 标识服务端请求
  }
});


const setRequestHeader = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');
  serverRequest.defaults.headers.common['Authorization'] = `Bearer ${token?.value}`;
}

export const requestGet = async (url: string, params?: unknown) => {
  try {
    setRequestHeader();
    const response = await serverRequest.get(url, { params });
    if (response.status === 401) {
      redirect('/login');
    }
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        redirect('/login');
      }
    }
    throw error;
  }

}

export const requestPost = async (url: string, data: unknown) => {
  try {
    setRequestHeader();
    const response = await serverRequest.post(url, data);
    if (response.status === 401) {
      redirect('/login');
    }
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        redirect('/login');
      }
    }
    throw error;
  }

}

export default serverRequest;