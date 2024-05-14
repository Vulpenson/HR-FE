import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('userToken'));

    const saveUser = (userData, authToken) => {
        localStorage.setItem('userToken', authToken);
        setToken(authToken);
        setUser(userData);
    };

    return (
        <UserContext.Provider value={{ user, token, saveUser}}>
            {children}
        </UserContext.Provider>
    );
};