import React, { useState } from 'react';
import axios from 'axios';
import './SelfService.css';

const SelfService = () => {
    const [templateId, setTemplateId] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGeneratePersonalDetailsPdf = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/pdf/personal-details', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'personal_details.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error generating personal details PDF:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFillPdfTemplate = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/pdf/fill-template/${templateId}`, {
                params: { reason },
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

    return (
        <div className="self-service-container">
            <h1>Employee Self-Service</h1>
            <div className="card">
                <h2>Generate Personal Details PDF</h2>
                <button onClick={handleGeneratePersonalDetailsPdf} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate PDF'}
                </button>
            </div>
            <div className="card">
                <h2>Fill PDF Template</h2>
                <input
                    type="text"
                    placeholder="Template ID"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <button onClick={handleFillPdfTemplate} disabled={loading}>
                    {loading ? 'Filling...' : 'Fill PDF Template'}
                </button>
            </div>
        </div>
    );
};

export default SelfService;
