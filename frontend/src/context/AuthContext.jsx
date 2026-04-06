import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            // Load addresses from backend
            api.get('/auth/profile')
                .then(({ data }) => setAddresses(data.addresses || []))
                .catch(() => {});
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    const updateUserInfo = (data) => {
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
    };

    const updateAddresses = (newAddresses) => {
        setAddresses(newAddresses);
    };

    return (
        <AuthContext.Provider value={{ user, addresses, login, register, logout, updateUserInfo, updateAddresses, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
