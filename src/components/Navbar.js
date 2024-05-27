import React, { useState } from 'react';
import { AppBar, Toolbar, InputBase, IconButton, Avatar, MenuItem, Menu } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { token, clearUser } = useUser();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleLogoClick = () => {
        navigate('/mainpage');
    };

    const handleUserIconClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuClick = (path) => {
        navigate(path);
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8080/api/auth/signout', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            clearUser();
            navigate('/signin');
        } catch (err) {
            console.error('Failed to logout', err);
        }
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'primary' }}>
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="company logo"
                    sx={{ mr: 2 }}
                    onClick={handleLogoClick}
                >
                    <img src="/mainpage-logo.png" alt="Company Logo" style={{ height: '50px' }} />
                </IconButton>
                <div style={{ position: 'relative', flexGrow: 1, marginRight: '20px' }}>
                    <div style={{ position: 'absolute', zIndex: 1, display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
                        <SearchIcon style={{ color: 'black' }}/>
                    </div>
                    <InputBase
                        style={{
                            paddingLeft: '40px',
                            width: '15%',
                            backgroundColor: 'white',  // Adding a white background to the search input
                            borderRadius: '4px',      // Optionally add rounded corners
                        }}
                        placeholder="Search…"
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </div>
                <IconButton onClick={handleUserIconClick} color="inherit">
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>U</Avatar>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem onClick={() => handleMenuClick('/account-details')}>Account Details</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
