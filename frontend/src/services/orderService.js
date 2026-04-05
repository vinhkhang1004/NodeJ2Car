import api from './api';

export const fetchOrders = async () => {
    return await api.get('/orders');
};

export const fetchOrderById = async (id) => {
    return await api.get(`/orders/${id}`);
};

export const updateOrderStatus = async (id, status) => {
    return await api.put(`/orders/${id}/status`, { status });
};

export const deliverOrder = async (id) => {
    return await api.put(`/orders/${id}/deliver`);
};

export const fetchMyOrders = async () => {
    return await api.get('/orders/myorders');
};

export const createOrder = async (orderData) => {
    return await api.post('/orders', orderData);
};
