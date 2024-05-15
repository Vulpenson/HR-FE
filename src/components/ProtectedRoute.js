import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {useUser} from "../context/UserContext";

const ProtectedRoute = () => {
    const { user, saveUser } = useUser();
    const token = localStorage.getItem('userToken');
    const roleUser = user ? user.role : null;
    return token ? <Outlet /> : <Navigate to="/signin" replace />;
}

// ProtectedRouteHR where only users with the role ROLE_HR or ROLE_ADMIN can access
export const ProtectedRouteHR = () => {
    const { user, saveUser } = useUser();
    const token = localStorage.getItem('userToken');
    const roleUser = user ? user.role : null;
    return token && (roleUser === 'ROLE_HR' || roleUser === 'ROLE_ADMIN') ? <Outlet /> : <Navigate to="/signin" replace />;
}

export default ProtectedRoute;