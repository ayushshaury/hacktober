import React, { useState, useEffect } from 'react';
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
  const [animatingLogin, setAnimatingLogin] = useState(false);
  const [animatingUser, setAnimatingUser] = useState(null);
  const [progress, setProgress] = useState(15);

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !animatingLogin) {
      navigate('/');
    }
  }, [user, navigate, animatingLogin]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      setAnimatingUser(loggedUser);
      setAnimatingLogin(true);
      let p = 20;
      const interval = setInterval(() => {
        p += 25;
        if (p >= 100) {
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => {
            navigate('/');
          }, 600);
        } else {
          setProgress(p);
        }
      }, 300);
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
      const newUser = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        department: regDepartment,
        roll_number: regRollNumber,
        batch_year: regBatchYear,
        phone: regPhone
      });
      setAnimatingUser(newUser);
      setAnimatingLogin(true);
      let p = 20;
      const interval = setInterval(() => {
        p += 25;
        if (p >= 100) {
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => {
            navigate('/');
          }, 600);
        } else {
          setProgress(p);
        }
      }, 300);
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-gold)', marginBottom: '10px', letterSpacing: '0.04em' }}>
                [ QUICK DEMO LOGIN (3 ACCOUNTS) ]
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('rahul@example.com', 'password123')}
                  className="filter-btn"
                  style={{ fontSize: '0.72rem', padding: '8px 4px', textAlign: 'center' }}
                  title="Club Admin: rahul@example.com"
                >
                  RAHUL (HNCC)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('student@bitsindri.ac.in', 'password123')}
                  className="filter-btn"
                  style={{ fontSize: '0.72rem', padding: '8px 4px', textAlign: 'center' }}
                  title="Student 1: student@bitsindri.ac.in"
                >
                  STUDENT 1
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('ananya.student@bitsindri.ac.in', 'password123')}
                  className="filter-btn"
                  style={{ fontSize: '0.72rem', padding: '8px 4px', textAlign: 'center' }}
                  title="Student 2: ananya.student@bitsindri.ac.in"
                >
                  STUDENT 2
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* PIXELATED ART ANIMATION OVERLAY UPON SUCCESSFUL LOGIN */}
      {animatingLogin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          backgroundColor: '#04080c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {/* Retro CRT Scanline Texture Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%), linear-gradient(90deg, rgba(243, 208, 99, 0.02), rgba(0, 255, 204, 0.02), rgba(243, 208, 99, 0.02))',
            backgroundSize: '100% 3px, 6px 100%',
            pointerEvents: 'none',
            zIndex: 1
          }} />

          {/* Glowing Radial Cyber Grid Vignette */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at center, rgba(243, 208, 99, 0.16) 0%, rgba(7, 12, 16, 0.95) 75%)',
            pointerEvents: 'none'
          }} />

          {/* Central 8-bit Pixel Card Container */}
          <div 
            className="pixel-corner-mark"
            style={{
              position: 'relative',
              zIndex: 2,
              backgroundColor: '#0a1017',
              border: '2px solid var(--color-gold)',
              padding: '36px 32px',
              maxWidth: '520px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(243, 208, 99, 0.3), 6px 6px 0px #5c4c1a',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {/* Animated 8-bit crest / avatar badge with pulsing neon glow */}
            <div style={{
              width: '88px',
              height: '88px',
              margin: '0 auto 20px auto',
              backgroundColor: '#070c10',
              border: '2px solid var(--color-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              boxShadow: '3px 3px 0px #8a7329, 0 0 24px rgba(243, 208, 99, 0.5)',
              imageRendering: 'pixelated'
            }}>
              <img 
                src={bitSindriCrest} 
                alt="BIT Sindri Crest" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain', 
                  imageRendering: 'pixelated' 
                }} 
              />
            </div>

            {/* Pixel Stamp Tag */}
            <div style={{
              display: 'inline-block',
              padding: '5px 16px',
              backgroundColor: 'rgba(243, 208, 99, 0.15)',
              border: '1px solid var(--color-gold)',
              color: 'var(--color-gold)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.88rem',
              letterSpacing: '0.08em',
              marginBottom: '14px',
              textTransform: 'uppercase',
              boxShadow: '2px 2px 0px #5c4c1a'
            }}>
              ★ ACCESS GRANTED ★
            </div>

            <h2 style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '1.5rem',
              color: 'var(--text-cream)',
              marginBottom: '6px',
              letterSpacing: '0.04em'
            }}>
              AUTHENTICATION SUCCESS
            </h2>

            <div style={{
              fontSize: '0.86rem',
              color: 'var(--color-mint)',
              marginBottom: '20px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
              fontWeight: 700
            }}>
              WELCOME, {animatingUser?.name ? animatingUser.name.toUpperCase() : 'USER'}!
            </div>

            {/* Pixel Info Terminal Card */}
            <div style={{
              backgroundColor: '#060b10',
              border: '1px solid var(--border-card)',
              padding: '14px 18px',
              textAlign: 'left',
              marginBottom: '22px',
              fontSize: '0.78rem',
              lineHeight: 1.6,
              color: 'var(--text-muted)'
            }}>
              <div><span style={{ color: 'var(--color-gold)' }}>IDENTITY:</span> <strong style={{ color: 'var(--text-cream)' }}>{animatingUser?.name || 'Verified Member'}</strong></div>
              <div><span style={{ color: 'var(--color-cyan)' }}>ROLE:</span> <span style={{ color: animatingUser?.role === 'club_admin' ? 'var(--color-gold)' : 'var(--color-mint)', fontWeight: 700 }}>{animatingUser?.role === 'club_admin' ? 'CLUB ADMINISTRATOR' : 'BIT SINDRI STUDENT'}</span></div>
              <div><span style={{ color: 'var(--color-mint)' }}>STATUS:</span> VERIFIED BIT SINDRI SESSION</div>
              <div><span style={{ color: 'var(--text-dim)' }}>SYSTEM:</span> INITIALIZING WORKSPACE MATRIX...</div>
            </div>

            {/* Retro Chunky Segmented 8-bit Progress Bar */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-gold)',
                marginBottom: '6px',
                fontWeight: 700
              }}>
                <span>LOADING MATRIX</span>
                <span>{progress}%</span>
              </div>
              <div style={{
                height: '18px',
                backgroundColor: '#04070a',
                border: '1px solid var(--border-gold)',
                padding: '2px',
                display: 'flex',
                gap: '2px'
              }}>
                {Array.from({ length: 20 }).map((_, idx) => {
                  const filled = (idx + 1) * 5 <= progress;
                  return (
                    <div 
                      key={idx}
                      style={{
                        flex: 1,
                        backgroundColor: filled ? (idx < 14 ? 'var(--color-gold)' : 'var(--color-mint)') : 'transparent',
                        boxShadow: filled ? '0 0 6px rgba(243, 208, 99, 0.7)' : 'none',
                        transition: 'background-color 0.2s ease'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em'
            }}>
              [ ENTERING BIT SINDRI UNIFIED CLUBS DIRECTORY... ]
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
