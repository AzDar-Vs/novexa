import api from './api';

const bookService = {
  getAll: async (params = {}) => {
    const res = await api.get('/buku', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/buku/${id}`);
    return res.data;
  },

  getBySlug: async (slug) => {
    const res = await api.get(`/buku/slug/${slug}`);
    return res.data;
  },

  create: async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => formData.append(`${key}[]`, v));
      } else {
        formData.append(key, val);
      }
    });

    const res = await api.post('/buku', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/buku/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/buku/${id}`);
    return res.data;
  },

  getChapters: async (bookId) => {
    const res = await api.get(`/bab/book/${bookId}`);
    return res.data;
  },
};

export default bookService;
