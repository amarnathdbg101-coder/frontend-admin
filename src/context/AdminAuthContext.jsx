import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../api/admin.api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('shopsilo_admin_user') || localStorage.getItem('shopme_admin_user');
    const savedToken = localStorage.getItem('shopsilo_admin_token') || localStorage.getItem('shopme_admin_token');
    
    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'superadmin')) {
          setAdminUser(parsed);
          setToken(savedToken);
        } else {
          logout();
        }
      } catch (e) {
        logout();
      }
    } else {
      logout();
    }
    setLoading(false);

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('shopsilo_admin_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('shopsilo_admin_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await adminApi.login(email, password);
    if (!res.user || (res.user.role !== 'admin' && res.user.role !== 'superadmin')) {
      throw new Error('Access denied: Only users with Administrator role can access this console.');
    }

    setToken(res.access_token);
    setAdminUser(res.user);
    localStorage.setItem('shopsilo_admin_token', res.access_token);
    localStorage.setItem('shopsilo_admin_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('shopsilo_admin_token');
    localStorage.removeItem('shopme_admin_token');
    localStorage.removeItem('shopsilo_admin_user');
    localStorage.removeItem('shopme_admin_user');
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, token, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
