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
    IconButton,
} from '@mui/material';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';

const locales = {
    'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const SubordinatesAbsenceApprovalPage = () => {
    const { token } = useUser();
    const [subordinates, setSubordinates] = useState([]);
    const [selectedSubordinate, setSelectedSubordinate] = useState(null);
    const [absences, setAbsences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchSubordinates = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/users/subordinates', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Fetched subordinates:", response.data);
            setSubordinates(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch subordinates:', err);
            setError('Failed to fetch subordinates');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubordinates();
    }, []);

    const fetchSubordinateAbsences = async (subordinateEmail) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/absences/user/${subordinateEmail}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSelectedSubordinate(subordinateEmail);
            setAbsences(response.data);
        } catch (err) {
            setError('Failed to fetch absences');
            throw err;
        }
    };

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
            fetchSubordinates(); // Refresh the subordinates list
        } catch (err) {
            setError('Failed to approve absence');
            console.error(err);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const eventPropGetter = (event) => {
        const backgroundColor = event.approved ? 'rgba(0, 128, 0, 0.7)' : 'rgba(128,128,128,0.44)';
        const borderColor = event.approved ? 'green' : 'gray';
        const color = 'white';
        const borderStyle = 'solid';
        return {
            style: {
                backgroundColor,
                borderColor,
                color,
                borderStyle
            }
        };
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <div style={{ height: 64 }} /> {/* This is to account for the navbar height */}
                <Typography variant="h4" gutterBottom>Subordinates</Typography>
                {!selectedSubordinate ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Unapproved Absences</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subordinates.map((subordinate) => (
                                    <TableRow key={subordinate}>
                                        <TableCell>{subordinate}</TableCell>
                                        <TableCell>
                                            {subordinate.hasUnapprovedAbsence ? (
                                                <WarningIcon color="error" />
                                            ) : (
                                                <CheckCircleIcon color="success" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => fetchSubordinateAbsences(subordinate)}
                                            >
                                                View Absences
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box>
                        <Button variant="contained" onClick={() => setSelectedSubordinate(null)}>
                            Back to Subordinates List
                        </Button>
                        <Typography variant="h5" gutterBottom>
                            Absences for {selectedSubordinate}
                        </Typography>
                        <Calendar
                            localizer={localizer}
                            events={absences.map(absence => ({
                                ...absence,
                                start: new Date(absence.startDate),
                                end: new Date(absence.endDate),
                                title: absence.type.replace(/_/g, ' ').toLowerCase()
                            }))}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 500, margin: '50px' }}
                            eventPropGetter={eventPropGetter}
                        />
                    </Box>
                )}
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
