import React from 'react';
import { Link } from 'react-router-dom';

const PartCard = ({ part }) => {
  return (
    <Link to={`/part/${part._id}`} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
      <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
        <img 
          src={part.imageUrl} 
          alt={part.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="flex justify-between items-center mb-4">
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 'bold', letterSpacing: '1px' }}>
            {part.category}
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
            ${part.price.toFixed(2)}
          </span>
        </div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600' }}>{part.name}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', flexGrow: 1 }}>
          {part.description.substring(0, 80)}...
        </p>
        <div style={{ fontSize: '0.85rem', color: part.stock > 0 ? 'var(--text-muted)' : 'var(--error-color)', fontWeight: '500' }}>
          {part.stock > 0 ? `${part.stock} in stock` : 'Out of Stock'}
        </div>
      </div>
    </Link>
  );
};

export default PartCard;
