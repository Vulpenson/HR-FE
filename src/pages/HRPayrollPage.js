import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContentText, DialogContent, DialogActions
} from '@mui/material';
import { useUser } from '../context/UserContext';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {format, parseISO} from "date-fns";
import {useNavigate} from "react-router-dom";

export const HRPayrollPage = () => {
    const [searchEmail, setSearchEmail] = useState('');
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const theme = useTheme();
    const [openDialog, setOpenDialog] = useState(false);
    const { token } = useUser(); // Use the token from your context
    const navigate = useNavigate();

    useEffect(() => {
        if (searchEmail) {
            fetchPayrolls(page, rowsPerPage);
        }
    }, [page, rowsPerPage]);

    const fetchPayrolls = async (page, rowsPerPage) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`http://localhost:8080/api/payroll/user/${searchEmail}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page,
                    size: rowsPerPage,
                    sortBy: 'payDate',
                    dir: 'desc'
                }
            });
            setPayrolls(response.data.content);
            setTotalRows(response.data.totalElements);
        } catch (err) {
            setError('Failed to fetch payrolls');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(0);
        fetchPayrolls(0, rowsPerPage);
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);  // Reset to first page with new row size
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePayAll = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:8080/api/payroll/pay/all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Payroll processed for all users');
        } catch (err) {
            setError('Failed to process payroll for all users');
            console.error(err);
        } finally {
            setLoading(false);
            setOpenDialog(false)
        }
    };

    const formatDate = (dateStr) => {
        return format(parseISO(dateStr), 'dd-MMM-yyyy');
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleBackToEmployeeMode = () => {
        navigate('/payroll');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{flexGrow: 1, p: 3}}>
                <div style={{height: theme.mixins.toolbar.minHeight}}/>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">HR Payroll Management</Typography>
                    <Button variant="contained" color="secondary" onClick={handleOpenDialog}>
                        Pay All Payrolls
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleBackToEmployeeMode} sx={{ mr: 2 }}>
                        Back to Employee Mode
                    </Button>
                </Box>
                <TextField
                    label="Search Employee by Email"
                    variant="outlined"
                    value={searchEmail}
                    onChange={e => setSearchEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{mb: 2, width: '300px'}}
                />
                <Button variant="contained" onClick={handleSearch} sx={{mb: 2, height: '55px', width: '100px'}}>Search</Button>
                <TableContainer component={Paper} sx={{mt: 2}}>
                    <Table sx={{minWidth: 650}} aria-label="payroll table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Net Pay</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payrolls.map((payroll) => (
                                <TableRow key={payroll.id}>
                                    <TableCell>{formatDate(payroll.payDate)}</TableCell>
                                    <TableCell align="right">${payroll.netPay}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {totalRows > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={totalRows}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    )}
                </TableContainer>
                {loading && <Typography>Loading...</Typography>}
                {error && <Typography color="error">{error}</Typography>}

                {/* Confirmation Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Confirm Pay All Payrolls"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to process payroll for all users? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handlePayAll} color="secondary" autoFocus>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default HRPayrollPage;
