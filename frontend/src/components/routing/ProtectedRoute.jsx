import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children, requireAdmin = false, requireSuperAdmin = false }) {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container-page py-10 text-sm text-stone-600">Cargando sesion...</div>;
  }

  if (!user) {
    return <Navigate to={`/login${location.search}`} replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
