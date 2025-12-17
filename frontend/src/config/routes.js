export const ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  BUYER: 'buyer',
};

export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    BROWSE: '/browse',
    BOOK_DETAIL: '/books/:slug',
    LOGIN: '/login',
    REGISTER: '/register',
  },

  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    BOOKS: '/admin/books',
    TRANSACTIONS: '/admin/transactions',
    CATEGORIES: '/admin/categories',
  },

  SELLER: {
    DASHBOARD: '/seller/dashboard',
    BOOKS: '/seller/books',
    ADD_BOOK: '/seller/add-book',
    SALES: '/seller/sales',
  },

  BUYER: {
    DASHBOARD: '/buyer/dashboard',
    LIBRARY: '/buyer/library',
    CART: '/buyer/cart',
    ORDERS: '/buyer/orders',
    PROFILE: '/buyer/profile',
  },
};
