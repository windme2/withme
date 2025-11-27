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
    getOne: async (id: string) => {
        const response = await api.get(`/suppliers/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/suppliers', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/suppliers/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/suppliers/${id}`);
        return response.data;
    },
};

export const transactionsApi = {
    getAll: async (params?: any) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit) searchParams.append("limit", params.limit.toString());
        if (params?.type && params.type !== "all") searchParams.append("type", params.type);
        if (params?.search) searchParams.append("search", params.search);

        const response = await api.get(`/transactions?${searchParams.toString()}`);
        return response.data;
    },
};

export const purchasingApi = {
    getAll: async (params?: any) => {
        const searchParams = new URLSearchParams();
        if (params?.status && params.status !== "all") searchParams.append("status", params.status);
        if (params?.search) searchParams.append("search", params.search);

        const response = await api.get(`/purchasing/requisitions?${searchParams.toString()}`);
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get(`/purchasing/requisitions/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post("/purchasing/requisitions", data);
        return response.data;
    },
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/purchasing/requisitions/${id}/status`, { status });
        return response.data;
    },
};

export const purchaseOrdersApi = {
    getAll: async () => {
        const response = await api.get("/purchasing/orders");
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get(`/purchasing/orders/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post("/purchasing/orders", data);
        return response.data;
    },
};

export const dashboardApi = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },
    getRecentTransactions: async () => {
        const response = await api.get('/dashboard/transactions');
        return response.data;
    },
    getLowStockItems: async () => {
        const response = await api.get('/dashboard/low-stock');
        return response.data;
    },
};

export const salesOrdersApi = {
    getAll: async (status?: string, search?: string) => {
        const params = new URLSearchParams();
        if (status && status !== 'all') params.append('status', status);
        if (search) params.append('search', search);
        const response = await api.get(`/sales/orders?${params.toString()}`);
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get(`/sales/orders/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post("/sales/orders", data);
        return response.data;
    },
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/sales/orders/${id}/status`, { status });
        return response.data;
    },
};

export const customersApi = {
    getAll: async (search?: string, isActive?: string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (isActive && isActive !== 'all') params.append('isActive', isActive);
        const response = await api.get(`/customers?${params.toString()}`);
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post("/customers", data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/customers/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/customers/${id}`);
        return response.data;
    },
};

export const shipmentsApi = {
    getAll: async (status?: string, search?: string) => {
        const params = new URLSearchParams();
        if (status && status !== 'all') params.append('status', status);
        if (search) params.append('search', search);
        const response = await api.get(`/sales/shipments?${params.toString()}`);
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get(`/sales/shipments/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post("/sales/shipments", data);
        return response.data;
    },
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/sales/shipments/${id}/status`, { status });
        return response.data;
    },
};

export const returnsApi = {
    getAll: async (status?: string, search?: string) => {
        const params = new URLSearchParams();
        if (status && status !== 'all') params.append('status', status);
        if (search) params.append('search', search);
        const response = await api.get(`/sales/returns?${params.toString()}`);
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get(`/sales/returns/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post("/sales/returns", data);
        return response.data;
    },
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/sales/returns/${id}/status`, { status });
        return response.data;
    },
};

export const usersApi = {
    getMe: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
    updateMe: async (data: any) => {
        const response = await api.put('/users/me', data);
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },
};

export const notificationsApi = {
    getAll: async () => {
        const response = await api.get("/notifications");
        return response.data;
    },
    getUnreadCount: async () => {
        const response = await api.get("/notifications/unread-count");
        return response.data;
    },
    markAsRead: async (id: string) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await api.patch("/notifications/read-all");
        return response.data;
    },
};
