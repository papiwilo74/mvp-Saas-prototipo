import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('ff_token')));

  useEffect(() => {
    const token = localStorage.getItem('ff_token');

    if (!token) return;

    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('ff_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('ff_token', data.token);
    setUser(data.user);
    return data.user;
  };


  const logout = () => {
    localStorage.removeItem('ff_token');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === 'ADMIN', login, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
