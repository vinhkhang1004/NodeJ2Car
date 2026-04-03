import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Giỏ hàng trống</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '30px' }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem', paddingTop: '1rem' }}>
      <Link to="/" className="btn" style={{ marginBottom: '2rem', background: 'rgba(30, 41, 59, 1)', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> Tiếp tục mua sắm
      </Link>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Giỏ hàng của bạn</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.map((item) => {
            const product = item.product;
            const itemImageUrl = product.imageUrl?.startsWith('/') ? `http://localhost:5000${product.imageUrl}` : product.imageUrl;
            
            return (
              <div key={product._id} style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                background: 'var(--bg-secondary)', 
                padding: '1.5rem', 
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '10px', overflow: 'hidden', background: '#1e293b', flexShrink: 0 }}>
                  <img src={itemImageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/100x100/1e293b/94a3b8?text=Image'; }} />
                </div>
                
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    <Link to={`/product/${product._id}`} style={{ color: 'var(--text-main)' }}>{product.name}</Link>
                  </h3>
                  <div style={{ color: 'var(--success-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {new Intl.NumberFormat('vi-VN').format(product.price || 0)} VNĐ
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                    <button 
                      onClick={() => updateQuantity(product._id, item.quantity - 1)}
                      style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(product._id, Math.min(item.quantity + 1, product.stock))}
                      style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', opacity: item.quantity >= product.stock ? 0.5 : 1 }}
                      disabled={item.quantity >= product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', width: '150px', textAlign: 'right', display: 'none' }} className="item-total">
                    {new Intl.NumberFormat('vi-VN').format((product.price || 0) * item.quantity)} VNĐ
                  </div>

                  <button 
                    onClick={() => removeFromCart(product._id)}
                    style={{ padding: '0.5rem', color: 'var(--error-color)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}
                    title="Xóa khỏi giỏ hàng"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-color)',
          marginTop: '1rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Tổng đơn hàng</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Tổng phụ</span>
            <span>{new Intl.NumberFormat('vi-VN').format(totalPrice)} VNĐ</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <span>Tổng cộng</span>
            <span style={{ color: 'var(--success-color)' }}>{new Intl.NumberFormat('vi-VN').format(totalPrice)} VNĐ</span>
          </div>
          
          <button 
            className="btn btn-primary w-full" 
            style={{ padding: '1rem', fontSize: '1.1rem', borderRadius: '10px' }}
            onClick={() => alert("Chức năng Thanh toán (Checkout) đang được phát triển!")}
          >
            Tiến hành thanh toán
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              onClick={clearCart}
              style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'underline' }}
            >
              Xóa tất cả
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @media (min-width: 768px) {
          .item-total { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
