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

export const exportOrders = async () => {
  const response = await api.get('/orders/export/orders', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'orders.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportRevenue = async () => {
  const response = await api.get('/orders/export/revenue', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'revenue.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};