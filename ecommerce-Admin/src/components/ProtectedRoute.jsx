import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element: Element, isAuthenticated, ...rest }) => {
  return isAuthenticated ? Element : <Navigate to="/" replace />;
};

export default ProtectedRoute;
