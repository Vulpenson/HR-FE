import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import logo from './assets/logo.png';
import { useUser } from "../context/UserContext";

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { saveUser } = useUser();
    const [forgotPassword, setForgotPassword] = useState(false);
    const [message, setMessage] = useState('');

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signin`, { email, password });
            if (response.status === 200) {
                localStorage.setItem('userToken', response.data.token);
                await fetchUserDetails(email, response.data.token);
            } else {
                setMessage('Sign In Failed');
            }
        } catch (error) {
            console.error('Sign In Error', error);
            setMessage('Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserDetails = async (email, token) => {
        try {
            const encodedEmail = encodeURIComponent(email);
            const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user/${encodedEmail}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userResponse.status === 200) {
                saveUser(userResponse.data, token);
                navigate("/mainpage");
            } else {
                setMessage('Failed to fetch user details');
            }
        } catch (error) {
            console.error('Error fetching user details', error);
            setMessage('Failed to retrieve user data');
        }
    };

    const handleForgotPassword = async () => {
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
            console.error('Error sending password reset link', error);
            setMessage('Error sending password reset link.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <img src={logo} alt="HRConnect Logo" className="logo" />
                <h2>Welcome Back</h2>
                {message && <p>{message}</p>}
                {!forgotPassword ? (
                    <form onSubmit={handleSignIn}>
                        <div className="input-group">
                            <label>Email:</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Password:</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="signin-button" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                        <button type="button" className="forgot-password-button" onClick={() => setForgotPassword(true)}>
                            Forgot Password?
                        </button>
                    </form>
                ) : (
                    <div>
                        <div className="input-group">
                            <label>Enter your email to reset password:</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <button onClick={handleForgotPassword} className="signin-button" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                        <button type="button" className="forgot-password-button" onClick={() => setForgotPassword(false)}>
                            Back to Sign In
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignIn;
