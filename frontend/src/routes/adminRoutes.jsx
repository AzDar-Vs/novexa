import AdminDashboard from '../pages/admin/dashboard';
import Users from '../pages/admin/users';
import Books from '../pages/admin/books';
import Transactions from '../pages/admin/transactions';
import Categories from '../pages/admin/categories';
import Reports from '../pages/admin/reports';
import Settings from '../pages/admin/settings';

const adminRoutes = [
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path: '/admin/users', element: <Users /> },
  { path: '/admin/books', element: <Books /> },
  { path: '/admin/transactions', element: <Transactions /> },
  { path: '/admin/categories', element: <Categories /> },
  { path: '/admin/reports', element: <Reports /> },
  { path: '/admin/settings', element: <Settings /> },
];

export default adminRoutes;
