import api from './api';

const transactionService = {
  getAll: async (params = {}) => {
    const res = await api.get('/transaksi', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/transaksi/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post('/transaksi', payload);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/transaksi/${id}/status`, { status });
    return res.data;
  },
};

export default transactionService;
