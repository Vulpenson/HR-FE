// pages/FeedbackFormPage.js
import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    TextField,
    Button,
    Snackbar,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem, useTheme,
} from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const FeedbackFormPage = () => {
    const { token, user } = useUser();
    const navigate = useNavigate();
    const [feedbackType, setFeedbackType] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const theme = useTheme();
    const handleFeedbackTypeChange = (event) => {
        setFeedbackType(event.target.value);
    };

    const handleFeedbackTextChange = (event) => {
        setFeedbackText(event.target.value);
    };

    const handleSubmitFeedback = async () => {
        try {
            await axios.post('http://localhost:8080/api/feedback/submit', {
                feedbackType,
                feedbackText,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSnackbarMessage('Feedback submitted successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setFeedbackType('');
            setFeedbackText('');
        } catch (error) {
            const errorMessage = error.response?.data?.feedback || 'Failed to submit feedback';
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleNavigateToViewFeedbacks = () => {
        navigate('/view-feedbacks');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{flexGrow: 1, p: 3}}>
                <div style={{height: theme.mixins.toolbar.minHeight}}/>
                <Typography variant="h4" gutterBottom>Submit Feedback</Typography>

                <Paper sx={{p: 3, mb: 3}}>
                    <FormControl fullWidth sx={{mb: 2}}>
                        <InputLabel>Feedback Type</InputLabel>
                        <Select
                            value={feedbackType}
                            onChange={handleFeedbackTypeChange}
                        >
                            <MenuItem value="PERFORMANCE">Performance</MenuItem>
                            <MenuItem value="ATTITUDE">Attitude</MenuItem>
                            <MenuItem value="BEHAVIOR">Behavior</MenuItem>
                            <MenuItem value="TEAMWORK">Teamwork</MenuItem>
                            <MenuItem value="COMMUNICATION">Communication</MenuItem>
                            <MenuItem value="LEADERSHIP">Leadership</MenuItem>
                            <MenuItem value="INNOVATION">Innovation</MenuItem>
                            <MenuItem value="OFFICE_ENVIRONMENT">Office Environment</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Your Feedback"
                        multiline
                        rows={4}
                        value={feedbackText}
                        onChange={handleFeedbackTextChange}
                        fullWidth
                        sx={{mb: 2}}
                    />
                    <Button variant="contained" color="primary" onClick={handleSubmitFeedback}>
                        Submit Feedback
                    </Button>
                </Paper>

                {user && (user.role === 'ROLE_HR' || user.role === 'ROLE_ADMIN') && (
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleNavigateToViewFeedbacks}
                    >
                        See All Feedbacks
                    </Button>
                )}

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{width: '100%'}}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default FeedbackFormPage;
