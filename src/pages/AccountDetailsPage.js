import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, Grid, CircularProgress, Button, TextField, Snackbar, Alert, Input
} from '@mui/material';
import { useUser } from '../context/UserContext';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const AccountDetailsPage = () => {
    const { user, token } = useUser();
    const [personalDetails, setPersonalDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editedDetails, setEditedDetails] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchPersonalDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/personal-details/current`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPersonalDetails(response.data);
            setEditedDetails(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch personal details');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPersonalDetails().then(r => console.log(r));
        }
    }, [user]);

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditedDetails({
            ...editedDetails,
            [name]: value,
        });
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/api/personal-details/current/update`, editedDetails, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPersonalDetails(response.data);
            setEditMode(false);
            setSnackbarOpen(true); // Show snackbar
            await fetchPersonalDetails();
        } catch (err) {
            setError('Failed to update personal details');
            console.error(err);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            await axios.post(`http://localhost:8080/api/users/upload-cv`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            setSnackbarOpen(true); // Show snackbar
            setUploading(false);
        } catch (err) {
            setError('Failed to upload CV');
            console.error(err);
            setUploading(false);
        }
    };

    const handleFileDownload = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/users/download-cv`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: 'blob', // Important to handle binary data
            });

            // Create a URL for the downloaded file and initiate a download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `${user.firstName}${user.lastName}CV.pdf`;
            link.setAttribute('download', fileName); // dynamically set file name
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            // setError('Failed to download CV');
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" gutterBottom>Account Details</Typography>
                    <Button variant="contained" color="primary" onClick={handleEditToggle}>
                        {editMode ? 'Cancel' : 'Edit'}
                    </Button>
                </Box>
                <Paper sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6">Personal Information</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">First Name</Typography>
                            <Typography>{user.firstName}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1">Last Name</Typography>
                            <Typography>{user.lastName}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">Email</Typography>
                            <Typography>{user.email}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">Role</Typography>
                            <Typography>{user.role}</Typography>
                        </Grid>
                        {personalDetails && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">CNP</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="cnp"
                                            value={editedDetails.cnp}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.cnp}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Phone Number</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="phoneNumber"
                                            value={editedDetails.phoneNumber}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.phoneNumber}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Address</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="address"
                                            value={editedDetails.address}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.address}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">City</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="city"
                                            value={editedDetails.city}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.city}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Country</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="country"
                                            value={editedDetails.country}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.country}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Postal Code</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="postalCode"
                                            value={editedDetails.postalCode}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.postalCode}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Bank</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="bank"
                                            value={editedDetails.bank}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.bank}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Bank Account</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="bankAccount"
                                            value={editedDetails.bankAccount}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.bankAccount}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Identity Card</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="identityCard"
                                            value={editedDetails.identityCard}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.identityCard}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Identity Card Series</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="identityCardSeries"
                                            value={editedDetails.identityCardSeries}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.identityCardSeries}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Identity Card Number</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="identityCardNumber"
                                            value={editedDetails.identityCardNumber}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.identityCardNumber}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Registered By</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="registeredBy"
                                            value={editedDetails.registeredBy}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.registeredBy}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Registration Date</Typography>
                                    {editMode ? (
                                        <TextField
                                            name="registrationDate"
                                            value={editedDetails.registrationDate}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    ) : (
                                        <Typography>{personalDetails?.registrationDate}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Company Position</Typography>
                                    <Typography>{personalDetails?.companyPosition}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Contract Number</Typography>
                                    <Typography>{personalDetails?.contractNumber}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Contract Start Date</Typography>
                                    <Typography>{personalDetails?.contractStartDate}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Department</Typography>
                                    <Typography>{personalDetails?.department}</Typography>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Paper>
                {editMode && (
                    <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
                        Save Changes
                    </Button>
                )}
                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        component="label"
                        color="primary"
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload CV'}
                        <input
                            type="file"
                            hidden
                            onChange={handleFileUpload}
                        />
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleFileDownload}
                        sx={{ ml: 2 }}
                    >
                        Download CV
                    </Button>
                </Box>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                >
                    <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                        Detail successfully updated!
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default AccountDetailsPage;
