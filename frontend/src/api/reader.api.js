import api from './axios';

export const getChaptersApi = (bookId) =>
  api.get(`/reader/book/${bookId}`);

export const readChapterApi = (babId) =>
  api.get(`/reader/chapter/${babId}`);