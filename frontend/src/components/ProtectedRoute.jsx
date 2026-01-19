import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole && 
      requiredRole !== 'adminOrHR' && 
      !(requiredRole === 'adminOrHR' && (user?.role === 'admin' || user?.role === 'hr'))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
