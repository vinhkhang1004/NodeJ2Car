import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getFileUrl } from '../lib/utils';

const ProductCard = ({ product }) => {
  const { addToCart } = React.useContext(CartContext);
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)} 
      className="card cursor-pointer group" 
      style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}
    >
      <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
        <img 
          src={getFileUrl(product.imageUrl)}
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/27272a/71717a?text=No+Image'; }}
        />
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="flex justify-between items-center mb-4">
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 'bold', letterSpacing: '1px' }}>
            {product.category?.name || 'Uncategorized'}
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
            {product.price?.toLocaleString('vi-VN')}₫
          </span>
        </div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600' }}>{product.name}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', flexGrow: 1 }}>
          {product.description?.substring(0, 80)}...
        </p>
        <div style={{ fontSize: '0.85rem', color: product.stock > 0 ? 'var(--text-muted)' : 'var(--error-color)', fontWeight: '500', marginBottom: '1rem' }}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            disabled={product.stock <= 0}
            className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 border border-primary/20 hover:border-primary font-bold py-5 rounded-xl"
          >
            <ShoppingCart size={18} className="mr-2" /> 
            {product.stock > 0 ? 'Thêm giỏ' : 'Hết hàng'}
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl px-3"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/product/${product._id}`);
            }}
          >
            <Eye size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
