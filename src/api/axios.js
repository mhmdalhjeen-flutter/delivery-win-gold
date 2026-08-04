import axios from 'axios';
import { API_URL } from '../lib/apiUrl';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('deliveryToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('deliveryToken');
      localStorage.removeItem('deliveryUser');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
