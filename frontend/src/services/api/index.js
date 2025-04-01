import axios from 'axios';
import { axiosConfig } from './config';

const apiClient = axios.create(axiosConfig);

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Modify requests here (e.g., add auth token)
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Handle errors globally
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;