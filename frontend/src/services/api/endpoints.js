// src/services/api/endpoints.js
import apiClient from './index';

export const itemsService = {
    getAll: () => apiClient.get('/api/items/'),
    getById: (id) => apiClient.get(`/api/items/${id}/`),
    create: (data) => apiClient.post('/api/items/', data),
    update: (id, data) => apiClient.put(`/api/items/${id}/`, data),
    delete: (id) => apiClient.delete(`/api/items/${id}/`)
};