import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    MenuItem,
    CircularProgress,
    DialogContentText,
    Snackbar,
    Alert,
    Menu
} from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

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

const AbsenceTypes = [
    'SICK_LEAVE',
    'VACATION',
    'WORK_FROM_HOME',
    'WORK_FROM_OFFICE',
    'UNPAID_LEAVE',
    'MATERNITY_LEAVE',
    'PATERNITY_LEAVE',
    'BEREAVEMENT_LEAVE',
    'JURY_DUTY',
    'MILITARY_LEAVE',
    'FAMILY_LEAVE',
    'OTHER'
];

const AbsencesPage = () => {
    const { token } = useUser();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [absenceType, setAbsenceType] = useState('');
    const [document, setDocument] = useState(null);
    const [selectedAbsence, setSelectedAbsence] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState(null);
    const [hasSubordinates, setHasSubordinates] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAbsences = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/absences/current-user', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const fetchedEvents = response.data.map((absence) => ({
                    id: absence.id,
                    start: new Date(absence.startDate),
                    end: new Date(absence.endDate),
                    title: absence.type,
                    approved: absence.approved, // Add approved status
                }));
                setEvents(fetchedEvents);
            } catch (err) {
                console.error('Failed to fetch absences', err);
            }
        };

        const checkForSubordinates = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/users/subordinates', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.data.length > 0) {
                    setHasSubordinates(true);
                }
            } catch (err) {
                console.error('Failed to check for subordinates', err);
            }
        };

        fetchAbsences();
        checkForSubordinates();
    }, [token]);

    const handleSelectSlot = ({ start, end }) => {
        const newSelectedDates = [];
        let currentDate = new Date(start);

        // Handle single day selection
        if (isSameDay(start, end)) {
            newSelectedDates.push(new Date(start));
        } else {
            while (currentDate <= end) {
                newSelectedDates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        console.log(newSelectedDates);
        // Adjust end date to avoid adding an extra day
        if (newSelectedDates.length > 1) {
            newSelectedDates.pop();
        }
        console.log(newSelectedDates);
        setSelectedDates(newSelectedDates);
    };

    const handleSelectEvent = (event, e) => {
        const rect = e.target.getBoundingClientRect();
        setAnchorPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
        });
        setSelectedAbsence(event);
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setAbsenceType('');
        setDocument(null);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const handleSaveAbsence = async () => {
        if (selectedDates.length === 0) return;
        setLoading(true);
        try {
            console.log(selectedDates[0], selectedDates[selectedDates.length - 1]);
            // Ensure dates are formatted as yyyy-MM-dd
            const startDate = addDays(selectedDates[0], 1).toISOString().split('T')[0];
            const endDate = addDays(selectedDates[selectedDates.length - 1], 1).toISOString().split('T')[0];

            console.log("Formatted Start Date:", startDate, "Formatted End Date:", endDate); // Debugging

            let approved = false;
            if (absenceType === "WORK_FROM_OFFICE" || absenceType === "WORK_FROM_HOME") {
                approved = true;
            }

            const formData = new FormData();
            formData.append('startDate', startDate);
            formData.append('endDate', endDate);
            formData.append('type', absenceType);
            formData.append('approved', approved); // Set based on the logic
            formData.append('managerEmail', ''); // Set manager email if applicable

            if (document) {
                formData.append('document', document);
            }

            await axios.post('http://localhost:8080/api/absences/add-current-user', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const newEvent = {
                id: Math.random(), // Use a proper unique id in real applications
                start: new Date(startDate),
                end: new Date(endDate),
                title: absenceType,
                approved: approved // Add approved status
            };
            setEvents([...events, newEvent]);
            handleCloseDialog();
        } catch (err) {
            console.error('Failed to save absence', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAbsence = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/absences/${selectedAbsence.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEvents(events.filter(event => event.id !== selectedAbsence.id));
            setDeleteDialogOpen(false);
            setSelectedAbsence(null);
            setSnackbarOpen(true); // Show success message
        } catch (err) {
            console.error('Failed to delete absence', err);
        }
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

    const dayPropGetter = (date) => {
        const isSelected = selectedDates.some(selectedDate => isSameDay(selectedDate, date));
        if (isSelected) {
            return {
                style: {
                    backgroundColor: '#f0f8ff',
                    border: '2px solid #1976d2'
                }
            };
        }
        return {};
    };

    const CustomEvent = ({ event }) => {
        const formattedTitle = event.title.replace(/_/g, ' ');
        return (
            <span>
                {formattedTitle}
            </span>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Navbar />
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 64 }} /> {/* This is to account for the navbar height */}
                    <Typography variant="h4" gutterBottom>Absences</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenDialog}
                        disabled={selectedDates.length === 0}
                        sx={{ alignSelf: 'flex-start', mb: 2 }}
                    >
                        Select Absence Type
                    </Button>
                    {hasSubordinates && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate('/subordinates-absences')}
                            sx={{ alignSelf: 'flex-start', mb: 0, ml: 0 }}
                        >
                            Approve Subordinates' Absences
                        </Button>
                    )}
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        style={{ height: 500, margin: '50px' }}
                        defaultView="month"
                        dayPropGetter={dayPropGetter}
                        eventPropGetter={eventPropGetter} // Add the eventPropGetter
                        components={{
                            event: CustomEvent // Use the custom event component
                        }}
                    />
                </Box>
            </Box>

            <Menu
                anchorReference="anchorPosition"
                anchorPosition={anchorPosition}
                open={Boolean(anchorPosition)}
                onClose={() => setAnchorPosition(null)}
            >
                <MenuItem onClick={() => { setDeleteDialogOpen(true); setAnchorPosition(null); }}>
                    Delete Absence
                </MenuItem>
            </Menu>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Add Absence</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Absence Type"
                        fullWidth
                        select
                        value={absenceType}
                        onChange={(e) => setAbsenceType(e.target.value)}
                    >
                        {AbsenceTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type.replace('_', ' ').toLowerCase()}
                            </MenuItem>
                        ))}
                    </TextField>
                    {absenceType === 'SICK_LEAVE' && (
                        <input
                            type="file"
                            onChange={(e) => setDocument(e.target.files[0])}
                            style={{ marginTop: '16px' }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveAbsence} color="primary" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Absence</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this absence?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteAbsence} color="primary">Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    Absence deleted successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AbsencesPage;
