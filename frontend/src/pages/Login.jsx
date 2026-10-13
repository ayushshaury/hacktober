import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle, CheckCircle, UserPlus, BookOpen, GraduationCap, Phone } from 'lucide-react';
import { PixelIcon } from '../components/PixelIcon';
import bitSindriCrest from '../assets/bit_sindri_crest.png';

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication (ECE)',
  'Electrical Engineering (EE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Chemical Engineering',
  'Mining Engineering',
  'Metallurgical Engineering',
  'Production & Industrial Engineering'
];

export const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering (CSE)');
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regBatchYear, setRegBatchYear] = useState('2023-2027');
  const [regPhone, setRegPhone] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'club_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        department: regDepartment,
        roll_number: regRollNumber,
        batch_year: regBatchYear,
        phone: regPhone
      });
      setSuccessMsg('Student account created successfully! Entering portal...');
      setTimeout(() => {
        navigate('/clubs');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: mode === 'register' ? '560px' : '440px', width: '100%', transition: 'all 0.2s ease' }}>
        
        <div style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-gold)',
          padding: '36px',
          boxShadow: '0 0 20px rgba(194, 166, 73, 0.12)'
        }} className="pixel-corner-mark">
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', border: '1px solid var(--border-gold)', backgroundColor: '#070c10', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', padding: '3px', boxShadow: '2px 2px 0px #8a7329' }}>
              <img src={bitSindriCrest} alt="BIT Sindri Crest" style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.65rem', color: 'var(--text-cream)', letterSpacing: '0.04em' }}>
              {mode === 'login' ? 'PORTAL ACCESS' : 'STUDENT REGISTRATION'}
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)', fontSize: '0.78rem', marginTop: '4px', letterSpacing: '0.06em' }}>
              {mode === 'login' ? 'BIT SINDRI • STUDENTS & CLUB ADMINS' : 'JOIN THE OFFICIAL CLUBS DIRECTORY'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px', 
            marginBottom: '24px',
            backgroundColor: '#080d12',
            padding: '4px',
            border: '1px solid var(--border-card)'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                padding: '9px 12px',
                border: 'none',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                backgroundColor: mode === 'login' ? 'var(--color-gold)' : 'transparent',
                color: mode === 'login' ? 'var(--text-dark)' : 'var(--text-muted)',
                boxShadow: mode === 'login' ? '1px 1px 0px #8a7329' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              [ SIGN IN ]
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              style={{
                padding: '9px 12px',
                border: 'none',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                backgroundColor: mode === 'register' ? 'var(--color-gold)' : 'transparent',
                color: mode === 'register' ? 'var(--text-dark)' : 'var(--text-muted)',
                boxShadow: mode === 'register' ? '1px 1px 0px #8a7329' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              [ REGISTER (STUDENT) ]
            </button>
          </div>

          {/* Feedback Alerts */}
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
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ 
              padding: '12px 14px', 
              backgroundColor: 'rgba(74, 222, 128, 0.15)', 
              border: '1px solid var(--color-mint)', 
              color: 'var(--color-mint)', 
              marginBottom: '20px', 
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM: SIGN IN */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                  EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  className="pixel-input"
                  placeholder="student@bitsindri.ac.in or admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                  PASSWORD *
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

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  New BIT Sindri student?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textDecoration: 'underline' }}
                  >
                    Register here
                  </button>
                </span>
              </div>
            </form>
          ) : (
            /* FORM: STUDENT REGISTRATION */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                  FULL NAME *
                </label>
                <input
                  type="text"
                  className="pixel-input"
                  placeholder="e.g. Ayush Shaurya"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                  COLLEGE / PERSONAL EMAIL *
                </label>
                <input
                  type="email"
                  className="pixel-input"
                  placeholder="e.g. student@bitsindri.ac.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                  DEPARTMENT / BRANCH *
                </label>
                <select
                  className="pixel-input"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  required
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                    ROLL NUMBER
                  </label>
                  <input
                    type="text"
                    className="pixel-input"
                    placeholder="e.g. 22/IT/045"
                    value={regRollNumber}
                    onChange={(e) => setRegRollNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                    BATCH YEAR
                  </label>
                  <input
                    type="text"
                    className="pixel-input"
                    placeholder="e.g. 2023-2027"
                    value={regBatchYear}
                    onChange={(e) => setRegBatchYear(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  className="pixel-input"
                  placeholder="e.g. +91 9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                    PASSWORD *
                  </label>
                  <input
                    type="password"
                    className="pixel-input"
                    placeholder="Min 6 chars"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-cream)', display: 'block', marginBottom: '6px' }}>
                    CONFIRM PASSWORD *
                  </label>
                  <input
                    type="password"
                    className="pixel-input"
                    placeholder="Confirm"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-pixel-gold"
                style={{ width: '100%', marginTop: '14px', padding: '12px' }}
              >
                {loading ? 'CREATING ACCOUNT...' : 'REGISTER & ENTER PORTAL →'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textDecoration: 'underline' }}
                  >
                    Sign In
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* Quick Demo Credentials for Testing */}
          {mode === 'login' && (
            <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-gold)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                [ QUICK DEMO LOGIN ]
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('hncc.admin@bitsindri.ac.in', 'password123')}
                  className="filter-btn"
                  style={{ fontSize: '0.72rem', padding: '6px' }}
                >
                  HNCC ADMIN
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('rahul@example.com', 'password123')}
                  className="filter-btn"
                  style={{ fontSize: '0.72rem', padding: '6px' }}
                >
                  RAHUL - HNCC
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('sneha@example.com', 'password123')}
                  className="filter-btn"
                  style={{ fontSize: '0.72rem', padding: '6px' }}
                >
                  SNEHA - HNCC
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('aman@example.com', 'password123')}
                  className="filter-btn"
                  style={{ fontSize: '0.72rem', padding: '6px' }}
                >
                  AMAN - ISTE
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
