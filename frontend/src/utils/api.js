import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear auth and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Events APIs
export const eventsAPI = {
    getAll: () => api.get('/events'),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
};

// Swaps APIs
export const swapsAPI = {
    getSwappableSlots: () => api.get('/swaps/swappable-slots'),
    createRequest: (data) => api.post('/swaps/request', data),
    getRequests: () => api.get('/swaps/requests'),
    respondToRequest: (requestId, accept) =>
        api.post(`/swaps/response/${requestId}`, { accept }),
};

export default api;

// ============================================
// FILE: frontend/src/utils/helpers.js
// ============================================
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatDateTime = (dateString) => {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'BUSY':
            return 'badge-busy';
        case 'SWAPPABLE':
            return 'badge-swappable';
        case 'SWAP_PENDING':
            return 'badge-pending';
        default:
            return 'badge-busy';
    }
};

export const getStatusText = (status) => {
    switch (status) {
        case 'BUSY':
            return 'Busy';
        case 'SWAPPABLE':
            return 'Swappable';
        case 'SWAP_PENDING':
            return 'Swap Pending';
        default:
            return status;
    }
};