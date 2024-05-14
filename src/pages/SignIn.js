import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import logo from './assets/logo.png';
import { useUser } from "../context/UserContext";

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Track loading state
    const navigate = useNavigate();
    const { saveUser } = useUser();

    useEffect(() => {
        document.title = "Sign In - HRConnect";
    }, []);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Begin loading
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signin`, { email, password });
            if (response.status === 200) {
                localStorage.setItem('userToken', response.data.token);
                await fetchUserDetails(email, response.data.token);
            } else {
                alert('Sign In Failed');
            }
        } catch (error) {
            console.error('Sign In Error', error);
            alert('Invalid credentials'); // Consider more specific messaging
        } finally {
            setIsLoading(false); // End loading
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
                alert('Failed to fetch user details');
            }
        } catch (error) {
            console.error('Error fetching user details', error);
            alert('Failed to retrieve user data');
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <img src={logo} alt="HRConnect Logo" className="logo"/>
                <h2>Welcome Back</h2>
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
                </form>
            </div>
        </div>
    );
};

export default SignIn;
