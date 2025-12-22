import api from './axios';

export const getOrdersApi = () => api.get('/orders');
export const getOrderDetailApi = (id) => api.get(`/orders/${id}`);