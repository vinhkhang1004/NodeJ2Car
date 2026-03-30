import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, Trash2, Edit, Plus } from 'lucide-react';

const PartList = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchParts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/parts');
            setParts(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParts();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this part?')) {
            try {
                await api.delete(`/parts/${id}`);
                fetchParts();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const createPartHandler = async () => {
        try {
            const { data } = await api.post('/parts', {
                name: 'New Part',
                category: 'Category',
                price: 0,
                description: 'Description',
                stock: 0,
                imageUrl: 'https://via.placeholder.com/300',
                brand: 'Brand'
            });
            alert('Part created! You can now edit it.');
            fetchParts();
            // Ideally navigate to edit page, e.g. navigate(`/admin/part/${data._id}/edit`)
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="title" style={{ marginBottom: 0 }}>Auto Parts</h1>
                <button className="btn btn-primary" onClick={createPartHandler}>
                    <Plus size={20} /> Create Part
                </button>
            </div>

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
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>PRICE</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>CATEGORY</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>BRAND</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>STOCK</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.map((part) => (
                                <tr key={part._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{part._id}</td>
                                    <td style={{ padding: '1rem' }}>{part.name}</td>
                                    <td style={{ padding: '1rem' }}>${part.price.toFixed(2)}</td>
                                    <td style={{ padding: '1rem' }}>{part.category}</td>
                                    <td style={{ padding: '1rem' }}>{part.brand}</td>
                                    <td style={{ padding: '1rem', color: part.stock > 0 ? 'inherit' : 'var(--error-color)' }}>{part.stock}</td>
                                    <td style={{ padding: '1rem' }} className="flex items-center gap-2">
                                        <button className="btn" style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)' }}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="btn" style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)' }} onClick={() => deleteHandler(part._id)}>
                                            <Trash2 size={16} />
                                        </button>
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

export default PartList;
