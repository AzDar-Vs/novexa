import api from './api';

const categoryService = {
  getGenres: () =>
    api.get('/categories/genres')
};

export default categoryService;
