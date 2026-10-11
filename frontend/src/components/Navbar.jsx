import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, Sparkles, User, LogOut, 
  ShieldAlert, LayoutDashboard, FileText
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.82)', 
      backdropFilter: 'blur(24px) saturate(190%)',
      WebkitBackdropFilter: 'blur(24px) saturate(190%)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.06)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div className="container" style={{ height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Left: Brand Logo & Title */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '11px', 
            background: 'linear-gradient(135deg, #0F172A 0%, #0071E3 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="apple-box-hover"
          >
            <Compass size={21} />
          </div>
          <div>
            <div style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              BIT Sindri <span style={{ color: 'var(--color-secondary)' }}>Clubs</span>
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-light)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Institute Portal
            </div>
          </div>
        </Link>

        {/* Center Nav Links (Apple Floating Pill Menu) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          background: 'rgba(245, 245, 247, 0.7)',
          padding: '4px',
          borderRadius: '999px',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <Link 
            to="/" 
            style={{ 
              padding: '6px 14px', 
              borderRadius: '999px',
              fontSize: '0.86rem', 
              fontWeight: 600, 
              color: isActive('/') ? '#0071E3' : 'var(--text-muted)',
              backgroundColor: isActive('/') ? '#FFFFFF' : 'transparent',
              boxShadow: isActive('/') ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Home
          </Link>

          <Link 
            to="/clubs" 
            style={{ 
              padding: '6px 14px', 
              borderRadius: '999px',
              fontSize: '0.86rem', 
              fontWeight: 600, 
              color: isActive('/clubs') ? '#0071E3' : 'var(--text-muted)',
              backgroundColor: isActive('/clubs') ? '#FFFFFF' : 'transparent',
              boxShadow: isActive('/clubs') ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Clubs
          </Link>

          <Link 
            to="/events" 
            style={{ 
              padding: '6px 14px', 
              borderRadius: '999px',
              fontSize: '0.86rem', 
              fontWeight: 600, 
              color: isActive('/events') ? '#0071E3' : 'var(--text-muted)',
              backgroundColor: isActive('/events') ? '#FFFFFF' : 'transparent',
              boxShadow: isActive('/events') ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Events
          </Link>

          <Link 
            to="/recommendations" 
            style={{ 
              padding: '6px 14px', 
              borderRadius: '999px',
              fontSize: '0.86rem', 
              fontWeight: 600, 
              color: isActive('/recommendations') ? '#0071E3' : '#0071E3',
              backgroundColor: isActive('/recommendations') ? '#FFFFFF' : 'transparent',
              boxShadow: isActive('/recommendations') ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <Sparkles size={14} color="#0071E3" /> AI Match
          </Link>

          {user && user.role === 'student' && (
            <Link 
              to="/my-applications" 
              style={{ 
                padding: '6px 14px', 
                borderRadius: '999px',
                fontSize: '0.86rem', 
                fontWeight: 600, 
                color: isActive('/my-applications') ? '#0071E3' : 'var(--text-muted)',
                backgroundColor: isActive('/my-applications') ? '#FFFFFF' : 'transparent',
                boxShadow: isActive('/my-applications') ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <FileText size={14} /> My Applications
            </Link>
          )}
        </div>

        {/* Right Auth / User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              
              {/* Super Admin Access */}
              {user.role === 'super_admin' && (
                <Link to="/super-admin" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.82rem', borderColor: '#DC2626', color: '#DC2626', borderRadius: '999px' }}>
                  <ShieldAlert size={14} /> Super Admin
                </Link>
              )}

              {/* Club Admin Access */}
              {(user.role === 'club_admin' || user.role === 'super_admin') && (
                <Link to="/admin/dashboard" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '999px' }}>
                  <LayoutDashboard size={14} /> Club Workspace
                </Link>
              )}

              {/* My Profile Link */}
              <Link 
                to="/profile"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '5px 14px', 
                  backgroundColor: isActive('/profile') ? '#EBF5FF' : 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '999px', 
                  border: isActive('/profile') ? '1px solid #BAE0FD' : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: isActive('/profile') ? '0 2px 8px rgba(0, 113, 227, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className="apple-box-hover"
                title="Open My Profile"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url.startsWith('/uploads') ? `http://localhost:5000${user.avatar_url}` : user.avatar_url}
                    alt={user.name}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <User size={14} color="#0071E3" />
                )}
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: isActive('/profile') ? '#0071E3' : 'var(--text-main)' }}>
                  My Profile
                </span>
                <span className="badge" style={{ 
                  fontSize: '0.68rem', 
                  padding: '2px 8px',
                  backgroundColor: user.role === 'super_admin' ? '#FCE8E6' : user.role === 'club_admin' ? '#FEF7E0' : '#EBF5FF',
                  color: user.role === 'super_admin' ? '#C5221F' : user.role === 'club_admin' ? '#B08800' : '#0066CC'
                }}>
                  {user.role === 'super_admin' ? 'Super Admin' : user.role === 'club_admin' ? 'Club Admin' : 'Student'}
                </span>
              </Link>

              <button 
                onClick={handleLogout} 
                style={{ 
                  background: 'none', 
                  border: '1px solid rgba(0, 0, 0, 0.08)', 
                  padding: '8px', 
                  borderRadius: '50%', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className="apple-box-hover"
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
                Join Portal
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};
