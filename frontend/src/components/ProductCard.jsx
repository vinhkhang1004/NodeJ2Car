import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(`/product/${product._id}`)} style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden', cursor: 'pointer' }}>
      <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
        <img 
          src={product.imageUrl?.startsWith('/') ? `http://localhost:5000${product.imageUrl}` : product.imageUrl} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="flex justify-between items-center mb-4">
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 'bold', letterSpacing: '1px' }}>
            {product.category?.name || 'Uncategorized'}
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
            {new Intl.NumberFormat('vi-VN').format(product.price || 0)} VNĐ
          </span>
        </div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600' }}>{product.name}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', flexGrow: 1 }}>
          {product.description?.substring(0, 80)}...
        </p>
        <div style={{ fontSize: '0.85rem', color: product.stock > 0 ? 'var(--text-muted)' : 'var(--error-color)', fontWeight: '500', marginBottom: '1rem' }}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
        </div>
        <button 
          className="btn btn-primary w-full mt-auto" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product._id}`);
          }}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
