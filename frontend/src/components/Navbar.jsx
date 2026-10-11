import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PixelIcon } from './PixelIcon';
import { Search, LogOut, LayoutDashboard, ShieldAlert, User, FileText } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav style={{
      backgroundColor: 'rgba(9, 14, 19, 0.96)',
      borderBottom: '1px solid var(--border-gold-dim)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
    }}>
      <div className="container" style={{
        height: '66px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        
        {/* Left: Pixel Logo & Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '1px solid var(--border-gold)',
            backgroundColor: '#0c141c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '1px 1px 0px #8a7329'
          }}>
            <PixelIcon name="building" size={26} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-cream)',
              letterSpacing: '0.04em',
              lineHeight: 1.1
            }}>
              BIT SINDRI
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              color: 'var(--border-gold)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              CLUBS PORTAL
            </div>
          </div>
        </Link>

        {/* Center: Retro Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          {[
            { path: '/', label: 'HOME' },
            { path: '/clubs', label: 'CLUBS' },
            { path: '/events', label: 'EVENTS' },
            { path: '/recommendations', label: 'AI MATCH' }
          ].map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.92rem',
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  color: active ? 'var(--color-gold)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  padding: '8px 2px',
                  borderBottom: active ? '2px solid var(--color-gold)' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  textShadow: active ? '0 0 8px rgba(243, 208, 99, 0.4)' : 'none'
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {user && user.role === 'student' && (
            <Link
              to="/my-applications"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                fontWeight: 700,
                color: isActive('/my-applications') ? 'var(--color-gold)' : 'var(--text-muted)',
                padding: '8px 2px',
                borderBottom: isActive('/my-applications') ? '2px solid var(--color-gold)' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FileText size={13} /> APPLICATIONS
            </Link>
          )}
        </div>

        {/* Right: Search & Sign In / User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Search Trigger Button */}
          <Link
            to="/clubs"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-gold)',
              backgroundColor: 'transparent',
              color: 'var(--text-cream)',
              transition: 'all 0.15s ease',
              boxShadow: '1px 1px 0px #8a7329'
            }}
            title="Search Clubs"
          >
            <Search size={16} />
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Role Shortcut */}
              {user.role === 'super_admin' && (
                <Link
                  to="/super-admin"
                  className="btn-pixel-outline"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', borderColor: 'var(--color-coral)', color: 'var(--color-coral)' }}
                >
                  <ShieldAlert size={13} /> SUPER ADMIN
                </Link>
              )}

              {(user.role === 'club_admin' || user.role === 'super_admin') && (
                <Link
                  to="/admin/dashboard"
                  className="btn-pixel-outline"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  <LayoutDashboard size={13} /> WORKSPACE
                </Link>
              )}

              {/* User Profile */}
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  border: '1px solid var(--border-card)',
                  backgroundColor: '#0c141c',
                  color: 'var(--text-cream)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  textDecoration: 'none'
                }}
              >
                <User size={14} color="var(--color-gold)" />
                <span>{user.name?.split(' ')[0] || 'Profile'}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-pixel-outline"
              style={{
                padding: '7px 16px',
                fontSize: '0.85rem'
              }}
            >
              SIGN IN
            </Link>
          )}

        </div>

      </div>
    </nav>
  );
};
