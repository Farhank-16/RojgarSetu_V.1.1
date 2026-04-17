import axios from 'axios';
import toast from 'react-hot-toast';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Supabase JWT token to every request
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url || '';

    if (status === 401 && !url.includes('/auth/') && !isLoggingOut) {
      // Only logout if it's not an admin/payment route
      // Admin now uses Supabase directly — 401 from old backend routes can be ignored
      const isAdminRoute = url.includes('/admin/');
      if (!isAdminRoute) {
        isLoggingOut = true;
        supabase.auth.signOut();
        if (window.location.pathname !== '/login') window.location.href = '/login';
        setTimeout(() => { isLoggingOut = false; }, 2000);
      }
    } else if (status === 403 && error.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
      toast.error('Please subscribe to access this feature');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  },
);

export default api;