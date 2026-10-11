import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Verifying authorization...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 20px' }}>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', borderColor: 'rgba(244,63,94,0.3)' }}>
          <ShieldAlert size={48} color="#f43f5e" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e', marginBottom: '8px' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
            Your account role (<strong>{user.role}</strong>) does not have privileges to access this admin route.
          </p>
          <a href="/" className="btn btn-secondary">
            Return to Student Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};
