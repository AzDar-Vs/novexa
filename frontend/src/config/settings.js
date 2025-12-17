const settings = {
  APP_NAME: 'Digital Book Store',

  API_URL:
    process.env.REACT_APP_API_URL ||
    'http://localhost:3000/api',

  PAGINATION: {
    DEFAULT_PAGE: 1,
    PER_PAGE: 10,
  },

  UPLOADS: {
    AVATAR_URL: '/uploads/avatars/',
    BOOK_COVER_URL: '/uploads/book-covers/',
  },
};

export default settings;
