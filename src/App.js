
import React from 'react';
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ProtectedRoute, {ProtectedRouteAdmin, ProtectedRouteHR} from "./components/ProtectedRoute";
import PayrollPage from "./pages/PayrollPage";
import HRPayrollPage from "./pages/HRPayrollPage";
import AccountDetailsPage from "./pages/AccountDetailsPage";
import AllAccountsDetailsPage from "./pages/AllAccountsDetailsPage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/" element={<Navigate replace to="/signin" />} />
                {/* Wrap all protected routes inside a single ProtectedRoute */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/mainpage" element={<Dashboard />} />
                    <Route path="/payroll" element={<PayrollPage />} />
                    <Route path="/absences" element={<div>Absences Page</div>} />
                    <Route path="/jobs" element={<div>Jobs Page</div>} />
                    <Route path="/onboarding" element={<div>Onboarding Page</div>} />
                    <Route path="/offboarding" element={<div>Offboarding Page</div>} />
                    <Route path="/engagement" element={<div>Employee Engagement Page</div>} />
                    <Route path="/self-service" element={<div>Self Service Page</div>} />
                    <Route path="/performance" element={<div>Performance Management Page</div>} />
                    <Route path="/account-details" element={<AccountDetailsPage />} />
                </Route>
                <Route element={<ProtectedRouteHR />}>
                    <Route path="/hr-payrolls" element={<HRPayrollPage />} />
                    <Route path="/search-accounts" element={<AllAccountsDetailsPage/>}/>
                </Route>
                <Route element={<ProtectedRouteAdmin />}>
                    <Route path="/admin-menu" element={<div>Admin Menu Page</div>} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
