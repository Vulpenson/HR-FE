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
    TablePagination,
    Button,
    useTheme,
    CircularProgress,
} from '@mui/material';
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
                            {(user.role === 'ROLE_HR' || user.role === 'ROLE_ADMIN') && (
                                <Button variant="contained" color="primary" onClick={handleAddJobOffer}>
                                    Add Job Offer
                                </Button>
                            )}
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
                            </Paper>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default JobOffersPage;
