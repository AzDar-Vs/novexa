import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    // Redirect berdasarkan role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'seller':
        return <Navigate to="/seller/dashboard" replace />;
      case 'buyer':
        return <Navigate to="/buyer/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default AuthGuard;
