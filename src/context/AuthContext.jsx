import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('deliveryUser') || 'null');
    } catch {
      return null;
    }
  });

  const isAuth = Boolean(localStorage.getItem('deliveryToken') && user);

  useEffect(() => {
    if (user) localStorage.setItem('deliveryUser', JSON.stringify(user));
    else localStorage.removeItem('deliveryUser');
  }, [user]);

  const login = (payload) => {
    localStorage.setItem('deliveryToken', payload.token);
    if (payload.refreshToken) localStorage.setItem('deliveryRefreshToken', payload.refreshToken);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem('deliveryToken');
    localStorage.removeItem('deliveryRefreshToken');
    setUser(null);
  };

  const value = useMemo(() => ({ user, isAuth, login, logout }), [user, isAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
