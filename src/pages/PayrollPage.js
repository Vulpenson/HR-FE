import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    Grid,
    useTheme,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem, Button
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {format, parseISO} from "date-fns";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const PayrollPage = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [chartRange, setChartRange] = useState(6);
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useUser();

    const fullName = user ? `${user.firstName} ${user.lastName}` : "User";

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const formatDate = (dateStr) => {
        return format(parseISO(dateStr), 'dd-MMM-yyyy');
    };

    const fetchPayrolls = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.get('http://localhost:8080/api/payroll/user/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setPayrolls(res.data.content);
            setTotalPages(res.data.totalPages);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch payrolls');
            setLoading(false);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    const latestPayroll = payrolls.length > 0 ? payrolls[0] : null;

    const payrollData = payrolls
        .map(payroll => ({
            date: formatDate(payroll.payDate),
            netPay: payroll.netPay
        }))
        .slice(-6)
        .reverse();

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleChartRangeChange = (event) => {
        setChartRange(event.target.value);
    };

    const handleNavigateToHRPage = () => {
        navigate('/hr-payrolls');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box component="main" sx={{flexGrow: 1, p: 3}}>
                <div style={{height: theme.mixins.toolbar.minHeight}}/>
                <Typography variant="h4" gutterBottom>{fullName}'s Payroll Information</Typography>
                {user && (user.role === 'ROLE_HR' || user.role === 'ROLE_ADMIN') && (
                    <Box>
                        <Button variant="contained" color="primary" onClick={handleNavigateToHRPage}>
                            Manage Payrolls (HR MODE)
                        </Button>
                    </Box>
                )}
                <div style={{height: 20}}/>
                {latestPayroll && (
                    <Paper elevation={4} sx={{p: 2, marginBottom: 2}}>
                        <Typography variant="h6">Latest Payroll</Typography>
                        <Typography>Date: {formatDate(latestPayroll.payDate)}</Typography>
                        <Typography>Net Pay: ${latestPayroll.netPay}</Typography>
                    </Paper>
                )}
                <Pagination count={totalPages} page={page} onChange={handlePageChange}/>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper elevation={4} sx={{p: 2}}>
                            {payrolls.map((payroll, index) => (
                                <Box key={index} sx={{marginBottom: 2, borderBottom: 1, borderColor: 'divider'}}>
                                    <Typography variant="h6">Payroll Date: {formatDate(payroll.payDate)}</Typography>
                                    <Typography>Net Pay: ${payroll.netPay}</Typography>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={payrollData} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date"/>
                                <YAxis/>
                                <Tooltip/>
                                <Line type="monotone" dataKey="netPay" stroke="#8884d8" activeDot={{r: 8}}/>
                            </LineChart>
                        </ResponsiveContainer>
                        <FormControl fullWidth>
                            <InputLabel>Chart Range</InputLabel>
                            <Select value={chartRange} label="Chart Range" onChange={handleChartRangeChange}>
                                <MenuItem value={6}>Last 6 Months</MenuItem>
                                <MenuItem value={12}>Last 12 Months</MenuItem>
                                <MenuItem value={18}>Last 18 Months</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default PayrollPage;
