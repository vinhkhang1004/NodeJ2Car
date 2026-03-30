import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (user) {
            navigate(redirect);
        }
    }, [user, navigate, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await register(name, email, password);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center animate-fade-in" style={{ minHeight: '80vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
                <h2 className="title" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
                
                {error && <div className="alert alert-error">{error}</div>}
                
                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Register'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} style={{ color: 'var(--primary-color)', fontWeight: '500' }}>
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
