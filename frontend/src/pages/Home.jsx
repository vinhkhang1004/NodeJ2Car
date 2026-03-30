import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import PartCard from '../components/PartCard';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { keyword } = useParams();

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/parts${keyword ? `?keyword=${keyword}` : ''}`);
        setParts(data);
        setError('');
      } catch (err) {
        setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [keyword]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 className="title" style={{ fontSize: '3rem', margin: '0' }}>
          {keyword ? `Search Results for "${keyword}"` : 'Premium Auto Parts'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '1rem' }}>
          Discover top-tier components for your vehicle's peak performance.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center" style={{ minHeight: '40vh' }}>
          <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : parts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <h2>No parts found.</h2>
          <p>Try searching with a different keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {parts.map(part => (
            <PartCard key={part._id} part={part} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
