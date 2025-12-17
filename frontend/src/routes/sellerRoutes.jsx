import SellerDashboard from '../pages/seller/dashboard';
import Books from '../pages/seller/books';
import AddBook from '../pages/seller/addBook';
import EditBook from '../pages/seller/editBook';
import Sales from '../pages/seller/sales';
import Analytics from '../pages/seller/analytics';
import Customers from '../pages/seller/customers';
import Earnings from '../pages/seller/earnings';

const sellerRoutes = [
  { path: '/seller/dashboard', element: <SellerDashboard /> },
  { path: '/seller/books', element: <Books /> },
  { path: '/seller/books/add', element: <AddBook /> },
  { path: '/seller/books/edit/:id', element: <EditBook /> },
  { path: '/seller/sales', element: <Sales /> },
  { path: '/seller/analytics', element: <Analytics /> },
  { path: '/seller/customers', element: <Customers /> },
  { path: '/seller/earnings', element: <Earnings /> },
];

export default sellerRoutes;
