import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const SubordinatesAbsenceApprovalPage = () => {
    const { token } = useUser();
    const [absences, setAbsences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchSubordinatesAbsences = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/absences/subordinates', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAbsences(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch absences');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubordinatesAbsences();
    }, []);

    const handleApprove = async (absenceId) => {
        try {
            await axios.post(
                `http://localhost:8080/api/absences/approve/${absenceId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSuccessMessage('Absence approved successfully!');
            setSnackbarOpen(true);
            fetchSubordinatesAbsences();
        } catch (err) {
            setError('Failed to approve absence');
            console.error(err);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <div style={{ height: 64 }} /> {/* This is to account for the navbar height */}
                <Typography variant="h4" gutterBottom>Approve Subordinates' Absences</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {absences.map((absence) => (
                                <TableRow key={absence.id}>
                                    <TableCell>{absence.user.email}</TableCell>
                                    <TableCell>{absence.type.replace(/_/g, ' ').toLowerCase()}</TableCell>
                                    <TableCell>{absence.startDate}</TableCell>
                                    <TableCell>{absence.endDate}</TableCell>
                                    <TableCell>{absence.approved ? 'Approved' : 'Pending'}</TableCell>
                                    <TableCell>
                                        {!absence.approved && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleApprove(absence.id)}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                >
                    <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                        {successMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default SubordinatesAbsenceApprovalPage;
