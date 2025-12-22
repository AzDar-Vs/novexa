import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/authContext';

import Landing from './pages/landing';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import ProtectedRoute from './routes/protectedRoute';

import AdminDashboard from './pages/admin/dashboard';
import Profile from './pages/profile';

// SELLER
import SellerProducts from './pages/seller/products';
import BookForm from './pages/seller/books/bookForm';
import SellerDashboard from './pages/seller/dashboard';
import BookList from './pages/seller/books/bookList';

// BUYER
import BuyerDashboard from './pages/buyer/dashboard';
import Cart from './pages/buyer/cart';
import Orders from './pages/buyer/orders';
import OrderDetail from './pages/buyer/orderDetail';
import Reader from './pages/buyer/reader';
import ExploreBooks from './pages/buyer/explore';
import BuyerLibrary from './pages/buyer/library';
import ReadingHistory from './pages/buyer/readingHistory';
import Reviews from './pages/buyer/reviews';
import Checkout from './pages/buyer/checkout';

function App() {
  const { isAuthenticated, user, loading } = useAuth();

  // ✅ DEBUG DI SINI, BUKAN DI JSX
  console.log('AUTH ROLE:', user?.role);

  if (loading) return null;

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* DASHBOARD REDIRECT */}
      <Route
        path="/dashboard"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : user.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : user.role === 'seller' ? (
            <Navigate to="/seller" replace />
          ) : (
            <Navigate to="/buyer" replace />
          )
        }
      />

      {/* ADMIN */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* SELLER */}
      <Route element={<ProtectedRoute roles={['seller']} />}>
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/products" element={<SellerProducts />} />
        <Route path="/seller/books" element={<BookList />} />
        <Route path="/seller/books/add" element={<BookForm />} />
        <Route path="/seller/books/edit/:id" element={<BookForm />} />
      </Route>

      {/* BUYER */}
      <Route element={<ProtectedRoute roles={['buyer']} />}>
        <Route path="/buyer" element={<BuyerDashboard />} />
        <Route path="/browse" element={<ExploreBooks />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/buyer/orders" element={<Orders />} />
        <Route path="/buyer/orders/:id" element={<OrderDetail />} />
        <Route path="/buyer/read/:bookId" element={<Reader />} />
        <Route path="/buyer/library" element={<BuyerLibrary />} />
        <Route path="/buyer/reading-history" element={<ReadingHistory />} />
        <Route path="/buyer/reviews" element={<Reviews />} />
      </Route>

      <Route element={<ProtectedRoute roles={['seller', 'buyer', 'admin']} />}>
          <Route path="/profile" element={<Profile />} />
      </Route>
      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
