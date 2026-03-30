import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, Package, TrendingUp, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalParts: 0, totalUsers: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/parts/admin/stats');
                setStats(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
        </div>
    );

    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <h1 className="title">Admin Dashboard</h1>
            
            <div className="grid grid-cols-3" style={{ marginBottom: '3rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary-color)' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Users</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalUsers}</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success-color)' }}>
                        <Package size={32} />
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Parts</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalParts}</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '12px', color: '#a78bfa' }}>
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sales (Mock)</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>$0.00</div>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Management Quick Links</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <Link to="/admin/users" className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <Users size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Manage Users</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>View or delete registered user accounts.</p>
                </Link>

                <Link to="/admin/parts" className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <Package size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Manage Auto Parts</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Create, update, or delete auto parts in the database.</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
