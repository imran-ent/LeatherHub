import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function AdminRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner label="Checking session…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}