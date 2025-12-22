import api from './axios';

// EXPLORE / SEARCH / FILTER
export const getBooksApi = (params) => api.get('/buku', { params });
export const getBookApi = (id) => api.get(`/buku/${id}`);

// DETAIL BUKU
export const getBookDetailApi = (id) => api.get(`/buku/${id}`);

// API untuk SEMUA USER (buyer, seller, admin)
             
export const getBookByIdApi = (id) => api.get(`/buku/${id}`);         
export const searchBooksApi = (query) => api.get(`/buku/search?q=${query}`);

// API untuk SELLER saja (hanya seller yang bisa akses)
export const getMyBooksApi = () => api.get('/buku/my');               
export const createBookApi = (data) => api.post('/buku', data);       
export const updateBookApi = (id, data) => api.put(`/buku/${id}`, data);
export const deleteBookApi = (id) => api.delete(`/buku/${id}`);       
export const publishBookApi = (id) => api.post(`/buku/${id}/publish`);
export const setBookGenreApi = (bookId, genres) => api.post(`/buku/${bookId}/genres`, { genres });

// UPLOAD COVER BUKU
export const uploadCoverApi = (id, file) => {
  const formData = new FormData();
  formData.append('cover', file);

  return api.post(`/buku/${id}/cover`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};