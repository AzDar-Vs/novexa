import api from './axios';

export const createReviewApi = (data) =>
  api.post('/reviews', data);

export const getReviewsByBookApi = (bookId) =>
  api.get(`/reviews/book/${bookId}`);