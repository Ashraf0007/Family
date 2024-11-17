// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (isAuthenticated) {
    return children;
  }

  return <Navigate to="/" />; // Redirect to login if not authenticated
};

export default ProtectedRoute;
