import api from './api';

const cartService = {
  get: async () => {
    const res = await api.get('/keranjang');
    return res.data;
  },

  add: async (bookId) => {
    const res = await api.post('/keranjang/add', { book_id: bookId });
    return res.data;
  },

  remove: async (bookId) => {
    const res = await api.delete(`/keranjang/remove/${bookId}`);
    return res.data;
  },

  clear: async () => {
    const res = await api.delete('/keranjang/clear');
    return res.data;
  },

  checkout: async (payload) => {
    const res = await api.post('/keranjang/checkout', payload);
    return res.data;
  },
};

export default cartService;
