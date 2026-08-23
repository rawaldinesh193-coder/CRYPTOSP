import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminFinancePage } from './pages/AdminFinancePage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, isLoading } = useAdminAuth();
  if (isLoading) return <div className="min-h-screen bg-[#030305] text-white flex items-center justify-center font-mono">Authenticating Admin Session...</div>;
  if (!admin) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          
          <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>} />
          <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsersPage /></ProtectedAdminRoute>} />
          <Route path="/admin/finance" element={<ProtectedAdminRoute><AdminFinancePage /></ProtectedAdminRoute>} />
          <Route path="/admin/deposits" element={<ProtectedAdminRoute><AdminFinancePage /></ProtectedAdminRoute>} />
          <Route path="/admin/audit" element={<ProtectedAdminRoute><AdminAuditPage /></ProtectedAdminRoute>} />
          <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettingsPage /></ProtectedAdminRoute>} />

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
};

export default App;
