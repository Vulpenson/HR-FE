import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import {useNavigate} from "react-router-dom";
import {useUser} from "../context/UserContext";

const Sidebar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {user} = useUser();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const menuItems = [
        { name: 'View Payslips', icon: <AccountBalanceWalletIcon />, path: '/payslips' },
        { name: 'Absences', icon: <EventNoteIcon />, path: '/absences' },
        { name: 'Job Applications', icon: <WorkIcon />, path: '/jobs' },
        { name: 'Onboarding', icon: <PeopleIcon />, path: '/onboarding' },
        ...(user && user.offboarding ? [{ name: 'Offboarding', icon: <ExitToAppIcon />, path: '/offboarding' }] : []),
        { name: 'Employee Engagement', icon: <EmojiEventsIcon />, path: '/engagement' },
        { name: 'Employee Self-Service', icon: <SelfImprovementIcon />, path: '/self-service' },
        { name: 'Performance Management', icon: <WorkIcon />, path: '/performance' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: 240,
                    boxSizing: 'border-box',
                    height: '100vh',
                    backgroundColor: 'primary.main',
                },
            }}
        >
            <div style={{height: theme.mixins.toolbar.minHeight}} />
            <List>
                {menuItems.map((item, index) => (
                    <ListItem
                        button
                        key={item.name}
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                            backgroundColor: 'secondary.main', // Set background color to white
                            color: theme.palette.text.primary, // Ensure text color is from the theme for readability
                            transition: '0.5s',
                            '&:hover': {
                                backgroundColor: theme.palette.grey[100],
                                transform: 'scale(1.05)',
                                boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' // subtle shadow
                            }
                        }}>
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.name}
                            primaryTypographyProps={{ style: { fontWeight: 'medium' } }} />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
}

export default Sidebar;