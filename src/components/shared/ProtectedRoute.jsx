import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard
    const dashMap = {
      customer: '/customer',
      service_provider: '/provider',
      area_manager: '/manager',
      admin: '/admin',
    };
    return <Navigate to={dashMap[user.role] || '/'} replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    const dashMap = {
      customer: '/customer',
      service_provider: '/provider',
      area_manager: '/manager',
      admin: '/admin',
    };
    return <Navigate to={dashMap[user.role] || '/'} replace />;
  }

  return children;
}
