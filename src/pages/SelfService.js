import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    CircularProgress,
} from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './SelfService.css';
import { useUser } from '../context/UserContext';

const SelfService = () => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [file, setFile] = useState(null);
    const { token, user } = useUser();

    const handleFillPdfTemplate = async () => {
        setLoading(true);
        const templateId = 2; // Always use template ID 2
        try {
            const response = await axios.get(`http://localhost:8080/api/pdf/fill-template/${templateId}`, {
                params: { reason },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'filled_template.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error filling PDF template:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadTemplate = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('name', templateName);
        formData.append('file', file);

        try {
            await axios.post('http://localhost:8080/api/pdf-templates/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Template uploaded successfully!');
        } catch (error) {
            console.error('Error uploading template:', error);
            alert('Failed to upload template.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        setLoading(true);
        const templateId = 2; // Always use template ID 2
        try {
            const response = await axios.get(`http://localhost:8080/api/pdf-templates/${templateId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'template.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading PDF template:', error);
        } finally {
            setLoading(false);
        }
    };

    const hasRole = (roles) => {
        return roles.some(role => user.role.includes(role));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Navbar />
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 64 }} /> {/* This is to account for the navbar height */}
                    <Container className="self-service-container">
                        <Typography variant="h4" component="h1" align="center" gutterBottom>
                            Employee Self-Service
                        </Typography>
                        <Box className="card">
                            <Typography variant="h6" gutterBottom>
                                Fill PDF Template (ADEVERINTA ANGAJAT)
                            </Typography>
                            <TextField
                                label="Reason"
                                variant="outlined"
                                fullWidth
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                margin="normal"
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleFillPdfTemplate}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Fill PDF Template'}
                            </Button>
                        </Box>
                        {hasRole(['ROLE_ADMIN', 'ROLE_HR']) && (
                            <>
                                <Box className="card">
                                    <Typography variant="h6" gutterBottom>
                                        Upload PDF Template
                                    </Typography>
                                    <TextField
                                        label="Template Name"
                                        variant="outlined"
                                        fullWidth
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        margin="normal"
                                    />
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        style={{ marginTop: '16px' }}
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleUploadTemplate}
                                        disabled={loading}
                                        sx={{ mt: 2 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Upload Template'}
                                    </Button>
                                </Box>
                                <Box className="card">
                                    <Typography variant="h6" gutterBottom>
                                        Download PDF Template
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleDownloadTemplate}
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Download Template'}
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Container>
                </Box>
            </Box>
        </Box>
    );
};

export default SelfService;
