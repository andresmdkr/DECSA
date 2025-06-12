import axios from 'axios';
import store from '../store.js';
import { logout } from './authSlice.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;


    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        console.log('🔁 Intentando refrescar token...');

        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, null, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const newToken = refreshResponse.data.token;
        localStorage.setItem('token', newToken);
        originalRequest.headers.Authorization = 'Bearer ' + newToken;
        console.log('✅ Token refrescado exitosamente');


        processQueue(null, newToken);
        return api(originalRequest);

      } catch (refreshError) {
        console.error('⛔ Falló el refresh del token', refreshError);
        processQueue(refreshError, null);
        store.dispatch(logout());
        window.location.hash = '#/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      alert('No tiene permisos para realizar esta acción.');
    } else if (error.response?.status >= 500) {
      console.error('Error del servidor:', error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);


export default api;
