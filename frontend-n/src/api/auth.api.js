import api from './axios';

export const loginApi = (data) => {
  return api.post('/auth/login', data);
};

export const registerApi = (data) => {
  return api.post('/auth/register', data);
};

export const getMeApi = () => {
  return api.get('/auth/me');
};
