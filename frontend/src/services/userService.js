import api from './api';

const userService = {
  getAll: async () => {
    const res = await api.get('/users');
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  updateRole: async (id, role) => {
    const res = await api.patch(`/users/${id}/role`, { role });
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

export default userService;
