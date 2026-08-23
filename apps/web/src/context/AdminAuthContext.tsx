import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('cryptosp_admin_token'));
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAdminProfile = async (jwtToken: string) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const json = await res.json();
      if (json.success && json.data.role !== 'USER') {
        setAdmin(json.data);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminProfile(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newAdmin: AdminUser) => {
    localStorage.setItem('cryptosp_admin_token', newToken);
    setToken(newToken);
    setAdmin(newAdmin);
  };

  const logout = () => {
    localStorage.removeItem('cryptosp_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
