import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
};

export const inventoryApi = {
    getAll: async () => {
        const response = await api.get('/inventory');
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/inventory/${id}`, data);
        return response.data;
    },
};

export const goodsReceivedApi = {
    getAll: async (status?: string, search?: string) => {
        const params = new URLSearchParams();
        if (status && status !== 'all') params.append('status', status);
        if (search) params.append('search', search);
        const response = await api.get(`/goods-received?${params.toString()}`);
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get(`/goods-received/${id}`);
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/goods-received/stats');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/goods-received', data);
        return response.data;
    },
};

export const adjustmentsApi = {
    getAll: async (type?: string, search?: string) => {
        const params = new URLSearchParams();
        if (type && type !== 'all') params.append('type', type);
        if (search) params.append('search', search);
        const response = await api.get(`/adjustments?${params.toString()}`);
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get(`/adjustments/${id}`);
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/adjustments/stats');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/adjustments', data);
        return response.data;
    },
};

export const suppliersApi = {
    getAll: async () => {
        const response = await api.get('/suppliers');
        return response.data;
    },
};
