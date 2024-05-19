import React, { useEffect, useState, useRef } from 'react';
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
    TablePagination,
    Button,
    useTheme,
    CircularProgress,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Alert
} from '@mui/material';
import { CheckCircleOutline as CheckCircleOutlineIcon } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const JobOffersPage = () => {
    const { token, user } = useUser();
    const [jobOffers, setJobOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalRows, setTotalRows] = useState(0);
    const [selectedJobOffer, setSelectedJobOffer] = useState(null);
    const [openRecommendDialog, setOpenRecommendDialog] = useState(false);
    const [questionnaireResponse, setQuestionnaireResponse] = useState('');
    const [cvSelected, setCvSelected] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const fileInputRef = useRef(null);
    const theme = useTheme();
    const navigate = useNavigate();

    const fetchJobOffers = async (page, rowsPerPage) => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/job-offers/active', {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, size: rowsPerPage }
            });
            setJobOffers(response.data.content);
            setTotalRows(response.data.totalElements);
            console.log(response.data.content);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch job offers');
            setLoading(false);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchJobOffers(page, rowsPerPage);
    }, [page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page with new row size
    };

    const handleAddJobOffer = () => {
        navigate('/add-job-offer');
    };

    const handleRowClick = (jobOffer) => {
        setSelectedJobOffer(jobOffer);
    };

    const handleApply = async () => {
        try {
            await axios.post('http://localhost:8080/api/recommendations/apply-job', null, {
                headers: { Authorization: `Bearer ${token}` },
                params: { jobOfferId: selectedJobOffer.id }
            });
            setSnackbarMessage('Applied successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (err) {
            console.error('Failed to apply for job', err);
            setSnackbarMessage('Failed to apply for job');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleRecommend = () => {
        setOpenRecommendDialog(true);
    };

    const handleRecommendSubmit = async () => {
        if (!questionnaireResponse || !fileInputRef.current.files[0]) {
            setSnackbarMessage('Please fill in the name and select a file.');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            return;
        }

        const file = fileInputRef.current.files[0];
        const formData = new FormData();
        formData.append('questionnaireResponse', questionnaireResponse);
        formData.append('cvFile', file);

        try {
            await axios.post(`http://localhost:8080/api/recommendations/${selectedJobOffer.id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSnackbarMessage('Recommendation submitted successfully');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setOpenRecommendDialog(false);
        } catch (err) {
            console.error('Failed to submit recommendation', err);
            setSnackbarMessage('Failed to submit recommendation');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleHRMode = () => {
        navigate('/job-offer-hr-mode');
    };

    const handleFileChange = () => {
        setCvSelected(fileInputRef.current.files.length > 0);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Navbar />
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <Sidebar />
                <Box component="main" sx={{flexGrow: 1, p: 3, display: 'flex'}}>
                    <Box sx={{flex: 2, overflow: 'auto'}}>
                        <div style={{height: theme.mixins.toolbar.minHeight}}/>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4">Job Offers</Typography>
                            <Box>
                                {(user.role === 'ROLE_HR' || user.role === 'ROLE_ADMIN') && (
                                    <>
                                        <Button variant="contained" color="primary" onClick={handleAddJobOffer} sx={{mr: 2}}>
                                            Add Job Offer
                                        </Button>
                                        <Button variant="contained" color="secondary" onClick={handleHRMode}>
                                            HR Mode
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                        <Paper sx={{p: 3, mb: 3}}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Requirements</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {jobOffers.map((jobOffer) => (
                                            <TableRow
                                                key={jobOffer.id}
                                                onClick={() => handleRowClick(jobOffer)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedJobOffer?.id === jobOffer.id ? theme.palette.action.selected : 'inherit'
                                                }}
                                            >
                                                <TableCell>{jobOffer.title}</TableCell>
                                                <TableCell>{jobOffer.description}</TableCell>
                                                <TableCell>{jobOffer.requirements}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={totalRows}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </Paper>
                    </Box>
                    {selectedJobOffer && (
                        <Box sx={{ flex: 1, ml: 3, overflow: 'auto' }}>
                            <div style={{ height: theme.mixins.toolbar.minHeight }} />
                            <div style={{ height: theme.mixins.toolbar.minHeight }} />
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h5">{selectedJobOffer.title}</Typography>
                                <Typography variant="body1"><strong>Description:</strong> {selectedJobOffer.description}</Typography>
                                <Typography variant="body1"><strong>Requirements:</strong> {selectedJobOffer.requirements}</Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={handleApply}>
                                        Apply for Position
                                    </Button>
                                    <Button variant="contained" color="secondary" onClick={handleRecommend}>
                                        Recommend Someone
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Recommendation Dialog */}
            <Dialog open={openRecommendDialog} onClose={() => setOpenRecommendDialog(false)}>
                <DialogTitle>Recommend Someone!</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Full Name Of The Recommended Person"
                        fullWidth
                        value={questionnaireResponse}
                        onChange={(e) => setQuestionnaireResponse(e.target.value)}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <Box display="flex" alignItems="center" mt={2}>
                        <Button variant="contained" component="span" onClick={() => fileInputRef.current.click()}>
                            Upload CV
                        </Button>
                        {cvSelected && (
                            <Box display="flex" alignItems="center" ml={2}>
                                <CheckCircleOutlineIcon color="success" />
                                <Typography variant="body2" color="success.main" ml={1}>CV Selected</Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRecommendDialog(false)}>Cancel</Button>
                    <Button onClick={handleRecommendSubmit} color="primary" disabled={!cvSelected || !questionnaireResponse}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default JobOffersPage;
