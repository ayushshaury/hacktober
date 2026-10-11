import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, BookOpen, Calendar, ShieldCheck, 
  Linkedin, Github, Globe, KeyRound, CheckCircle2, AlertCircle, 
  Save, Eye, EyeOff, Building2, Award, FileText, ArrowRight, Sparkles
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';

export const Profile = () => {
  const { user, token, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('details'); // 'details', 'social', 'security', 'memberships', 'applications'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Extended profile data
  const [memberships, setMemberships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignedClub, setAssignedClub] = useState(null);

  // Profile Form State
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

  // Password Form State
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
      case 'Submitted': return { bg: '#EBF5FF', text: '#0066CC', border: '#BAE0FD' };
      case 'Under Review': return { bg: '#FEF7E0', text: '#B08800', border: '#FCE8B2' };
      case 'Shortlisted': return { bg: '#E6F4EA', text: '#137333', border: '#CEEAD6' };
      case 'Selected': return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' };
      case 'Rejected': return { bg: '#FCE8E6', text: '#C5221F', border: '#FAD2CF' };
      default: return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading My Profile...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }} className="animate-fade-in">
      
      {/* Profile Hero Header Banner */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid rgba(0,0,0,0.06)', 
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
                    borderRadius: '22px',
                    objectFit: 'cover',
                    boxShadow: '0 8px 24px rgba(0, 113, 227, 0.15)',
                    border: '2px solid #FFFFFF'
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '22px',
                  background: 'linear-gradient(135deg, #0071E3 0%, #00C7BE 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '2rem',
                  boxShadow: '0 8px 24px rgba(0, 113, 227, 0.25)'
                }}>
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                    {formData.name || 'My Profile'}
                  </h1>
                  <span className="badge" style={{ 
                    fontSize: '0.74rem', 
                    padding: '3px 10px',
                    backgroundColor: '#FEF7E0',
                    color: '#B08800',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    Club Administrator
                  </span>
                  {assignedClub && (
                    <span className="badge badge-technical" style={{ fontSize: '0.74rem' }}>
                      {assignedClub.name}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', flexWrap: 'wrap', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
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

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {user.role === 'club_admin' && (
                <Link to="/admin/dashboard" className="btn btn-secondary" style={{ padding: '9px 18px', fontSize: '0.84rem' }}>
                  <Building2 size={15} /> Club Workspace
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '32px' }}>
        
        {/* Alerts & Notifications */}
        {msg && (
          <div style={{ backgroundColor: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6', padding: '12px 18px', borderRadius: '12px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> {msg}
            </div>
            <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#137333', fontWeight: 700 }}>✕</button>
          </div>
        )}
        {error && (
          <div style={{ backgroundColor: '#FCE8E6', color: '#C5221F', border: '1px solid #FAD2CF', padding: '12px 18px', borderRadius: '12px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {error}
            </div>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C5221F', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* Apple Style Floating Pill Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          background: 'rgba(245, 245, 247, 0.7)', 
          padding: '5px', 
          borderRadius: '999px', 
          border: '1px solid rgba(0,0,0,0.05)', 
          marginBottom: '32px', 
          overflowX: 'auto',
          width: 'fit-content',
          maxWidth: '100%'
        }}>
          {[
            { id: 'details', label: 'Personal & Academic', icon: User },
            { id: 'social', label: 'Social & Links', icon: Globe },
            { id: 'security', label: 'Security & Password', icon: KeyRound },
            { id: 'memberships', label: `My Club Roles (${memberships.length})`, icon: Award },
          ].map(tab => {
            const IconComp = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: isSel ? '#0071E3' : 'transparent',
                  color: isSel ? '#FFFFFF' : 'var(--text-muted)',
                  boxShadow: isSel ? '0 2px 8px rgba(0, 113, 227, 0.25)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <IconComp size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PERSONAL & ACADEMIC DETAILS */}
        {activeTab === 'details' && (
          <div className="glass-panel" style={{ padding: '36px', maxWidth: '780px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              Personal & Academic Profile
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '26px' }}>
              Update your student identification details, department, roll number, and avatar.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Profile Photo Uploader */}
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
                    className="input"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Institutional)</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.email}
                    disabled
                    style={{ backgroundColor: '#F8FAFC', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#137333', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} /> Verified Institutional Identity
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">College Roll Number</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 2301042"
                    value={formData.roll_number}
                    onChange={e => setFormData(prev => ({ ...prev, roll_number: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Batch / Year</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 2023-2027"
                    value={formData.batch_year}
                    onChange={e => setFormData(prev => ({ ...prev, batch_year: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <select
                  className="input"
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
                  className="input"
                  rows={3}
                  placeholder="Tell campus clubs about your interests, technical domains, and aspirations..."
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ width: 'fit-content', padding: '12px 28px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={16} /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>

            </form>
          </div>
        )}

        {/* TAB 2: SOCIAL & LINKS */}
        {activeTab === 'social' && (
          <div className="glass-panel" style={{ padding: '36px', maxWidth: '780px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              Social & Portfolio Profiles
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '26px' }}>
              Share your professional links to showcase your work to club leaders and coordinators.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Linkedin size={15} color="#0071E3" /> LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin_url}
                  onChange={e => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Github size={15} color="#0F172A" /> GitHub Profile URL
                </label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://github.com/username"
                  value={formData.github_url}
                  onChange={e => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ width: 'fit-content', padding: '12px 28px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={16} /> {saving ? 'Saving Links...' : 'Save Social Profiles'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ACCOUNT SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="glass-panel" style={{ padding: '36px', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              Change Password
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '26px' }}>
              Ensure your account is protected with a strong password (minimum 6 characters).
            </p>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    className="input"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
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
                    className="input"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
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
                  className="input"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="btn btn-primary"
                style={{ width: 'fit-content', padding: '12px 28px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <KeyRound size={16} /> {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: MY CLUB MEMBERSHIPS */}
        {activeTab === 'memberships' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Club Memberships & Executive Roles
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Clubs and societies where you are officially registered in the club roster.
              </p>
            </div>

            {memberships.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
                <Award size={42} color="var(--text-light)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>No Official Club Memberships Yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', marginBottom: '24px', maxWidth: '480px', margin: '6px auto 24px auto' }}>
                  Apply for open club inductions to get selected and registered on official club rosters.
                </p>
                <Link to="/clubs" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  Explore Campus Clubs
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {memberships.map((m) => (
                  <div key={m.id} className="glass-panel apple-box-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                        {m.club_logo ? (
                          <img
                            src={getAvatarSrc(m.club_logo)}
                            alt={m.club_name}
                            style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EBF5FF', color: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                            {m.club_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{m.club_name}</h4>
                          <span className="badge badge-technical" style={{ fontSize: '0.72rem', marginTop: '2px' }}>{m.club_category}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                        <div><strong>Role:</strong> <span style={{ color: '#0066CC', fontWeight: 700 }}>{m.position}</span></div>
                        <div><strong>Status:</strong> <span style={{ color: '#137333', fontWeight: 600 }}>{m.status}</span></div>
                        {m.joined_date && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            Member since {new Date(m.joined_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
                      <Link to={`/clubs/${m.club_slug}`} className="btn btn-secondary" style={{ width: '100%', padding: '8px', textAlign: 'center', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        View Club Profile <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MY INDUCTION APPLICATIONS */}
        {activeTab === 'applications' && user.role === 'student' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Submitted Induction Applications
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Track screening status of your submitted applications across campus clubs.
                </p>
              </div>
              <Link to="/my-applications" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                Full Applications Hub <ArrowRight size={14} />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
                <FileText size={42} color="var(--text-light)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>No Induction Applications Yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', marginBottom: '24px', maxWidth: '480px', margin: '6px auto 24px auto' }}>
                  Browse active clubs with open recruitment drives and apply today.
                </p>
                <Link to="/clubs" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  Browse Open Clubs
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
                {applications.map((app) => {
                  const stStyle = getStatusBadgeStyle(app.status);
                  return (
                    <div key={app.id} className="glass-panel apple-box-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{app.club_name}</h4>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: stStyle.bg,
                            color: stStyle.text,
                            border: `1px solid ${stStyle.border}`
                          }}>
                            {app.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Submitted on {new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
                        <Link to={`/clubs/${app.club_slug}`} className="btn btn-secondary" style={{ width: '100%', padding: '8px', textAlign: 'center', fontSize: '0.82rem' }}>
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
