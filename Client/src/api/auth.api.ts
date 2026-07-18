import axios from 'axios';
import type { User } from '../store/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ─── Request: attach access token ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response: refresh on 401 ─────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('accessToken', data.accessToken);
        pendingQueue.forEach(({ resolve }) => resolve(data.accessToken));
        pendingQueue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        pendingQueue.forEach(({ reject }) => reject(refreshError));
        pendingQueue = [];
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

// ─── Auth API calls ────────────────────────────────────────────
export const authApi = {
  register: (data: { name?: string; email: string; password: string }) =>
    api.post<{ message: string }>('/auth/register', data),

  verifyEmail: (data: { email: string; otp: string }) =>
    api.post<{ user: User; accessToken: string }>('/auth/verify-email', data),

  resendOtp: (email: string) =>
    api.post<{ message: string }>('/auth/resend-otp', { email }),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; accessToken: string }>('/auth/login', data),

  logout: () =>
    api.post<{ message: string }>('/auth/logout'),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post<{ message: string }>('/auth/reset-password', data),
};

export default api;
