import React, { useState } from 'react';
import axios from 'axios';

const RequestPasswordReset = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/request-password-reset`, null, {
                params: { email }
            });
            if (response.status === 200) {
                setMessage('Password reset link sent to your email.');
            } else {
                setMessage('Error sending password reset link.');
            }
        } catch (error) {
            setMessage('Error sending password reset link.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="request-password-reset-container">
            <h2>Request Password Reset</h2>
            <form onSubmit={handleRequestReset}>
                <div className="input-group">
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default RequestPasswordReset;
