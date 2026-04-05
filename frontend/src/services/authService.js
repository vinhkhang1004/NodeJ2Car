import api from './api';

export const login = async (email, password) => {
    return await api.post('/auth/login', { email, password });
};

export const register = async (name, email, password) => {
    return await api.post('/auth/register', { name, email, password });
};

export const getProfile = async () => {
    return await api.get('/auth/profile');
};

export const updateProfile = async (userData) => {
    return await api.put('/auth/profile', userData);
};

export const fetchUsers = async () => {
    return await api.get('/auth/users');
};

export const deleteUser = async (id) => {
    return await api.delete(`/auth/${id}`);
};
