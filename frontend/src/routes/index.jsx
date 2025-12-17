import { Routes, Route } from 'react-router-dom';

import PublicRoutes from './publicRoutes';
import AuthRoutes from './authRoutes';
import AdminRoutes from './adminRoutes';
import SellerRoutes from './sellerRoutes';
import BuyerRoutes from './buyerRoutes';

import Forbidden from '../pages/errors/Forbidden';
import NotFound from './notFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Auth */}
      <Route path="/auth/*" element={<AuthRoutes />} />

      {/* Role based */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/seller/*" element={<SellerRoutes />} />
      <Route path="/buyer/*" element={<BuyerRoutes />} />

      {/* Errors */}
      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
