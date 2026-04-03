import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../services/productService';
import { Loader2, ArrowLeft, ShoppingCart, Tag, AlertCircle } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = React.useContext(CartContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchProductById(id);
                setProduct(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
        </div>
    );

    if (error) return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div className="alert alert-error flex items-center gap-2">
                <AlertCircle size={20} /> {error}
            </div>
            <Link to="/" className="btn" style={{ marginTop: '1rem', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}>
                <ArrowLeft size={16} /> Quay lại
            </Link>
        </div>
    );

    if (!product) return null;

    const imageUrl = product.imageUrl?.startsWith('/') ? `http://localhost:5000${product.imageUrl}` : product.imageUrl;

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '4rem', paddingTop: '1rem' }}>
            <Link to="/" className="btn" style={{ marginBottom: '2rem', background: 'rgba(30, 41, 59, 1)', color: 'var(--text-main)' }}>
                <ArrowLeft size={16} /> Quay lại
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
                {/* Image Section */}
                <div style={{
                    borderRadius: 'var(--border-radius)',
                    overflow: 'hidden',
                    background: 'var(--bg-secondary)',
                    boxShadow: 'var(--card-shadow)',
                    border: '1px solid var(--border-color)',
                }}>
                    <img
                        src={imageUrl}
                        alt={product.name}
                        style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block', aspectRatio: '1/1' }}
                        onError={(e) => { e.target.src = 'https://placehold.co/600x600/1e293b/94a3b8?text=No+Image'; }}
                    />
                </div>

                {/* Details Section */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ 
                            fontSize: '0.85rem', 
                            textTransform: 'uppercase', 
                            color: 'var(--primary-color)', 
                            fontWeight: 'bold', 
                            letterSpacing: '1px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                             <Tag size={12} /> {product.category?.name || 'Uncategorized'}
                        </span>
                        {product.brand && (
                            <span style={{ 
                                fontSize: '0.85rem', 
                                color: 'var(--text-muted)', 
                                border: '1px solid var(--border-color)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px'
                            }}>
                                Thương hiệu: {product.brand}
                            </span>
                        )}
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2' }}>
                        {product.name}
                    </h1>

                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)', marginBottom: '1.5rem' }}>
                        {product.price?.toLocaleString('vi-VN')} VNĐ
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                        {product.description}
                    </p>

                    {product.sku && (
                        <div style={{ marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>SKU:</span> {product.sku}
                        </div>
                    )}

                    <div style={{ 
                        padding: '1.5rem', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--border-color)',
                        marginTop: 'auto'
                    }}>
                        <div style={{ 
                            fontSize: '1rem', 
                            color: product.stock > 0 ? 'var(--text-main)' : 'var(--error-color)', 
                            fontWeight: '500',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            {product.stock > 0 ? (
                                <><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-color)' }}></span> Còn hàng ({product.stock} sản phẩm)</>
                            ) : (
                                <><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error-color)' }}></span> Hết hàng</>
                            )}
                        </div>

                        <button 
                            className="btn btn-primary btn-block" 
                            style={{ padding: '1rem', fontSize: '1.1rem', opacity: product.stock <= 0 ? 0.5 : 1, cursor: product.stock <= 0 ? 'not-allowed' : 'pointer' }}
                            disabled={product.stock <= 0}
                            onClick={() => {
                                addToCart(product, 1);
                                alert('Đã thêm sản phẩm vào giỏ hàng!');
                            }}
                        >
                            <ShoppingCart size={20} />
                            {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    div[style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductDetail;
