import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Alert,
    Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useUser } from '../context/UserContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './OnboardingStatusPage.css';

const OnboardingStatusPage = () => {
    const { user, token } = useUser();
    const [onboardingStatus, setOnboardingStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOnboardingStatus = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/onboarding/user/${user.email}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setOnboardingStatus(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch onboarding status');
                setLoading(false);
            }
        };

        if (user && token) {
            fetchOnboardingStatus();
        }
    }, [user, token]);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    const isComplete = onboardingStatus?.badgeObtained && onboardingStatus?.hardwareAcquired;

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <div style={{ height: 64 }} /> {/* This is to account for the navbar height */}
                <Typography variant="h4" gutterBottom>
                    Onboarding Status
                </Typography>
                {onboardingStatus ? (
                    <Card>
                        <CardContent>
                            <Grid container justifyContent="center" alignItems="center">
                                <Grid item xs={12}>
                                    <Box className="onboarding-container">
                                        <Box className="onboarding-step">
                                            <Typography variant="h6">Badge Obtained</Typography>
                                            {onboardingStatus.badgeObtained ? (
                                                <CheckCircleIcon color="success" fontSize="large" />
                                            ) : (
                                                <RadioButtonUncheckedIcon color="disabled" fontSize="large" />
                                            )}
                                            <Typography>{onboardingStatus.badgeObtained ? 'Completed' : 'Pending'}</Typography>
                                        </Box>
                                        <Box className={`onboarding-line ${isComplete ? 'complete' : ''}`} />
                                        <Box className="onboarding-step">
                                            <Typography variant="h6">Hardware Acquired</Typography>
                                            {onboardingStatus.hardwareAcquired ? (
                                                <CheckCircleIcon color="success" fontSize="large" />
                                            ) : (
                                                <RadioButtonUncheckedIcon color="disabled" fontSize="large" />
                                            )}
                                            <Typography>{onboardingStatus.hardwareAcquired ? 'Completed' : 'Pending'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                ) : (
                    <Alert severity="warning">No onboarding information available.</Alert>
                )}
            </Box>
        </Box>
    );
};

export default OnboardingStatusPage;
