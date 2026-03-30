import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, ShoppingCart, Check, X } from 'lucide-react';

const PartDetail = () => {
  const [part, setPart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { id } = useParams();

  useEffect(() => {
    const fetchPart = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/parts/${id}`);
        setPart(data);
        setError('');
      } catch (err) {
        setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPart();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
    </div>
  );

  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <Link to="/" className="btn" style={{ marginBottom: '2rem', padding: '0.5rem 1rem', background: 'var(--bg-secondary)', color: 'var(--text-main)' }}>
        <ArrowLeft size={18} /> Back to Parts
      </Link>
      
      <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 500px', minHeight: '400px', borderRight: '1px solid var(--border-color)' }}>
          <img 
            src={part.imageUrl} 
            alt={part.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        
        <div style={{ flex: '1 1 400px', padding: '3rem', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '0.5rem' }}>
            {part.brand} • {part.category}
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>
            {part.name}
          </h1>
          
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)', marginBottom: '2rem' }}>
            ${part.price?.toFixed(2)}
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
              {part.description}
            </p>
          </div>
          
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <div className="flex items-center gap-4 mb-4">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', color: part.stock > 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                {part.stock > 0 ? <><Check size={20} /> In Stock ({part.stock})</> : <><X size={20} /> Out of Stock</>}
              </span>
            </div>
            
            <button 
              className="btn btn-primary btn-block" 
              disabled={part.stock === 0}
              style={{ padding: '1rem', fontSize: '1.1rem', opacity: part.stock === 0 ? 0.5 : 1, cursor: part.stock === 0 ? 'not-allowed' : 'pointer' }}
            >
              <ShoppingCart size={20} /> 
              {part.stock > 0 ? 'Add to Cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartDetail;
