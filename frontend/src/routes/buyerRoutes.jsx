import BuyerDashboard from '../pages/buyer/dashboard';
import Library from '../pages/buyer/library';
import Cart from '../pages/buyer/cart';
import Checkout from '../pages/buyer/checkout';
import Orders from '../pages/buyer/orders';
import OrderDetail from '../pages/buyer/orderDetail';
import Profile from '../pages/buyer/profile';
import Reviews from '../pages/buyer/reviews';

const buyerRoutes = [
  { path: '/buyer/dashboard', element: <BuyerDashboard /> },
  { path: '/buyer/library', element: <Library /> },
  { path: '/buyer/cart', element: <Cart /> },
  { path: '/buyer/checkout', element: <Checkout /> },
  { path: '/buyer/orders', element: <Orders /> },
  { path: '/buyer/orders/:id', element: <OrderDetail /> },
  { path: '/buyer/profile', element: <Profile /> },
  { path: '/buyer/reviews', element: <Reviews /> },
];

export default buyerRoutes;
