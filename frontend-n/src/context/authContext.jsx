import { createContext, useContext, useEffect, useState } from 'react';
import { getMeApi, loginApi } from '../api/auth.api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user dari token
  const loadUser = async () => {
    try {
      const res = await getMeApi();
         console.log('GET ME RESPONSE:', res.data.data);
      const userFromApi = res.data.data;
      
      setUser({
        id: userFromApi.ID_USER,
        name: userFromApi.NAMA,
        email: userFromApi.EMAIL,
        role: userFromApi.ROLE.toLowerCase(),
        saldo: userFromApi.SALDO
      });

    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    const token = res.data.data.token;

    localStorage.setItem('token', token);
    await loadUser();
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
