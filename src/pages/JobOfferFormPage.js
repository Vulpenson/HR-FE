import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    TextField,
    Button,
    Container,
    useTheme,
    Snackbar,
    Alert
} from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const JobOfferFormPage = () => {
    const { token } = useUser();
    const [newJobOffer, setNewJobOffer] = useState({
        title: '',
        description: '',
        requirements: '',
        active: true
    });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [error, setError] = useState('');
    const theme = useTheme();
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewJobOffer({
            ...newJobOffer,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        try {
            await axios.post('http://localhost:8080/api/job-offers', newJobOffer, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbarOpen(true);
            navigate('/jobs');
        } catch (err) {
            setError('Failed to create job offer');
            console.error(err);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <div style={{ height: theme.mixins.toolbar.minHeight }} />
                <Container maxWidth="md">
                    <Typography variant="h4" gutterBottom>Add New Job Offer</Typography>
                    <TextField
                        margin="dense"
                        name="title"
                        label="Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newJobOffer.title}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={6}
                        value={newJobOffer.description}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="requirements"
                        label="Requirements"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={6}
                        value={newJobOffer.requirements}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Container>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                >
                    <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                        Job offer created successfully!
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default JobOfferFormPage;
