import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element }) => {
  const isAuthenticated = !!localStorage.getItem('userToken'); // Check if token exists
  return isAuthenticated ? <Element /> : <Navigate to="/" />; // Redirect to login if not authenticated
};

export default PrivateRoute;
