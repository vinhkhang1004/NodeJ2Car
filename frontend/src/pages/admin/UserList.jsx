import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader2, Trash2, Check, X } from 'lucide-react';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/auth/users');
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/auth/${id}`);
                fetchUsers();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <h1 className="title">Users</h1>

            {loading ? (
                <div className="flex justify-center items-center" style={{ minHeight: '40vh' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
                </div>
            ) : error ? (
                <div className="alert alert-error">{error}</div>
            ) : (
                <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.3)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>NAME</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>EMAIL</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ADMIN</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{user._id}</td>
                                    <td style={{ padding: '1rem' }}>{user.name}</td>
                                    <td style={{ padding: '1rem' }}><a href={`mailto:${user.email}`} style={{ color: 'var(--primary-color)' }}>{user.email}</a></td>
                                    <td style={{ padding: '1rem' }}>
                                        {user.isAdmin ? (
                                            <Check color="var(--success-color)" size={20} />
                                        ) : (
                                            <X color="var(--error-color)" size={20} />
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {!user.isAdmin && (
                                            <button className="btn" style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)' }} onClick={() => deleteHandler(user._id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserList;
