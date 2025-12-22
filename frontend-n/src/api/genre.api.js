import api from './axios';

export const getGenresApi = () => api.get('/genre');