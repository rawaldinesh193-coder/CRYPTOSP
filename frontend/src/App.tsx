import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SendPage } from './pages/SendPage';
import { ReceivePage } from './pages/ReceivePage';
import { ScanPage } from './pages/ScanPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { MarketsPage } from './pages/MarketsPage';
import { PhoenixPage } from './pages/PhoenixPage';
import { SecurityPage } from './pages/SecurityPage';
import { AboutPage, TermsPage, PrivacyPage, RiskPage, ContactPage } from './pages/LegalPages';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminFinancePage } from './pages/admin/AdminFinancePage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-[#030305] text-white flex items-center justify-center font-mono">Loading Cryptosp...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, isLoading } = useAdminAuth();
  if (isLoading) return <div className="min-h-screen bg-[#030305] text-white flex items-center justify-center font-mono">Authenticating Admin Session...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminAuthProvider>
          <Router>
            <Routes>
              {/* Public User Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/markets" element={<MarketsPage />} />
              <Route path="/phoenix" element={<PhoenixPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/risk" element={<RiskPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated User Wallet Routes */}
              <Route path="/dashboard" element={<ProtectedUserRoute><DashboardPage /></ProtectedUserRoute>} />
              <Route path="/wallet" element={<ProtectedUserRoute><DashboardPage /></ProtectedUserRoute>} />
              <Route path="/send" element={<ProtectedUserRoute><SendPage /></ProtectedUserRoute>} />
              <Route path="/receive" element={<ProtectedUserRoute><ReceivePage /></ProtectedUserRoute>} />
              <Route path="/transactions" element={<ProtectedUserRoute><TransactionsPage /></ProtectedUserRoute>} />

              {/* Privileged Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>} />
              <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsersPage /></ProtectedAdminRoute>} />
              <Route path="/admin/finance" element={<ProtectedAdminRoute><AdminFinancePage /></ProtectedAdminRoute>} />
              <Route path="/admin/deposits" element={<ProtectedAdminRoute><AdminFinancePage /></ProtectedAdminRoute>} />
              <Route path="/admin/audit" element={<ProtectedAdminRoute><AdminAuditPage /></ProtectedAdminRoute>} />
              <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettingsPage /></ProtectedAdminRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
