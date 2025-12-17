import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // load user on refresh
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const res = await authService.getProfile();
          setUser(res.user);
        }
      } catch {
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    return res.user;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return Array.isArray(roles)
      ? roles.includes(user.role)
      : user.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        hasRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
