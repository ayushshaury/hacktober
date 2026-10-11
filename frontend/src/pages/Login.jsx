import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle, Sparkles, Compass } from 'lucide-react';

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
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        
        <div className="card-panel" style={{ padding: '36px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#0F172A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', marginBottom: '12px' }}>
              <Compass size={22} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>Sign In to Platform</h2>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
              Access your BIT Sindri student or admin portal
            </p>
          </div>

          {error && (
            <div style={{ 
              padding: '12px 14px', 
              backgroundColor: '#FEF2F2', 
              border: '1px solid #FECACA', 
              color: '#991B1B', 
              borderRadius: '6px', 
              marginBottom: '20px', 
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="student@bitsindri.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '11px', marginTop: '12px', fontSize: '0.95rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
              Click to autofill demo account:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                Student Accounts (4)
              </div>
              <button 
                type="button"
                onClick={() => fillDemoAccount('student@bitsindri.ac.in', 'password123')}
                className="btn btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <span>Student: Ayush Shaurya</span>
                <span style={{ color: '#2563EB', fontWeight: 600 }}>Fill</span>
              </button>

              <button 
                type="button"
                onClick={() => fillDemoAccount('priya.sharma@bitsindri.ac.in', 'password123')}
                className="btn btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <span>Student: Priya Sharma</span>
                <span style={{ color: '#2563EB', fontWeight: 600 }}>Fill</span>
              </button>

              <button 
                type="button"
                onClick={() => fillDemoAccount('rohan.verma@bitsindri.ac.in', 'password123')}
                className="btn btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <span>Student: Rohan Verma</span>
                <span style={{ color: '#2563EB', fontWeight: 600 }}>Fill</span>
              </button>

              <button 
                type="button"
                onClick={() => fillDemoAccount('ananya.gupta@bitsindri.ac.in', 'password123')}
                className="btn btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <span>Student: Ananya Gupta</span>
                <span style={{ color: '#2563EB', fontWeight: 600 }}>Fill</span>
              </button>

              <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginTop: '6px' }}>
                Admin Accounts
              </div>
              <button 
                type="button"
                onClick={() => fillDemoAccount('hncc.admin@bitsindri.ac.in', 'password123')}
                className="btn btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <span>Club Admin (HnCC)</span>
                <span style={{ color: '#2563EB', fontWeight: 600 }}>Fill</span>
              </button>

              <button 
                type="button"
                onClick={() => fillDemoAccount('admin@bitsindri.ac.in', 'password123')}
                className="btn btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <span>Super Admin Console</span>
                <span style={{ color: '#DC2626', fontWeight: 600 }}>Fill</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: '#64748B' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2563EB', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
