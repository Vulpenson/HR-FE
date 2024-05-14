import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {useUser} from "../context/UserContext";

const ProtectedRoute = () => {
    const { user, saveUser } = useUser();
    const token = localStorage.getItem('userToken');
    const roleUser = user ? user.role : null;
    return token ? <Outlet /> : <Navigate to="/signin" replace />;
}

export default ProtectedRoute;