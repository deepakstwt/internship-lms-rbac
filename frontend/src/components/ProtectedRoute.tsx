import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'mentor' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  const hasValidAuth = isAuthenticated || (storedToken && storedUser);
  
  if (!hasValidAuth) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

