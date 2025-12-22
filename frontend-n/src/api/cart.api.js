import api from './axios';

// API untuk keranjang belanja
export const addToCartApi = (bookId, quantity = 1) => {
  return api.post('/cart/add', { bookId, quantity });
};

export const removeFromCartApi = (bookId) => {
  return api.delete(`/cart/remove/${bookId}`);
};

export const getCartApi = () => {
  return api.get('/cart');
};

export const updateCartItemApi = (bookId, quantity) => {
  return api.put(`/cart/update/${bookId}`, { quantity });
};

export const clearCartApi = () => {
  return api.delete('/cart/clear');
};

export const checkoutApi = (checkoutData) => {
  return api.post('/cart/checkout', checkoutData);
};

export const getOrderHistoryApi = () => {
  return api.get('/orders/history');
};

export const getOrderDetailApi = (orderId) => {
  return api.get(`/orders/${orderId}`);
};

export const checkIfInCartApi = (bookId) => {
  return api.get(`/cart/check/${bookId}`);
};

export const getCartItemDetailApi = (itemId) => {
  return api.get(`/cart/item/${itemId}/detail`);
};