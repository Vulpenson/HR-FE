import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('userToken');
    return token ? <Outlet /> : <Navigate to="/signin" replace />;
}

export default ProtectedRoute;