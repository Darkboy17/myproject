// src/services/api/index.js
import axios from 'axios';
import { axiosConfig } from './config';

const apiClient = axios.create(axiosConfig);

// Request interceptor
apiClient.interceptors.request.use(config => {
  console.log('Request URL:', config.baseURL + config.url);
  return config;
}); 

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.status, error.config.url);
    return Promise.reject(error);
  }
);

export default apiClient;