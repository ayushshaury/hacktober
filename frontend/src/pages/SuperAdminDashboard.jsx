import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, CheckCircle, XCircle, Users, Award, 
  Building2, Calendar, FileText, Activity, Search, RefreshCw,
  UserPlus, UserMinus, ToggleLeft, ToggleRight, Lock, ExternalLink,
  Mail, Sparkles, UserCheck, Eye, EyeOff, Key
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('clubs'); // 'analytics', 'clubs', 'users', 'audit'
  
  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Search & Filter states
  const [clubSearch, setClubSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Modal / Assign State
  const [assignModalClub, setAssignModalClub] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignMode, setAssignMode] = useState('select'); // 'select' or 'email'
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Unrevoke Modal State
  const [unrevokeModalUser, setUnrevokeModalUser] = useState(null);
  const [unrevokeClubId, setUnrevokeClubId] = useState('');
  const [unrevokePassword, setUnrevokePassword] = useState('');
  const [showUnrevokePassword, setShowUnrevokePassword] = useState(false);
  
  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClubs(),
        fetchAnalytics(),
        fetchUsers(),
        fetchAuditLogs()
      ]);
    } catch (err) {
      console.error('Failed to load Super Admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    const res = await fetch('/api/super-admin/clubs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setClubs(data.clubs || []);
    }
  };

  const fetchAnalytics = async () => {
    const res = await fetch('/api/super-admin/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAnalytics(data.analytics);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/super-admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setUsersList(data.users || []);
    }
  };

  const fetchAuditLogs = async () => {
    const res = await fetch('/api/super-admin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAuditLogs(data.logs || []);
    }
  };

  const handleToggleVerify = async (clubId, currentVerified) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/super-admin/clubs/${clubId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ verified: !currentVerified })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchClubs();
        fetchAuditLogs();
        fetchAnalytics();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error updating verification status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleRecruitment = async (clubId, currentOpen) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/super-admin/clubs/${clubId}/recruitment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recruitment_open: !currentOpen })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchClubs();
        fetchAuditLogs();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error toggling recruitment.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!assignModalClub) return;

    if (assignMode === 'select' && !selectedUserId) {
      setMessage({ type: 'error', text: 'Please select a registered user.' });
      return;
    }
    if (assignMode === 'email' && !customEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setActionLoading(true);
    try {
      const payload = { clubId: assignModalClub.id };
      if (assignMode === 'select') {
        payload.userId = parseInt(selectedUserId);
      } else {
        payload.email = customEmail.trim();
        if (customName.trim()) {
          payload.name = customName.trim();
        }
      }

      if (customPassword.trim()) {
        payload.password = customPassword.trim();
      }

      const res = await fetch('/api/super-admin/assign-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setAssignModalClub(null);
        setSelectedUserId('');
        setCustomEmail('');
        setCustomName('');
        setCustomPassword('');
        setShowPassword(false);
        fetchClubs();
        fetchUsers();
        fetchAuditLogs();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error assigning club admin.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAdmin = async (userId, clubId) => {
    if (!window.confirm('Are you sure you want to revoke admin permissions for this club?')) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/super-admin/revoke-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, clubId })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchClubs();
        fetchUsers();
        fetchAuditLogs();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error revoking admin access.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnrevokeAdmin = async (e) => {
    e.preventDefault();
    if (!unrevokeModalUser || !unrevokeClubId) {
      setMessage({ type: 'error', text: 'Please select a club to assign.' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/super-admin/unrevoke-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: unrevokeModalUser.id,
          clubId: parseInt(unrevokeClubId),
          password: unrevokePassword.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setUnrevokeModalUser(null);
        setUnrevokeClubId('');
        setUnrevokePassword('');
        setShowUnrevokePassword(false);
        fetchClubs();
        fetchUsers();
        fetchAuditLogs();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error restoring admin permissions.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(clubSearch.toLowerCase()) ||
    (c.admin_name && c.admin_name.toLowerCase().includes(clubSearch.toLowerCase()))
  );

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = selectedRole ? u.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
        <div style={{ color: 'var(--color-gold)', fontSize: '0.95rem' }}>LOADING SUPER ADMIN PORTAL...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'var(--font-mono)', color: 'var(--text-cream)' }}>
      
      {/* Header Banner */}
      <div style={{ backgroundColor: '#0c141c', borderBottom: '1px solid var(--border-gold)', padding: '36px 0 28px 0', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-pixel coral">
                  <ShieldAlert size={14} /> SUPER ADMIN CONTROL CONSOLE
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BIT SINDRI CAMPUS PLATFORM</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--text-cream)', marginTop: '8px' }}>
                PLATFORM GOVERNANCE & MANAGEMENT
              </h1>
            </div>

            <button onClick={fetchAllData} className="btn-pixel-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
              <RefreshCw size={15} /> REFRESH DATA
            </button>
          </div>

          {/* Quick Metrics Bar */}
          {analytics && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px', 
              marginTop: '28px' 
            }}>
              <div className="card-panel" style={{ padding: '16px 20px', backgroundColor: '#070c10', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>VERIFIED CLUBS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gold)', marginTop: '4px', fontFamily: 'var(--font-pixel)' }}>
                  {analytics.clubs.verified_clubs} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 400 }}>/ {analytics.clubs.total_clubs}</span>
                </div>
              </div>

              <div className="card-panel" style={{ padding: '16px 20px', backgroundColor: '#070c10', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE RECRUITMENTS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-mint)', marginTop: '4px', fontFamily: 'var(--font-pixel)' }}>
                  {analytics.clubs.recruiting_clubs}
                </div>
              </div>

              <div className="card-panel" style={{ padding: '16px 20px', backgroundColor: '#070c10', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL PLATFORM USERS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-cyan)', marginTop: '4px', fontFamily: 'var(--font-pixel)' }}>
                  {analytics.users.total_users}
                </div>
              </div>

              <div className="card-panel" style={{ padding: '16px 20px', backgroundColor: '#070c10', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL APPLICATIONS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gold)', marginTop: '4px', fontFamily: 'var(--font-pixel)' }}>
                  {clubs.reduce((acc, c) => acc + (c.total_applications || 0), 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ marginTop: '32px' }}>
        
        {message.text && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: '6px', 
            marginBottom: '24px', 
            backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            color: message.type === 'success' ? '#047857' : '#991B1B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem'
          }}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Retro Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          backgroundColor: '#0c141c', 
          padding: '8px', 
          border: '1px solid var(--border-card)', 
          marginBottom: '28px', 
          overflowX: 'auto',
          width: 'fit-content',
          maxWidth: '100%'
        }}>
          <button 
            onClick={() => setActiveTab('clubs')}
            className={`filter-btn ${activeTab === 'clubs' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Building2 size={15} /> Club Directory & Verification ({clubs.length})
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`filter-btn ${activeTab === 'users' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={15} /> Users & Admin Roles
          </button>

          <button 
            onClick={() => setActiveTab('audit')}
            className={`filter-btn ${activeTab === 'audit' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Activity size={15} /> Audit Log Trail ({auditLogs.length})
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`filter-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={15} /> Platform Analytics
          </button>
        </div>

        {/* TAB 1: CLUBS MANAGEMENT */}
        {activeTab === 'clubs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Search club name or admin..." 
                  value={clubSearch} 
                  onChange={e => setClubSearch(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Showing {filteredClubs.length} of {clubs.length} BIT Sindri clubs
              </span>
            </div>

            <div className="card-panel" style={{ overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th>Club Name & Category</th>
                    <th>Assigned Admin</th>
                    <th>Verification</th>
                    <th>Recruitment</th>
                    <th>Apps / Events</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClubs.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{c.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>{c.category}</div>
                      </td>

                      <td>
                        {c.admin_name ? (
                          <div>
                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{c.admin_name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{c.admin_email}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#D97706', fontSize: '0.8rem', fontWeight: 600 }}>Unassigned</span>
                        )}
                      </td>

                      <td>
                        {c.verified === 1 ? (
                          <span className="badge" style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
                            <CheckCircle size={12} /> Verified
                          </span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
                            Unverified
                          </span>
                        )}
                      </td>

                      <td>
                        {c.recruitment_open === 1 ? (
                          <span className="badge badge-technical">Open</span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}>Closed</span>
                        )}
                      </td>

                      <td style={{ fontSize: '0.85rem' }}>
                        <strong>{c.total_applications || 0}</strong> apps / <strong>{c.total_events || 0}</strong> events
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button 
                            onClick={() => handleToggleVerify(c.id, c.verified)}
                            disabled={actionLoading}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          >
                            {c.verified ? 'Unverify' : 'Verify'}
                          </button>

                          <button 
                            onClick={() => handleToggleRecruitment(c.id, c.recruitment_open)}
                            disabled={actionLoading}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          >
                            {c.recruitment_open ? 'Close' : 'Open'}
                          </button>

                          <button 
                            onClick={() => setAssignModalClub(c)}
                            className="btn btn-primary"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          >
                            Assign Admin
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: USERS & ADMIN PRIVILEGES */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Search user name or email..." 
                  value={userSearch} 
                  onChange={e => setUserSearch(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              <select 
                className="input" 
                value={selectedRole} 
                onChange={e => setSelectedRole(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="club_admin">Club Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="card-panel" style={{ overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th>User Name & Email</th>
                    <th>Role</th>
                    <th>Assigned Club</th>
                    <th>Registered</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{u.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{u.email}</div>
                      </td>

                      <td>
                        <span className="badge" style={{ 
                          backgroundColor: u.role === 'super_admin' ? '#FEF2F2' : u.role === 'club_admin' ? '#FEF3C7' : '#EFF6FF',
                          color: u.role === 'super_admin' ? '#991B1B' : u.role === 'club_admin' ? '#92400E' : '#1D4ED8',
                          border: `1px solid ${u.role === 'super_admin' ? '#FECACA' : u.role === 'club_admin' ? '#FDE68A' : '#BFDBFE'}`
                        }}>
                          {u.role}
                        </span>
                      </td>

                      <td style={{ fontWeight: 600, color: '#0F172A' }}>
                        {u.club_name || '—'}
                      </td>

                      <td style={{ color: '#64748B', fontSize: '0.82rem' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {u.role === 'club_admin' && u.club_id ? (
                          <button 
                            onClick={() => handleRevokeAdmin(u.id, u.club_id)}
                            disabled={actionLoading}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#DC2626' }}
                            title="Revoke club administration rights"
                          >
                            <UserMinus size={13} /> Revoke Admin
                          </button>
                        ) : u.role !== 'super_admin' ? (
                          <button 
                            onClick={() => {
                              setUnrevokeModalUser(u);
                              setUnrevokeClubId('');
                              setUnrevokePassword('');
                              setShowUnrevokePassword(false);
                            }}
                            disabled={actionLoading}
                            className="btn btn-primary"
                            style={{ 
                              padding: '6px 14px', 
                              fontSize: '0.78rem', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px' 
                            }}
                            title="Restore or grant club admin privileges"
                          >
                            <UserCheck size={13} /> {u.role === 'club_admin' ? 'Restore Club Admin' : 'Unrevoke / Assign Admin'}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="card-panel" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor User</th>
                  <th>Action</th>
                  <th>Target Club</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} style={{ fontSize: '0.85rem' }}>
                    <td style={{ color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{log.actor_name || 'System'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{log.actor_email}</div>
                    </td>
                    <td>
                      <span className="badge badge-technical" style={{ fontFamily: 'monospace' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0F172A' }}>
                      {log.club_name || '—'}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748B' }}>
                      {log.metadata ? (typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === 'analytics' && analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="card-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>User Role Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span>Students</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{analytics.users.students}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span>Club Admins</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{analytics.users.club_admins}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span>Super Admins</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{analytics.users.super_admins}</span>
                </div>
              </div>
            </div>

            <div className="card-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>Applications by Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analytics.application_statuses.map(st => (
                  <div key={st.status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{st.status}</span>
                    <span style={{ fontWeight: 700, color: '#2563EB' }}>{st.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ASSIGN ADMIN MODAL (Apple & Google Style with Email Input Option) */}
      {assignModalClub && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}>
          <div className="glass-panel" style={{ maxWidth: '490px', width: '100%', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-technical" style={{ fontSize: '0.72rem' }}>
                <Sparkles size={12} /> Club Administration
              </span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Assign Admin: <span style={{ color: 'var(--color-primary)' }}>{assignModalClub.name}</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '22px' }}>
              Select a registered user from the platform or directly enter any email address to grant admin privileges.
            </p>

            {/* Apple Style Segmented Control */}
            <div style={{
              display: 'flex',
              background: 'rgba(241, 245, 249, 0.95)',
              padding: '4px',
              borderRadius: '999px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              marginBottom: '22px'
            }}>
              <button
                type="button"
                onClick={() => setAssignMode('select')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: assignMode === 'select' ? '#FFFFFF' : 'transparent',
                  color: assignMode === 'select' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: assignMode === 'select' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Users size={14} /> Registered Users
              </button>
              <button
                type="button"
                onClick={() => setAssignMode('email')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: assignMode === 'email' ? '#FFFFFF' : 'transparent',
                  color: assignMode === 'email' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: assignMode === 'email' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Mail size={14} /> Particular Email ID
              </button>
            </div>

            <form onSubmit={handleAssignAdmin}>
              {assignMode === 'select' ? (
                <div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Select Registered User</label>
                    <select 
                      className="input" 
                      value={selectedUserId} 
                      onChange={e => setSelectedUserId(e.target.value)} 
                      required
                      style={{ fontSize: '0.88rem' }}
                    >
                      <option value="">-- Choose User ({usersList.length} registered) --</option>
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.email} ({u.role})
                        </option>
                      ))}
                    </select>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '6px' }}>
                      User's role will automatically be upgraded to Club Admin if currently a student.
                    </p>
                  </div>

                  <div className="form-group" style={{ marginTop: '14px' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Reset User Password <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Key size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input"
                        placeholder="Leave blank to keep existing password"
                        value={customPassword}
                        onChange={e => setCustomPassword(e.target.value)}
                        style={{ paddingLeft: '40px', paddingRight: '42px', fontSize: '0.88rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-light)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Admin Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        className="input"
                        placeholder="e.g. club.president@bitsindri.ac.in"
                        value={customEmail}
                        onChange={e => setCustomEmail(e.target.value)}
                        required
                        autoFocus
                        style={{ paddingLeft: '40px', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '14px' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Admin Full Name <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(Optional)</span></label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Rahul Sharma (auto-generated if empty)"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      style={{ fontSize: '0.88rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '14px' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Set Password <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Key size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input"
                        placeholder="Leave blank for default: password123"
                        value={customPassword}
                        onChange={e => setCustomPassword(e.target.value)}
                        style={{ paddingLeft: '40px', paddingRight: '42px', fontSize: '0.88rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-light)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ 
                    backgroundColor: 'rgba(239, 246, 255, 0.7)', 
                    border: '1px solid rgba(191, 219, 254, 0.7)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '10px 14px', 
                    marginTop: '14px', 
                    fontSize: '0.78rem', 
                    color: '#1E40AF', 
                    lineHeight: 1.5 
                  }}>
                    ✨ <strong>Seamless Access:</strong> If the email matches an existing account, admin access is linked immediately. If new, an account is created with the password specified above (or default <code>password123</code>).
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setAssignModalClub(null);
                    setSelectedUserId('');
                    setCustomEmail('');
                    setCustomName('');
                    setCustomPassword('');
                    setShowPassword(false);
                  }} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading || (assignMode === 'select' ? !selectedUserId : !customEmail.trim())} 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <UserCheck size={15} />
                  {actionLoading ? 'Assigning...' : 'Confirm Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNREVOKE / RESTORE ADMIN MODAL */}
      {unrevokeModalUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}>
          <div className="glass-panel" style={{ maxWidth: '490px', width: '100%', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge" style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontSize: '0.72rem' }}>
                <UserCheck size={12} /> Privilege Management
              </span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Unrevoke & Assign Admin: <span style={{ color: 'var(--color-primary)' }}>{unrevokeModalUser.name}</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '22px' }}>
              Restore or grant club administration privileges to <strong>{unrevokeModalUser.email}</strong>.
            </p>

            <form onSubmit={handleUnrevokeAdmin}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Select Club to Assign</label>
                <select 
                  className="input" 
                  value={unrevokeClubId} 
                  onChange={e => setUnrevokeClubId(e.target.value)} 
                  required
                  style={{ fontSize: '0.88rem' }}
                >
                  <option value="">-- Choose Club ({clubs.length} available) --</option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.category} {c.admin_name ? `(Current Admin: ${c.admin_name})` : '(Unassigned)'}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '6px' }}>
                  Assigning this club will automatically upgrade the user to Club Admin and link their workspace.
                </p>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Reset Password <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showUnrevokePassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Leave blank to keep current password"
                    value={unrevokePassword}
                    onChange={e => setUnrevokePassword(e.target.value)}
                    style={{ paddingLeft: '40px', paddingRight: '42px', fontSize: '0.88rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowUnrevokePassword(!showUnrevokePassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-light)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                    title={showUnrevokePassword ? 'Hide password' : 'Show password'}
                  >
                    {showUnrevokePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setUnrevokeModalUser(null);
                    setUnrevokeClubId('');
                    setUnrevokePassword('');
                    setShowUnrevokePassword(false);
                  }} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading || !unrevokeClubId} 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <UserCheck size={15} />
                  {actionLoading ? 'Restoring...' : 'Unrevoke & Restore Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
