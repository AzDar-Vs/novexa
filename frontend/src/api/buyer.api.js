import api from './axios';

/* DASHBOARD */
export const getBuyerDashboardApi = () => {
  return api.get('/buyer/dashboard');
};

// Library
export const getBuyerLibraryApi = (params) => api.get('/buyer/library', { params });

// Reading History
export const getBuyerReadingHistoryApi = (params) => api.get('/buyer/reading-history', { params });

// Reviews
export const getBuyerReviewsApi = (params) => api.get('/buyer/reviews', { params });
export const addBuyerReviewApi = (data) => api.post('/buyer/reviews', data);
export const deleteBuyerReviewApi = (reviewId) => api.delete(`/buyer/reviews/${reviewId}`);

// Reading Progress
export const updateReadingProgressApi = (data) => api.post('/buyer/reading-progress', data);
/* CART */
export const getCartApi = () => {
  return api.get('/buyer/cart');
};

/* CHECKOUT */
export const checkoutApi = () => {
  return api.post('/buyer/checkout');
};

/* ORDERS */
export const getOrdersApi = () => {
  return api.get('/buyer/orders');
};

export const getOrderDetailApi = (id) => {
  return api.get(`/buyer/orders/${id}`);
};

/* REVIEW */
export const createReviewApi = (data) => {
  return api.post('/reviews', data);
};