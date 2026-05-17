import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/shared/ProtectedRoute';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ServicesPage from './pages/services/ServicesPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';

function AppLayout() {
  const location = useLocation();
  const isDashboard = ['/customer', '/provider', '/admin', '/manager'].some(
    (p) => location.pathname.startsWith(p)
  );

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />

        {/* Auth - public only */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Customer Dashboard */}
        <Route
          path="/customer/*"
          element={
            <ProtectedRoute roles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Provider Dashboard */}
        <Route
          path="/provider/*"
          element={
            <ProtectedRoute roles={['service_provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Area Manager Dashboard */}
        <Route
          path="/manager/*"
          element={
            <ProtectedRoute roles={['area_manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={
          <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>Page Not Found</h3>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          </div>
        } />
      </Routes>
      {!isDashboard && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '10px',
              padding: '14px 20px',
              fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
