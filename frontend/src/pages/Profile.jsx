import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, BookOpen, ShieldCheck,
  Linkedin, Github, Globe, KeyRound, CheckCircle2, AlertCircle,
  Save, Eye, EyeOff, Building2, Award, FileText, ArrowRight
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';

export const Profile = () => {
  const { user, token, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [memberships, setMemberships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignedClub, setAssignedClub] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    department: 'Computer Science & Engineering',
    roll_number: '',
    batch_year: '2023-2027',
    bio: '',
    linkedin_url: '',
    github_url: ''
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          avatar_url: data.user.avatar_url || '',
          department: data.user.department || '',
          roll_number: data.user.roll_number || '',
          batch_year: data.user.batch_year || '',
          bio: data.user.bio || '',
          linkedin_url: data.user.linkedin_url || '',
          github_url: data.user.github_url || ''
        });
        setMemberships(data.club_memberships || []);
        setApplications(data.applications || []);
        setAssignedClub(data.assigned_club || null);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setMsg('Profile details saved successfully!');
        if (updateUser && data.user) {
          updateUser(data.user);
        }
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      const data = await res.json();

      if (res.ok) {
        setMsg('Account password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setError('Network error while changing password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const getAvatarSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  const getStatusBadgeStyle = (st) => {
    switch (st) {
      case 'Submitted': return { bg: 'rgba(56, 189, 248, 0.15)', text: 'var(--color-cyan)', border: 'rgba(56, 189, 248, 0.4)' };
      case 'Under Review': return { bg: 'rgba(243, 208, 99, 0.15)', text: 'var(--color-gold)', border: 'rgba(243, 208, 99, 0.4)' };
      case 'Shortlisted': return { bg: 'rgba(192, 132, 252, 0.15)', text: 'var(--color-purple)', border: 'rgba(192, 132, 252, 0.4)' };
      case 'Selected': return { bg: 'rgba(74, 222, 128, 0.15)', text: 'var(--color-mint)', border: 'rgba(74, 222, 128, 0.4)' };
      case 'Rejected': return { bg: 'rgba(240, 113, 103, 0.15)', text: 'var(--color-coral)', border: 'rgba(240, 113, 103, 0.4)' };
      default: return { bg: 'rgba(142, 163, 180, 0.12)', text: 'var(--text-muted)', border: 'var(--border-card)' };
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>LOADING PROFILE...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Personal', icon: User },
    { id: 'social', label: 'Social Links', icon: Globe },
    { id: 'security', label: 'Security', icon: KeyRound },
    { id: 'memberships', label: `Memberships (${memberships.length})`, icon: Award },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* Profile Hero Banner */}
      <div style={{
        backgroundColor: 'var(--bg-dark)',
        borderBottom: '1px solid var(--border-gold-dim)',
        padding: '44px 0 32px 0'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {formData.avatar_url ? (
                <img
                  src={getAvatarSrc(formData.avatar_url)}
                  alt={formData.name}
                  style={{
                    width: '74px',
                    height: '74px',
                    objectFit: 'cover',
                    border: '2px solid var(--border-gold)',
                    boxShadow: '0 0 16px rgba(243, 208, 99, 0.25)'
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{
                  width: '74px',
                  height: '74px',
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-gold)',
                  color: 'var(--color-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-pixel)',
                  fontWeight: 800,
                  fontSize: '2rem',
                  boxShadow: '0 0 16px rgba(243, 208, 99, 0.2)'
                }}>
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '1.9rem',
                    color: 'var(--text-cream)',
                    letterSpacing: '0.04em'
                  }}>
                    {formData.name || 'My Profile'}
                  </h1>
                  <span className="badge-pixel gold" style={{ fontSize: '0.72rem' }}>
                    Club Admin
                  </span>
                  {assignedClub && (
                    <span className="badge-pixel tech" style={{ fontSize: '0.72rem' }}>
                      {assignedClub.name}
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '8px',
                  flexWrap: 'wrap',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)'
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={13} /> {formData.email}
                  </span>
                  {formData.phone && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={13} /> {formData.phone}
                    </span>
                  )}
                  {formData.department && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <BookOpen size={13} /> {formData.department}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {user.role === 'club_admin' && (
                <Link to="/admin/dashboard" className="btn-pixel-outline" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                  <Building2 size={14} /> Club Workspace
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '32px' }}>

        {/* Alerts */}
        {msg && (
          <div style={{
            backgroundColor: 'var(--color-mint-dim)',
            color: 'var(--color-mint)',
            border: '1px solid rgba(74, 222, 128, 0.4)',
            padding: '12px 18px',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> {msg}
            </div>
            <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-mint)', fontWeight: 700 }}>✕</button>
          </div>
        )}
        {error && (
          <div style={{
            backgroundColor: 'var(--color-coral-dim)',
            color: 'var(--color-coral)',
            border: '1px solid rgba(240, 113, 103, 0.4)',
            padding: '12px 18px',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {error}
            </div>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-coral)', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* Tab Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '32px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px'
        }}>
          {tabs.map(tab => {
            const IconComp = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`filter-btn ${isSel ? 'active' : ''}`}
              >
                <IconComp size={13} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PERSONAL & ACADEMIC */}
        {activeTab === 'details' && (
          <div className="pixel-panel pixel-corner-mark" style={{ padding: '32px', maxWidth: '780px' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--text-cream)', marginBottom: '6px' }}>
              Personal & Academic Profile
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Update your student identification details, department, roll number, and avatar.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <ImageUploader
                value={formData.avatar_url}
                onChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
                label="Profile Picture / Avatar"
                helperText="Upload candidate portrait or profile photo (PNG, JPG, WebP)"
                aspectRatio="square"
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="pixel-input"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Institutional)</label>
                  <input
                    type="email"
                    className="pixel-input"
                    value={formData.email}
                    disabled
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-mint)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                    <ShieldCheck size={12} /> Verified Institutional Identity
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="pixel-input"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">College Roll Number</label>
                  <input
                    type="text"
                    className="pixel-input"
                    placeholder="e.g. 2301042"
                    value={formData.roll_number}
                    onChange={e => setFormData(prev => ({ ...prev, roll_number: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Batch / Year</label>
                  <input
                    type="text"
                    className="pixel-input"
                    placeholder="e.g. 2023-2027"
                    value={formData.batch_year}
                    onChange={e => setFormData(prev => ({ ...prev, batch_year: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <select
                  className="pixel-input"
                  value={formData.department}
                  onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Mining Engineering">Mining Engineering</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Metallurgical Engineering">Metallurgical Engineering</option>
                  <option value="Production & Industrial Engineering">Production & Industrial Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bio / About Me</label>
                <textarea
                  className="pixel-input"
                  rows={3}
                  placeholder="Tell campus clubs about your interests, technical domains, and aspirations..."
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-pixel-gold"
                style={{ width: 'fit-content', padding: '10px 22px', marginTop: '6px' }}
              >
                <Save size={15} /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>

            </form>
          </div>
        )}

        {/* TAB 2: SOCIAL & LINKS */}
        {activeTab === 'social' && (
          <div className="pixel-panel pixel-corner-mark" style={{ padding: '32px', maxWidth: '780px' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--text-cream)', marginBottom: '6px' }}>
              Social & Portfolio Profiles
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Share your professional links to showcase your work to club leaders and coordinators.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Linkedin size={14} color="var(--color-cyan)" /> LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  className="pixel-input"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin_url}
                  onChange={e => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Github size={14} color="var(--text-cream)" /> GitHub Profile URL
                </label>
                <input
                  type="url"
                  className="pixel-input"
                  placeholder="https://github.com/username"
                  value={formData.github_url}
                  onChange={e => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-pixel-gold"
                style={{ width: 'fit-content', padding: '10px 22px', marginTop: '6px' }}
              >
                <Save size={15} /> {saving ? 'Saving Links...' : 'Save Social Profiles'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SECURITY */}
        {activeTab === 'security' && (
          <div className="pixel-panel pixel-corner-mark" style={{ padding: '32px', maxWidth: '640px' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--text-cream)', marginBottom: '6px' }}>
              Change Password
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Ensure your account is protected with a strong password (minimum 6 characters).
            </p>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    className="pixel-input"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    className="pixel-input"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  className="pixel-input"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="btn-pixel-gold"
                style={{ width: 'fit-content', padding: '10px 22px', marginTop: '8px' }}
              >
                <KeyRound size={15} /> {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: MEMBERSHIPS */}
        {activeTab === 'memberships' && (
          <div>
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--text-cream)' }}>
                Club Memberships & Executive Roles
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Clubs and societies where you are officially registered in the club roster.
              </p>
            </div>

            {memberships.length === 0 ? (
              <div className="pixel-panel pixel-corner-mark" style={{ padding: '56px 24px', textAlign: 'center' }}>
                <Award size={40} color="var(--text-dim)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.05rem', color: 'var(--text-cream)', marginBottom: '6px' }}>
                  No Official Club Memberships Yet
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 22px auto' }}>
                  Apply for open club inductions to get selected and registered on official club rosters.
                </p>
                <Link to="/clubs" className="btn-pixel-gold" style={{ padding: '9px 20px', fontSize: '0.88rem' }}>
                  Explore Campus Clubs
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {memberships.map((m) => (
                  <div key={m.id} className="pixel-card" style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      {m.club_logo ? (
                        <img
                          src={getAvatarSrc(m.club_logo)}
                          alt={m.club_name}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', border: '1px solid var(--border-card)' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-card)',
                          color: 'var(--color-gold)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-pixel)',
                          fontWeight: 800
                        }}>
                          {m.club_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', color: 'var(--text-cream)', marginBottom: '4px' }}>{m.club_name}</h4>
                        <span className="badge-pixel tech" style={{ fontSize: '0.68rem' }}>{m.club_category}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <div><strong style={{ color: 'var(--text-cream)' }}>Role:</strong> <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{m.position}</span></div>
                      <div><strong style={{ color: 'var(--text-cream)' }}>Status:</strong> <span style={{ color: 'var(--color-mint)', fontWeight: 600 }}>{m.status}</span></div>
                      {m.joined_date && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                          Member since {new Date(m.joined_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      <Link to={`/clubs/${m.club_slug}`} className="btn-pixel-outline" style={{ width: '100%', padding: '7px', justifyContent: 'center', fontSize: '0.8rem' }}>
                        View Club Profile <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: APPLICATIONS (students only) */}
        {activeTab === 'applications' && user.role === 'student' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--text-cream)' }}>
                  Submitted Induction Applications
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Track screening status of your submitted applications across campus clubs.
                </p>
              </div>
              <Link to="/my-applications" className="btn-pixel-outline" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                Full Applications Hub <ArrowRight size={13} />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="pixel-panel pixel-corner-mark" style={{ padding: '56px 24px', textAlign: 'center' }}>
                <FileText size={40} color="var(--text-dim)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.05rem', color: 'var(--text-cream)', marginBottom: '6px' }}>
                  No Induction Applications Yet
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 22px auto' }}>
                  Browse active clubs with open recruitment drives and apply today.
                </p>
                <Link to="/clubs" className="btn-pixel-gold" style={{ padding: '9px 20px', fontSize: '0.88rem' }}>
                  Browse Open Clubs
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
                {applications.map((app) => {
                  const stStyle = getStatusBadgeStyle(app.status);
                  return (
                    <div key={app.id} className="pixel-card" style={{ padding: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', color: 'var(--text-cream)' }}>{app.club_name}</h4>
                        <span className="badge-pixel" style={{
                          backgroundColor: stStyle.bg,
                          color: stStyle.text,
                          border: `1px solid ${stStyle.border}`
                        }}>
                          {app.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Submitted on {new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>

                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                        <Link to={`/clubs/${app.club_slug}`} className="btn-pixel-outline" style={{ width: '100%', padding: '7px', justifyContent: 'center', fontSize: '0.8rem' }}>
                          View Club Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
