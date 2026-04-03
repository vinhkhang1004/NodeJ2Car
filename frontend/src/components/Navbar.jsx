import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, LogOut, User, Menu, X, Settings, ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useContext(CartContext);
  const [keyword, setKeyword] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="glass-header">
      <div className="container flex items-center justify-between" style={{ padding: '1rem 20px' }}>
        
        {/* Logo */}
        <Link to={user && user.isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-2" style={{ zIndex: 50 }}>
          <Settings color="var(--primary-color)" size={28} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>J2<span style={{ color: 'var(--primary-color)' }}>Car</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="flex items-center gap-6" style={{ display: 'none' }} id="desktop-menu">
          {(!user || !user.isAdmin) && (
          <form onSubmit={handleSearch} className="flex items-center" style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search parts..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="form-input" 
              style={{ width: '300px', paddingRight: '2.5rem', borderRadius: '20px' }}
            />
            <button type="submit" style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }}>
              <Search size={20} />
            </button>
          </form>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/cart" className="flex items-center relative mr-2" style={{ color: 'var(--text-main)' }}>
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {totalItems}
                  </span>
                )}
              </Link>
              {user.isAdmin && (
                <Link to="/admin/dashboard" className="btn" style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)' }}>
                  Admin Dashboard
                </Link>
              )}
              <span className="flex items-center gap-2 text-muted">
                <User size={18} /> {user.name}
              </span>
              <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '20px' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/cart" className="flex items-center relative mr-2 text-muted hover-white" style={{ transition: 'color 0.2s' }}>
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link to="/login" style={{ fontWeight: '500' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '20px' }}>Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ zIndex: 50 }}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          {(!user || !user.isAdmin) && (
          <form onSubmit={handleSearch} className="flex items-center mb-4" style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search parts..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="form-input" 
              style={{ width: '100%', paddingRight: '2.5rem', borderRadius: '20px' }}
            />
            <button type="submit" style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }}>
              <Search size={20} />
            </button>
          </form>
          )}
          {user ? (
            <div className="flex flex-col gap-4">
              {user.isAdmin && (
                <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: '500', color: 'var(--primary-color)' }}>
                  Admin Dashboard
                </Link>
              )}
              <span className="flex items-center gap-2 text-muted pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <User size={18} /> {user.name}
              </span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-error" style={{ padding: '0.5rem 0' }}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link to="/login" onClick={() => setIsMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: '500' }}>Login</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      {/* Add responsive styles right here for simplicity without modifying index.css repeatedly */}
      <style>{`
        @media (min-width: 768px) {
          #desktop-menu { display: flex !important; }
          .mobile-toggle { display: none; }
          .mobile-menu { display: none; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
