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
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, useTheme,
} from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';

const AdminMenu = () => {
    const { token } = useUser();
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'ROLE_EMPLOYEE',
    });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const theme = useTheme();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleRoleChange = (event) => {
        setNewUser({ ...newUser, role: event.target.value });
    };

    const handleUserRegistration = async () => {
        try {
            await axios.post('http://localhost:8080/api/auth/signup', newUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSnackbarMessage('User registered successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setNewUser({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'ROLE_EMPLOYEE',
            });
        } catch (error) {
            setSnackbarMessage('Failed to register user');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleSearchEmailChange = (event) => {
        setSearchEmail(event.target.value);
    };

    const handleSearchUser = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/auth/user/${searchEmail}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSearchResult(response.data);
        } catch (error) {
            setSearchResult(null);
            setSnackbarMessage('User not found');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleDeleteUser = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/users/delete/${searchEmail}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSnackbarMessage('User deleted successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setSearchEmail('');
            setSearchResult(null);
            setDialogOpen(false);
        } catch (error) {
            setSnackbarMessage('Failed to delete user');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{flexGrow: 1, p: 3}}>
                <div style={{height: theme.mixins.toolbar.minHeight}}/>
                <Typography variant="h4" gutterBottom>Admin Menu</Typography>
                <Paper sx={{p: 3, mb: 3}}>
                    <Typography variant="h6">Register New User</Typography>
                    <TextField
                        label="First Name"
                        name="firstName"
                        value={newUser.firstName}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{mb: 2}}
                    />
                    <TextField
                        label="Last Name"
                        name="lastName"
                        value={newUser.lastName}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{mb: 2}}
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{mb: 2}}
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={newUser.password}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{mb: 2}}
                    />
                    <FormControl fullWidth sx={{mb: 2}}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role"
                            value={newUser.role}
                            onChange={handleRoleChange}
                        >
                            <MenuItem value="ROLE_EMPLOYEE">ROLE_EMPLOYEE</MenuItem>
                            <MenuItem value="ROLE_HR">ROLE_HR</MenuItem>
                            <MenuItem value="ROLE_ADMIN">ROLE_ADMIN</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" onClick={handleUserRegistration}>
                        Register User
                    </Button>
                </Paper>

                <Paper sx={{p: 3, mb: 3}}>
                    <Typography variant="h6">Delete User</Typography>
                    <TextField
                        label="Search by Email"
                        name="searchEmail"
                        value={searchEmail}
                        onChange={handleSearchEmailChange}
                        fullWidth
                        sx={{mb: 2}}
                    />
                    <Button variant="contained" color="primary" onClick={handleSearchUser}>
                        Search User
                    </Button>
                    {searchResult && (
                        <Box sx={{mt: 2}}>
                            <Typography variant="body1">
                                Found User: {searchResult.firstName} {searchResult.lastName} ({searchResult.email})
                            </Typography>
                            <Button variant="contained" color="secondary" onClick={handleOpenDialog}>
                                Delete User
                            </Button>
                        </Box>
                    )}
                </Paper>

                <Dialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this user? This action is irreversible.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteUser} color="secondary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

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

export default AdminMenu;
