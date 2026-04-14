import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            if (parsed.wishlist) setWishlist(parsed.wishlist);
            
            // Sync fresh data from profile
            api.get('/auth/profile')

                .then(({ data }) => {
                    setAddresses(data.addresses || []);
                    setWishlist(data.wishlist || []);
                    
                    // Update localStorage with fresh data
                    const updatedStored = { ...parsed, ...data };
                    localStorage.setItem('userInfo', JSON.stringify(updatedStored));
                })
                .catch(() => {});
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data);
        setWishlist(data.wishlist || []);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        setUser(data);
        setWishlist(data.wishlist || []);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        setUser(null);
        setAddresses([]);
        setWishlist([]);
        localStorage.removeItem('userInfo');
    };

    const toggleWishlist = async (productId) => {
        if (!user) return false;
        
        const isFavorite = wishlist.includes(productId);
        try {
            if (isFavorite) {
                await api.delete(`/auth/wishlist/${productId}`);
                setWishlist(prev => prev.filter(id => id !== productId));
            } else {
                await api.post(`/auth/wishlist/${productId}`);
                setWishlist(prev => [...prev, productId]);
            }
            return true;
        } catch (error) {
            console.error('Wishlist error:', error);
            return false;
        }
    };

    const updateUserInfo = (data) => {

        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
    };

    const updateAddresses = (newAddresses) => {
        setAddresses(newAddresses);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            addresses, 
            wishlist, 
            login, 
            register, 
            logout, 
            toggleWishlist, 
            updateUserInfo, 
            updateAddresses, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
