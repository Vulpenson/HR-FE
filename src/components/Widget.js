import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Box, Card, CardContent, Typography, useTheme} from '@mui/material';

const Widget = ({ title, endpoint, formatData }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('userToken'); // Ensure the token is available
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setData(formatData(response.data)); // Formatting data as per the type of widget
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint, formatData]);

    return (
        <Card  sx={{ height: '100%' }}>
            <CardContent  sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%' }}>
                <div style={{height: theme.mixins.toolbar.minHeight}}/>
                <Typography variant="h6" component="div">
                    {title}
                </Typography>
                <Box mt={2}>
                    {loading ? <Typography>Loading...</Typography> :
                        error ? <Typography color="error">Error: {error}</Typography> :
                            data}
                </Box>
            </CardContent>
        </Card>
    );
};

export default Widget;
