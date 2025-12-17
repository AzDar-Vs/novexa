import api from './api';

const reviewService = {
  getByBook: async (bookId) => {
    const res = await api.get(`/reviews/book/${bookId}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/reviews', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/reviews/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },
};

export default reviewService;
