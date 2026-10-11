import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { PixelIcon } from '../components/PixelIcon';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        
        <div style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-gold)',
          padding: '36px',
          boxShadow: '0 0 20px rgba(194, 166, 73, 0.12)'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '44px', height: '44px', border: '1px solid var(--border-gold)', backgroundColor: '#070c10', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <PixelIcon name="building" size={28} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.6rem', color: 'var(--text-cream)' }}>
              STUDENT SIGN UP
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
              JOIN THE BIT SINDRI CLUBS ECOSYSTEM
            </p>
          </div>

          {error && (
            <div style={{ 
              padding: '12px 14px', 
              backgroundColor: 'rgba(240, 113, 103, 0.15)', 
              border: '1px solid var(--color-coral)', 
              color: 'var(--color-coral)', 
              marginBottom: '20px', 
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                FULL NAME
              </label>
              <input
                type="text"
                className="pixel-input"
                placeholder="Rahul Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                INSTITUTE EMAIL
              </label>
              <input
                type="email"
                className="pixel-input"
                placeholder="student@bitsindri.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                PASSWORD
              </label>
              <input
                type="password"
                className="pixel-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pixel-gold"
              style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ALREADY HAVE AN ACCOUNT?{' '}
            <Link to="/login" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 700 }}>
              SIGN IN HERE
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
