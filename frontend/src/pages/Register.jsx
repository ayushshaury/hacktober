import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Key, AlertCircle, Compass } from 'lucide-react';

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
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        
        <div className="card-panel" style={{ padding: '36px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#0F172A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', marginBottom: '12px' }}>
              <Compass size={22} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>Student Registration</h2>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
              Create your account to submit induction forms & track events
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
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Rahul Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institute Email Address</label>
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563EB', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
