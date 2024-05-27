import React, {createContext, useContext, useEffect, useState} from 'react';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('userData')));
    const [token, setToken] = useState(localStorage.getItem('userToken'));

    useEffect(() => {
        // Sync the user data with local storage whenever it changes
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('userToken', token);
    }, [user, token]);

    const saveUser = (userData, authToken) => {
        localStorage.setItem('userToken', authToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
    };

    const clearUser = () => {
        setUser(null);
        setToken(null);
    };

    return (
        <UserContext.Provider value={{ user, token, saveUser, clearUser}}>
            {children}
        </UserContext.Provider>
    );
};