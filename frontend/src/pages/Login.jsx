import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle } from 'lucide-react';
import { PixelIcon } from '../components/PixelIcon';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'super_admin') {
        navigate('/super-admin');
      } else if (loggedUser.role === 'club_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
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
              SIGN IN
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
              ACCESS BIT SINDRI CLUBS PORTAL
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
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                className="pixel-input"
                placeholder="your.email@bitsindri.ac.in"
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
              {loading ? 'AUTHENTICATING...' : 'SIGN IN →'}
            </button>
          </form>

          {/* Demo Login Credentials */}
          <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-gold)', marginBottom: '8px', letterSpacing: '0.04em' }}>
              [ QUICK DEMO LOGIN ]
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('ayushshaury@gmail.com', 'admin123')}
                className="filter-btn"
                style={{ fontSize: '0.72rem', padding: '6px' }}
              >
                ADMIN DEMO
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('rahul.verma@bitsindri.ac.in', 'student123')}
                className="filter-btn"
                style={{ fontSize: '0.72rem', padding: '6px' }}
              >
                STUDENT DEMO
              </button>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            NEW TO THE PORTAL?{' '}
            <Link to="/register" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 700 }}>
              REGISTER HERE
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
