import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Widget from '../components/Widget';
import {Box, Grid, Typography} from '@mui/material';
import { format, parseISO } from 'date-fns';
import {useUser} from "../context/UserContext";

const formatDate = (dateStr) => {
    return format(parseISO(dateStr), 'dd-MMM-yyyy');
};

// Formatting function for Payroll
const formatPayrollData = (payroll) => (
    <>
        <Typography variant="body1">Pay Date: { payroll ? formatDate(payroll.payDate) : "No payroll found"}</Typography>
        <Typography variant="body1">Net Pay: { payroll ? "$" + payroll.netPay.toFixed(2) : "No payroll found"}</Typography>
    </>
);

// Formatting function for Absence
const formatAbsenceData = (absence) => {
    if (!absence) {
        return <Typography variant="body1">No absence found</Typography>;
    }

    return (
        <>
            <Typography variant="body1">Start Date: {formatDate(absence.startDate)}</Typography>
            <Typography variant="body1">End Date: {formatDate(absence.endDate)}</Typography>
            <Typography variant="body1">Type: {absence.type}</Typography>
            <Typography variant="body1">Approved: {absence.approved ? "Yes" : "No"}</Typography>
        </>
    );
};


const Dashboard = () => {
    const { token, user } = useUser();

    return (
        <Box sx={{ display: 'flex', height: '100vh'}}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Grid container spacing={3}>
                    {/* Last Payslip Widget */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Widget title="Last Payroll" endpoint="/api/payroll/last" formatData={formatPayrollData} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <Widget title="Last Absence" endpoint= {`/api/absences/last/${user.email}`} formatData={formatAbsenceData} />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default Dashboard;
