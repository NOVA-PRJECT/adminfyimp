import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // 1. If the AuthProvider is still checking the session, show nothing (or a spinner)
  if (loading) return null;

  // 2. If no user is logged in, redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If logged in, render the child (Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;
