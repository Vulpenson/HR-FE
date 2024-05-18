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
    TablePagination,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    useTheme,
} from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ViewFeedbacksPage = () => {
    const { token } = useUser();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [feedbackType, setFeedbackType] = useState('ALL');
    const theme = useTheme();
    const navigate = useNavigate();

    const fetchFeedbacks = async (page, rowsPerPage, feedbackType) => {
        setLoading(true);
        try {
            const response = feedbackType === 'ALL'
                ? await axios.get('http://localhost:8080/api/feedback/all', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page, size: rowsPerPage }
                })
                : await axios.get(`http://localhost:8080/api/feedback/type/${feedbackType}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page, size: rowsPerPage }
                });

            setFeedbacks(response.data.content);
            setTotalRows(response.data.totalElements);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch feedbacks');
            setLoading(false);
            console.log(err);
        }
    };

    useEffect(() => {
        fetchFeedbacks(page, rowsPerPage, feedbackType);
    }, [page, rowsPerPage, feedbackType]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0); // Reset to first page with new row size
    };

    const handleFeedbackTypeChange = (event) => {
        setFeedbackType(event.target.value);
        setPage(0); // Reset to first page on filter change
    };

    const handleGoBack = () => {
        navigate('/feedback');
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{flexGrow: 1, p: 3}}>
                <div style={{height: theme.mixins.toolbar.minHeight}}/>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4">View Feedbacks</Typography>
                    <Button variant="contained" color="primary" onClick={handleGoBack}>
                        Go to Feedback Form
                    </Button>
                </Box>
                <FormControl fullWidth sx={{mb: 2, maxWidth: '25%'}}>
                    <InputLabel>Feedback Type</InputLabel>
                    <Select value={feedbackType} onChange={handleFeedbackTypeChange}>
                        <MenuItem value="ALL">ALL</MenuItem>
                        <MenuItem value="PERFORMANCE">PERFORMANCE</MenuItem>
                        <MenuItem value="ATTITUDE">ATTITUDE</MenuItem>
                        <MenuItem value="BEHAVIOR">BEHAVIOR</MenuItem>
                        <MenuItem value="TEAMWORK">TEAMWORK</MenuItem>
                        <MenuItem value="COMMUNICATION">COMMUNICATION</MenuItem>
                        <MenuItem value="LEADERSHIP">LEADERSHIP</MenuItem>
                        <MenuItem value="INNOVATION">INNOVATION</MenuItem>
                        <MenuItem value="OFFICE_ENVIRONMENT">OFFICE_ENVIRONMENT</MenuItem>
                        <MenuItem value="OTHER">OTHER</MenuItem>
                    </Select>
                </FormControl>
                <Paper sx={{p: 3, mb: 3}}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Feedback</TableCell>
                                    <TableCell>Date Submitted</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feedbacks.map((feedback) => (
                                    <TableRow key={feedback.id}>
                                        <TableCell>{feedback.feedbackType}</TableCell>
                                        <TableCell>{feedback.feedbackText}</TableCell>
                                        <TableCell>{format(new Date(feedback.dateSubmitted), 'PPpp')}</TableCell>
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
        </Box>
    );
};

export default ViewFeedbacksPage;
