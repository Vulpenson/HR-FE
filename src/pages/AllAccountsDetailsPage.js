import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    useTheme,
    TablePagination,
    TextField,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';

const AllAccountsDetailsPage = () => {
    const { token, user } = useUser();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [editedDetails, setEditedDetails] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [grossPay, setGrossPay] = useState('');
    const [editingGrossPay, setEditingGrossPay] = useState(null);
    const theme = useTheme();

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/users/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    sortBy: 'lastName',
                    dir: 'asc'
                }
            });
            setUsers(response.data.content || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
            console.log(err);
        }
    };

    const handleSearch = () => {
        if (searchQuery) {
            const filtered = users.filter(user =>
                user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return filtered;
        } else {
            return users;
        }
    };

    useEffect(() => {
        if (user && (user.role === 'ROLE_HR' || user.role === 'ROLE_ADMIN')) {
            fetchAllUsers();
        }
    }, [user]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0); // Reset to first page with new row size
    };

    const handleSearchQueryChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(0); // Reset to first page on filter change
    };

    const handleEditToggle = (index) => {
        if (editIndex === index) {
            setEditIndex(null);
        } else {
            setEditIndex(index);
            setEditedDetails(users[index].personalDetails || {});
        }
    };

    const handleGrossPayEditToggle = (index, grossPay) => {
        if (editingGrossPay === index) {
            setEditingGrossPay(null);
            setGrossPay('');
        } else {
            setEditingGrossPay(index);
            setGrossPay(grossPay || '');
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (value.length <= 520) {
            setEditedDetails({
                ...editedDetails,
                [name]: value,
            });
        }
    };

    const handleGrossPayChange = (event) => {
        setGrossPay(event.target.value);
    };

    const handleSave = async (index, userEmail) => {
        try {
            await axios.post(`http://localhost:8080/api/personal-details/update/${userEmail}`, editedDetails, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEditIndex(null);
            fetchAllUsers();
            setSnackbarOpen(true);
        } catch (err) {
            setError('Failed to update personal details');
            console.error(err);
        }
    };

    const handleGrossPaySave = async (userEmail) => {
        try {
            await axios.post(`http://localhost:8080/api/payroll/grosspay/${userEmail}/${grossPay}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEditingGrossPay(null);
            setGrossPay('');
            fetchAllUsers();
            setSnackbarOpen(true);
        } catch (err) {
            setError('Failed to update gross pay');
            console.error(err);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const filteredUsers = handleSearch();
    const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <div style={{ height: theme.mixins.toolbar.minHeight }} />
                <Typography variant="h4" gutterBottom>All Accounts Details</Typography>
                <TextField
                    label="Search Users"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                    fullWidth
                    sx={{ mb: 2, maxWidth: '25%' }}
                />
                <Paper sx={{ p: 3, maxWidth: '50%', overflowX: 'auto' }}>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ minWidth: 120 }}>Actions</TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>First Name</TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>Last Name</TableCell>
                                    <TableCell sx={{ minWidth: 200 }}>Email</TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>Role</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Phone Number</TableCell>
                                    <TableCell sx={{ minWidth: 200 }}>Address</TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>City</TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>Country</TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>Postal Code</TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>Bank</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Bank Account</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Identity Card</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Identity Card Series</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Identity Card Number</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Gross Pay</TableCell> {/* New Column */}
                                    <TableCell sx={{ minWidth: 150 }}>Registered By</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Registration Date</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Company Position</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Contract Number</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Contract Start Date</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Department</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedUsers.map((user, index) => (
                                    <TableRow key={user.email}>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <>
                                                    <Button onClick={() => handleSave(index, user.email)} color="primary">
                                                        Save
                                                    </Button>
                                                    <Button onClick={() => handleEditToggle(index)} color="secondary">
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button onClick={() => handleEditToggle(index)} color="primary">
                                                    Edit
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell>{user.firstName}</TableCell>
                                        <TableCell>{user.lastName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="phoneNumber"
                                                    value={editedDetails.phoneNumber || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.phoneNumber || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="address"
                                                    value={editedDetails.address || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.address || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="city"
                                                    value={editedDetails.city || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.city || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="country"
                                                    value={editedDetails.country || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.country || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="postalCode"
                                                    value={editedDetails.postalCode || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.postalCode || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="bank"
                                                    value={editedDetails.bank || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.bank || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="bankAccount"
                                                    value={editedDetails.bankAccount || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.bankAccount || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="identityCard"
                                                    value={editedDetails.identityCard || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.identityCard || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="identityCardSeries"
                                                    value={editedDetails.identityCardSeries || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.identityCardSeries || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="identityCardNumber"
                                                    value={editedDetails.identityCardNumber || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.identityCardNumber || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingGrossPay === index ? (
                                                <>
                                                    <TextField
                                                        name="grossPay"
                                                        value={grossPay}
                                                        onChange={handleGrossPayChange}
                                                        fullWidth
                                                    />
                                                    <Button onClick={() => handleGrossPaySave(user.email)} color="primary">
                                                        Save
                                                    </Button>
                                                    <Button onClick={() => handleGrossPayEditToggle(index)} color="secondary">
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    {user.grossPay || 'N/A'}
                                                    <Button onClick={() => handleGrossPayEditToggle(index, user.grossPay)} color="primary">
                                                        Edit
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="registeredBy"
                                                    value={editedDetails.registeredBy || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.registeredBy || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="registrationDate"
                                                    value={editedDetails.registrationDate || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (
                                                user.personalDetails?.registrationDate || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="companyPosition"
                                                    value={editedDetails.companyPosition || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (user.personalDetails?.companyPosition || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="contractNumber"
                                                    value={editedDetails.contractNumber || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (user.personalDetails?.contractNumber || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="contractStartDate"
                                                    value={editedDetails.contractStartDate || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (user.personalDetails?.contractStartDate || 'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editIndex === index ? (
                                                <TextField
                                                    name="department"
                                                    value={editedDetails.department || ''}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                />
                                            ) : (user.personalDetails?.department || 'N/A'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredUsers.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
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

export default AllAccountsDetailsPage;
