// src/pages/SignIn.js
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate instead of useHistory
import './SignIn.css';
import logo from './assets/logo.png';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');// Add rememberMe state
    const navigate = useNavigate();  // useNavigate hook instead of useHistory

    useEffect(() => {
        document.title = "Sign In - HRConnect"; // Sets the page title
    }, []);

    const handleSignIn = async (e) => {
        e.preventDefault();
        console.log('Signing in:', email, password);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/signin', { email, password });
            if (response.status === 200) {
                // Save the JWT from response to local storage or state management
                localStorage.setItem('userToken', response.data.accessToken);
                navigate("/mainpage");  // navigate instead of history.push
            } else {
                alert('Sign In Failed');
            }
        } catch (error) {
            console.error('Sign In Error', error);
            alert('Invalid credentials');
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
                    <button type="submit" className="signin-button">Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
