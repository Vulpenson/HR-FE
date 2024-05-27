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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
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
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
    const [selectedAbsence, setSelectedAbsence] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const navigate = useNavigate();

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
            const response = await axios.get(`http://localhost:8080/api/absences/user/nodto/${subordinateEmail}`, {
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
            fetchSubordinateAbsences(selectedSubordinate); // Refresh the absences list
        } catch (err) {
            setError('Failed to approve absence');
            console.error(err);
        }
    };

    const handleDelete = async (absenceId) => {
        try {
            await axios.delete(`http://localhost:8080/api/absences/${absenceId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccessMessage('Absence deleted successfully!');
            setSnackbarOpen(true);
            fetchSubordinateAbsences(selectedSubordinate); // Refresh the absences list
        } catch (err) {
            setError('Failed to delete absence');
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

    const handleSelectEvent = (event) => {
        setSelectedAbsence(event);
        setDetailsDialogOpen(true);
    };

    const handleDownloadDocument = async () => {
        if (!selectedAbsence || !selectedAbsence.document) return;

        try {
            const response = await axios.get(`http://localhost:8080/api/absences/document/${selectedAbsence.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `document_${selectedAbsence.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to download document');
            console.error(err);
        }
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
                    <>
                        <Button variant="contained" sx={{ mb: 3}} onClick={() => navigate('/absences')}>
                            My Absences
                        </Button>
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
                    </>
                ) : (
                    <Box>
                        <Button variant="contained" sx={{ mb: 3}} onClick={() => setSelectedSubordinate(null)}>
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
                            onSelectEvent={handleSelectEvent}
                        />
                    </Box>
                )}
                <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)}>
                    <DialogTitle>Absence Details</DialogTitle>
                    <DialogContent>
                        {selectedAbsence && (
                            <>
                                <DialogContentText>
                                    <strong>Type:</strong> {selectedAbsence.type.replace(/_/g, ' ').toLowerCase()}<br />
                                    <strong>Start Date:</strong> {selectedAbsence.startDate}<br />
                                    <strong>End Date:</strong> {selectedAbsence.endDate}<br />
                                    <strong>Approved:</strong> {selectedAbsence.approved ? 'Yes' : 'No'}
                                </DialogContentText>
                                {selectedAbsence.document && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleDownloadDocument}
                                        sx={{ mt: 2 }}
                                    >
                                        Download Document
                                    </Button>
                                )}
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                        {!selectedAbsence?.approved && (
                            <Button
                                onClick={() => {
                                    handleApprove(selectedAbsence.id);
                                    setDetailsDialogOpen(false);
                                }}
                                color="primary"
                            >
                                Approve
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                handleDelete(selectedAbsence.id);
                                setDetailsDialogOpen(false);
                            }}
                            color="secondary"
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
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
