import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

export const AdminDashboardPlaceholder = () => {
  const { user } = useAuth();

  if (!user || (user.role !== 'club_admin' && user.role !== 'super_admin')) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 20px' }}>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', borderColor: 'rgba(244,63,94,0.3)' }}>
          <AlertTriangle size={40} color="#f43f5e" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f43f5e', marginBottom: '8px' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Server-side authorization protection. You must log in as a Club Admin or Super Admin to access this workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LayoutDashboard size={24} color="#818cf8" />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Admin Workspace</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Role: <strong style={{ color: '#fff' }}>{user.role}</strong> {user.club_name ? `| Assigned Club: ${user.club_name}` : ''}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', padding: '6px 14px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '20px', fontWeight: 600, border: '1px solid rgba(99,102,241,0.3)' }}>
              Server-Side RBAC Active
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Session</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>{user.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Isolation Enforcement</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: '#10b981' }}>Enforced</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No Cross-Club Data Access</div>
          </div>
        </div>

      </div>
    </div>
  );
};
