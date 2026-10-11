import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Edit3, Calendar, Link as LinkIcon, Megaphone, 
  Plus, Trash2, CheckCircle2, ShieldCheck, Eye, Users, ToggleLeft, 
  ToggleRight, AlertCircle, FileSpreadsheet, UserCheck, Search, 
  Filter, ChevronDown, ChevronUp, EyeOff, Globe, Phone, Mail, 
  UserPlus, Pencil, Award, ExternalLink, Sparkles
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { HnccCandidateRanking } from '../components/HnccCandidateRanking';

export const AdminDashboard = () => {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'members', 'applicants', 'profile', 'form-builder', 'events', 'social', 'announcements'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Members tab state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('All');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Core Member',
    department: 'Computer Science & Engineering',
    batch_year: '2023-2027',
    joined_date: new Date().toISOString().split('T')[0],
    avatar_url: '',
    status: 'Active',
    bio: '',
    linkedin_url: '',
    github_url: ''
  });

  // Applicants tab state
  const [applicants, setApplicants] = useState([]);
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState('All');
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Form states for edit profile
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [recruitmentOpen, setRecruitmentOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for Form Builder
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('short_text');
  const [newRequired, setNewRequired] = useState(true);
  const [newOptionsStr, setNewOptionsStr] = useState('');

  // Form states for new social link
  const [newPlatform, setNewPlatform] = useState('LinkedIn');
  const [newUrl, setNewUrl] = useState('');

  // Form states for new announcement
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPinned, setAnnPinned] = useState(false);

  // Form states for new event
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventVenue, setEventVenue] = useState('BIT Sindri Campus');
  const [eventRegUrl, setEventRegUrl] = useState('');
  const [eventImageUrl, setEventImageUrl] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/my-club', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();

      if (!res.ok) throw new Error(resData.error || 'Failed to load admin workspace');

      setData(resData.club);
      setShortDesc(resData.club.short_description || '');
      setDesc(resData.club.description || '');
      setWebsiteUrl(resData.club.website_url || '');
      setRecruitmentOpen(resData.club.recruitment_open === 1);
      setLogoUrl(resData.club.logo_url || '');

      // Fetch Form Builder questions
      const formRes = await fetch('/api/induction/admin/form', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formData = await formRes.json();
      if (formData.questions) setQuestions(formData.questions);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const params = new URLSearchParams();
      if (applicantStatusFilter !== 'All') params.append('status', applicantStatusFilter);
      if (applicantSearch.trim()) params.append('search', applicantSearch.trim());

      const res = await fetch(`/api/admin/applicants?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) setApplicants(resData.applicants || []);
    } catch (err) {
      console.error('Error loading applicants:', err);
    }
  };

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const params = new URLSearchParams();
      if (memberStatusFilter !== 'All') params.append('status', memberStatusFilter);
      if (memberSearch.trim()) params.append('search', memberSearch.trim());

      const res = await fetch(`/api/admin/members?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) setMembers(resData.members || []);
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
      fetchMembers();
    }
  }, [token]);

  useEffect(() => {
    if (token && activeTab === 'applicants') {
      fetchApplicants();
    }
  }, [token, activeTab, applicantStatusFilter, applicantSearch]);

  useEffect(() => {
    if (token && activeTab === 'members') {
      fetchMembers();
    }
  }, [token, activeTab, memberStatusFilter, memberSearch]);

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberForm({
      name: '',
      email: '',
      phone: '',
      position: 'Core Member',
      department: 'Computer Science & Engineering',
      batch_year: '2023-2027',
      joined_date: new Date().toISOString().split('T')[0],
      avatar_url: '',
      status: 'Active',
      bio: '',
      linkedin_url: '',
      github_url: ''
    });
    setShowMemberModal(true);
  };

  const handleOpenEditMember = (m) => {
    setEditingMember(m);
    setMemberForm({
      name: m.name || '',
      email: m.email || '',
      phone: m.phone || '',
      position: m.position || 'Core Member',
      department: m.department || '',
      batch_year: m.batch_year || '',
      joined_date: m.joined_date ? m.joined_date.split('T')[0] : '',
      avatar_url: m.avatar_url || '',
      status: m.status || 'Active',
      bio: m.bio || '',
      linkedin_url: m.linkedin_url || '',
      github_url: m.github_url || ''
    });
    setShowMemberModal(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMsg('');
    setError('');
    try {
      const url = editingMember 
        ? `/api/admin/members/${editingMember.id}`
        : '/api/admin/members';
      const method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(memberForm)
      });
      const resData = await res.json();
      if (res.ok) {
        setMsg(editingMember ? 'Member details updated successfully!' : 'New member added to roster successfully!');
        setShowMemberModal(false);
        fetchMembers();
        fetchAdminData();
      } else {
        setError(resData.error || 'Failed to save member');
      }
    } catch (err) {
      setError('Network error saving member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the club members roster?`)) return;
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        setMsg(`Member "${memberName}" removed successfully.`);
        fetchMembers();
        fetchAdminData();
      } else {
        setError(resData.error || 'Failed to remove member');
      }
    } catch (err) {
      setError('Network error deleting member');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch('/api/admin/my-club', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          short_description: shortDesc,
          description: desc,
          website_url: websiteUrl,
          recruitment_open: recruitmentOpen,
          logo_url: logoUrl
        })
      });
      const resData = await res.json();
      if (res.ok) {
        setMsg('Club profile & picture updated successfully!');
        fetchAdminData();
      } else {
        setError(resData.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error updating profile');
    }
  };

  const handleToggleInductionStatus = async () => {
    setActionLoading(true);
    setMsg('');
    setError('');
    try {
      const res = await fetch('/api/admin/induction/toggle-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ open: !recruitmentOpen })
      });
      const resData = await res.json();
      if (res.ok) {
        setRecruitmentOpen(resData.recruitment_open === 1);
        setMsg(resData.message);
        fetchAdminData();
      } else {
        setError(resData.error || 'Failed to toggle induction status');
      }
    } catch (err) {
      setError('Network error toggling induction form');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    try {
      const optionsList = newOptionsStr.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/induction/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: newQuestionText.trim(),
          question_type: newQuestionType,
          required: newRequired,
          options: optionsList
        })
      });
      if (res.ok) {
        setNewQuestionText('');
        setNewOptionsStr('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    try {
      const res = await fetch(`/api/induction/admin/questions/${qId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/applicants/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchApplicants();
        if (selectedApplicant && selectedApplicant.id === appId) {
          setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAddSocialLink = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ platform: newPlatform, url: newUrl })
      });
      if (res.ok) {
        setNewUrl('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error adding link:', err);
    }
  };

  const handleDeleteSocialLink = async (id) => {
    try {
      const res = await fetch(`/api/admin/social-links/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error('Error deleting link:', err);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: annTitle, content: annContent, is_pinned: annPinned })
      });
      if (res.ok) {
        setAnnTitle('');
        setAnnContent('');
        setAnnPinned(false);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          club_id: data.id,
          title: eventTitle,
          description: eventDesc,
          event_date: eventDate,
          venue: eventVenue,
          registration_url: eventRegUrl,
          image_url: eventImageUrl
        })
      });
      if (res.ok) {
        setEventTitle('');
        setEventDesc('');
        setEventDate('');
        setEventVenue('BIT Sindri Campus');
        setEventRegUrl('');
        setEventImageUrl('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading Admin Workspace...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <AlertCircle size={44} color="#DC2626" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', fontWeight: 800 }}>Access Error</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{error || 'No club assigned to this admin user.'}</p>
      </div>
    );
  }

  const getStatusBadgeStyle = (st) => {
    switch (st) {
      case 'Submitted': return { bg: '#EBF5FF', text: '#0066CC', border: '#BAE0FD' };
      case 'Under Review': return { bg: '#FEF7E0', text: '#B08800', border: '#FCE8B2' };
      case 'Shortlisted': return { bg: '#E6F4EA', text: '#137333', border: '#CEEAD6' };
      case 'Selected': return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' };
      case 'Rejected': return { bg: '#FCE8E6', text: '#C5221F', border: '#FAD2CF' };
      case 'Waitlisted': return { bg: '#F5EEFD', text: '#7928CA', border: '#E4D2F9' };
      default: return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  const getAvatarSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  const getPositionBadgeStyle = (pos) => {
    const p = (pos || '').toLowerCase();
    if (p.includes('president') || p.includes('lead') || p.includes('head') || p.includes('secretary')) {
      return { bg: '#EBF5FF', text: '#0066CC', border: '#BAE0FD' };
    }
    if (p.includes('coordinator') || p.includes('manager') || p.includes('vice')) {
      return { bg: '#F5EEFD', text: '#7928CA', border: '#E4D2F9' };
    }
    return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
  };

  const getMemberStatusStyle = (st) => {
    switch (st) {
      case 'Active': return { bg: '#E6F4EA', text: '#137333', border: '#CEEAD6' };
      case 'Alumni': return { bg: '#EBF5FF', text: '#0066CC', border: '#BAE0FD' };
      case 'Inactive': return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
      default: return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'var(--font-mono)' }} className="animate-fade-in">
      
      {/* Header Banner - Dark Retro Arcade Pixel Aesthetic */}
      <div style={{ 
        backgroundColor: '#0c141c', 
        borderBottom: '1px solid var(--border-gold)', 
        padding: '36px 0 28px 0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {data.logo_url ? (
                <img 
                  src={data.logo_url.startsWith('/uploads') ? `http://localhost:5000${data.logo_url}` : data.logo_url}
                  alt={data.name}
                  style={{ width: '56px', height: '56px', border: '2px solid var(--border-gold)', borderRadius: 0, objectFit: 'cover', backgroundColor: '#070c10', boxShadow: '2px 2px 0px #8a7329' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge-pixel tech" style={{ gap: '6px' }}>
                    <ShieldCheck size={14} /> OFFICIAL CLUB WORKSPACE
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontFamily: 'var(--font-mono)' }}>CODE: {data.club_code}</span>
                </div>
                <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--text-cream)', marginTop: '8px', letterSpacing: '0.04em' }}>
                  {data.name}
                </h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span className={`badge-pixel ${recruitmentOpen ? 'others' : 'coral'}`} style={{ 
                padding: '8px 16px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: recruitmentOpen ? 'var(--color-mint)' : 'var(--color-coral)',
                  display: 'inline-block',
                  boxShadow: recruitmentOpen ? '0 0 6px var(--color-mint)' : '0 0 6px var(--color-coral)'
                }} />
                INDUCTION FORM: {recruitmentOpen ? 'OPEN' : 'CLOSED'}
              </span>

              <button
                type="button"
                onClick={handleToggleInductionStatus}
                disabled={actionLoading}
                className={recruitmentOpen ? 'btn-pixel-outline' : 'btn-pixel-gold'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  fontSize: '0.84rem'
                }}
              >
                {recruitmentOpen ? <ToggleRight size={18} color="var(--color-mint)" /> : <ToggleLeft size={18} />}
                {recruitmentOpen ? 'Close Induction Form' : 'Open Induction Form'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '32px' }}>
        
        {/* Feedback / Alert Banners */}
        {msg && (
          <div style={{ backgroundColor: 'rgba(74, 222, 128, 0.15)', color: 'var(--color-mint)', border: '1px solid var(--color-mint)', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> {msg}
            </div>
            <button type="button" onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-mint)', fontWeight: 700 }}>✕</button>
          </div>
        )}
        {error && (
          <div style={{ backgroundColor: 'rgba(240, 113, 103, 0.15)', color: 'var(--color-coral)', border: '1px solid var(--color-coral)', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {error}
            </div>
            <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-coral)', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* Retro Tab Navigation Bar */}
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
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'members', label: `Members (${data.stats?.members ?? members.length ?? 0})`, icon: Users },
            { id: 'applicants', label: `Applicants (${data.stats?.applications || 0})`, icon: UserCheck },
            ...(data.slug === 'hncc' || data.id === 1 ? [{ id: 'ai-ranking', label: '★ AI Candidate Ranking (HnCC)', icon: Sparkles }] : []),
            { id: 'profile', label: 'Club Profile & Picture', icon: Edit3 },
            { id: 'form-builder', label: 'Induction Form Builder', icon: FileSpreadsheet },
            { id: 'events', label: `Events (${data.events?.length || 0})`, icon: Calendar },
            { id: 'social', label: 'Social Links', icon: LinkIcon },
            { id: 'announcements', label: 'Announcements', icon: Megaphone }
          ].map(tab => {
            const IconComponent = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`filter-btn ${isSel ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <IconComponent size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '22px', marginBottom: '32px' }}>
              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.04em' }}>TOTAL PROFILE VIEWS</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                  {data.stats?.views || 0}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.04em' }}>TOTAL APPLICANTS</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-secondary)', marginTop: '6px' }}>
                  {data.stats?.applications || 0}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.04em' }}>TOTAL CLUB MEMBERS</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#7928CA', marginTop: '6px' }}>
                  {data.stats?.members ?? members.length ?? 0}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.04em' }}>PUBLISHED EVENTS</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#137333', marginTop: '6px' }}>
                  {data.stats?.events || 0}
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
                Club Category & Profile Summary
              </h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.94rem', marginBottom: '14px' }}>
                <strong>Category:</strong> {data.category}
              </p>
              <p style={{ color: 'var(--text-body)', fontSize: '0.94rem', lineHeight: 1.7 }}>
                <strong>Short Description:</strong> {data.short_description}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERS & LEADERSHIP TEAM */}
        {activeTab === 'members' && (
          <div>
            {/* Header with Title and Add Member CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Club Members & Leadership Roster
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                  Manage active student members, leadership team, coordinators, and alumni with full profiles.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddMember}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 14px rgba(0, 113, 227, 0.25)'
                }}
              >
                <UserPlus size={16} /> Add Club Member
              </button>
            </div>

            {/* Quick Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="glass-panel" style={{ padding: '18px 22px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Members</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                  {members.length}
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '18px 22px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#137333', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Members</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#137333', marginTop: '4px' }}>
                  {members.filter(m => m.status === 'Active').length}
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '18px 22px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0066CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Executive Leads</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0066CC', marginTop: '4px' }}>
                  {members.filter(m => {
                    const p = (m.position || '').toLowerCase();
                    return p.includes('lead') || p.includes('president') || p.includes('head') || p.includes('secretary');
                  }).length}
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '18px 22px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7928CA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Alumni</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7928CA', marginTop: '4px' }}>
                  {members.filter(m => m.status === 'Alumni').length}
                </div>
              </div>
            </div>

            {/* Search and Status Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', width: '340px', maxWidth: '100%' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: '40px', borderRadius: '999px' }}
                  placeholder="Search by name, email, phone, position..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>Status:</span>
                {['All', 'Active', 'Alumni', 'Inactive'].map(st => {
                  const isSel = memberStatusFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setMemberStatusFilter(st)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: isSel ? 'none' : '1px solid rgba(226, 232, 240, 0.9)',
                        backgroundColor: isSel ? '#0071E3' : '#FFFFFF',
                        color: isSel ? '#FFFFFF' : 'var(--text-body)',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Members Roster Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Member Profile</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Position / Role</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contact Information</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dept & Batch</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Joined Date</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersLoading ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                          Loading members roster...
                        </td>
                      </tr>
                    ) : members.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '54px 24px', color: 'var(--text-muted)' }}>
                          <Users size={36} color="var(--text-light)" style={{ marginBottom: '12px' }} />
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>No club members found</div>
                          <div style={{ fontSize: '0.85rem', marginTop: '4px', marginBottom: '16px' }}>
                            {memberSearch ? 'No members match your search criteria.' : 'Add your first member to start managing your club roster.'}
                          </div>
                          <button
                            type="button"
                            onClick={handleOpenAddMember}
                            className="btn btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
                          >
                            <UserPlus size={14} /> Add Club Member
                          </button>
                        </td>
                      </tr>
                    ) : (
                      members.map(member => {
                        const posStyle = getPositionBadgeStyle(member.position);
                        const statusStyle = getMemberStatusStyle(member.status);
                        return (
                          <tr key={member.id} style={{ borderBottom: '1px solid rgba(241, 245, 249, 0.8)' }}>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {member.avatar_url ? (
                                  <img
                                    src={getAvatarSrc(member.avatar_url)}
                                    alt={member.name}
                                    style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.06)' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#EBF5FF', color: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                                    {member.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.94rem' }}>{member.name}</div>
                                  {member.bio && (
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {member.bio}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                backgroundColor: posStyle.bg,
                                color: posStyle.text,
                                border: `1px solid ${posStyle.border}`
                              }}>
                                {member.position}
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {member.email && (
                                  <a href={`mailto:${member.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--color-secondary)', fontWeight: 500, textDecoration: 'none' }}>
                                    <Mail size={13} /> {member.email}
                                  </a>
                                )}
                                {member.phone && (
                                  <a href={`tel:${member.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                    <Phone size={13} /> {member.phone}
                                  </a>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{member.department || 'N/A'}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{member.batch_year || '—'}</div>
                            </td>
                            <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                              {formatJoinedDate(member.joined_date)}
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.text,
                                border: `1px solid ${statusStyle.border}`
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusStyle.text }} />
                                {member.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditMember(member)}
                                  className="btn btn-secondary"
                                  title="Edit member"
                                  style={{ padding: '6px 10px', borderRadius: '8px' }}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMember(member.id, member.name)}
                                  className="btn btn-secondary"
                                  title="Remove member"
                                  style={{ padding: '6px 10px', borderRadius: '8px', color: '#DC2626' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: APPLICANTS REVIEW TABLE */}
        {activeTab === 'applicants' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: '40px', borderRadius: '999px' }}
                  placeholder="Search applicant name..."
                  value={applicantSearch}
                  onChange={e => setApplicantSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>Status:</span>
                {['All', 'Submitted', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Waitlisted'].map(st => {
                  const isSel = applicantStatusFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setApplicantStatusFilter(st)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: isSel ? 'none' : '1px solid rgba(226, 232, 240, 0.9)',
                        backgroundColor: isSel ? '#0071E3' : '#FFFFFF',
                        color: isSel ? '#FFFFFF' : 'var(--text-body)',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Branch / Year</th>
                    <th>Submitted On</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        No applicant records found for current filters.
                      </td>
                    </tr>
                  ) : (
                    applicants.map(app => {
                      const stStyle = getStatusBadgeStyle(app.status);
                      return (
                        <tr key={app.id}>
                          <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{app.student_name}</td>
                          <td>{app.student_email}</td>
                          <td>{app.branch || '—'} / {app.year || '—'}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(app.submitted_at).toLocaleDateString()}</td>
                          <td>
                            <span className="badge" style={{ backgroundColor: stStyle.bg, color: stStyle.text, border: `1px solid ${stStyle.border}` }}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              onClick={() => setSelectedApplicant(app)} 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                            >
                              <Eye size={13} /> View Answers
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3.5: HNCC AI CANDIDATE RANKING */}
        {activeTab === 'ai-ranking' && (data.slug === 'hncc' || data.id === 1) && (
          <div style={{ backgroundColor: '#0c141c', padding: '28px', border: '1px solid var(--border-gold-dim)', borderRadius: '4px' }}>
            <HnccCandidateRanking />
          </div>
        )}

        {/* TAB 3: EDIT PROFILE WITH PICTURE UPLOAD */}
        {activeTab === 'profile' && (
          <div className="glass-panel" style={{ padding: '36px', maxWidth: '760px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '24px' }}>
              Manage Club Profile & Pictures
            </h3>

            {msg && <div style={{ padding: '12px 18px', borderRadius: '12px', backgroundColor: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>{msg}</div>}

            <form onSubmit={handleUpdateProfile}>
              
              {/* Picture Upload Component */}
              <ImageUploader
                value={logoUrl}
                onChange={setLogoUrl}
                label="Club Logo / Profile Picture"
                helperText="Upload official club emblem (PNG, JPG, SVG or WebP)"
                aspectRatio="square"
              />

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <input 
                  type="text" 
                  className="input" 
                  value={shortDesc} 
                  onChange={e => setShortDesc(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Profile Description</label>
                <textarea 
                  className="input" 
                  rows={5} 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Website URL</label>
                <input 
                  type="url" 
                  className="input" 
                  value={websiteUrl} 
                  onChange={e => setWebsiteUrl(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                <input 
                  type="checkbox" 
                  id="recCheck" 
                  checked={recruitmentOpen} 
                  onChange={e => setRecruitmentOpen(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="recCheck" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Enable Recruitment Application Window
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '24px', padding: '12px 28px' }}>
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: INDUCTION FORM BUILDER */}
        {activeTab === 'form-builder' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Induction Acceptance Window Control Card */}
            <div className="glass-panel" style={{ 
              padding: '26px 30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap', 
              gap: '18px',
              borderLeft: recruitmentOpen ? '4px solid #137333' : '4px solid #94A3B8'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge" style={{ 
                    backgroundColor: recruitmentOpen ? '#E6F4EA' : '#F8FAFC',
                    color: recruitmentOpen ? '#137333' : '#64748B',
                    border: recruitmentOpen ? '1px solid #CEEAD6' : '1px solid #E2E8F0',
                    fontWeight: 700
                  }}>
                    {recruitmentOpen ? '● Form is Live & Open' : '○ Form is Currently Closed'}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', fontWeight: 500 }}>Club Admin Permission</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                  Student Induction Form Availability
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '3px', maxWidth: '580px' }}>
                  {recruitmentOpen 
                    ? 'Students can currently view this form and submit their induction applications on the portal.' 
                    : 'The induction form is currently locked to students. When your team is ready to recruit new members, click the button to open it.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleInductionStatus}
                disabled={actionLoading}
                className={`btn ${recruitmentOpen ? 'btn-secondary' : 'btn-primary'}`}
                style={{ 
                  padding: '11px 24px', 
                  fontSize: '0.88rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  boxShadow: recruitmentOpen ? 'none' : '0 4px 14px rgba(0, 113, 227, 0.3)'
                }}
              >
                {recruitmentOpen ? <ToggleRight size={18} color="#137333" /> : <ToggleLeft size={18} />}
                {recruitmentOpen ? 'Close Induction Form' : 'Open Induction Form Now'}
              </button>
            </div>

            {/* Add Question Card */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                Add New Induction Question
              </h3>
              <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g. Why do you want to join this club?" 
                    value={newQuestionText} 
                    onChange={e => setNewQuestionText(e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Question Type</label>
                    <select className="input" value={newQuestionType} onChange={e => setNewQuestionType(e.target.value)}>
                      <option value="short_text">Short Text</option>
                      <option value="long_text">Long Text</option>
                      <option value="single_choice">Single Choice</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="file_upload">File / Picture Upload</option>
                      <option value="yes_no">Yes / No</option>
                      <option value="number">Number</option>
                    </select>
                  </div>

                  {['single_choice', 'multiple_choice', 'dropdown'].includes(newQuestionType) && (
                    <div className="form-group">
                      <label className="form-label">Options (Comma-separated)</label>
                      <input 
                        type="text" 
                        className="input" 
                        placeholder="Option 1, Option 2, Option 3" 
                        value={newOptionsStr} 
                        onChange={e => setNewOptionsStr(e.target.value)} 
                        required 
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="reqCheck" 
                    checked={newRequired} 
                    onChange={e => setNewRequired(e.target.checked)} 
                  />
                  <label htmlFor="reqCheck" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Required Field
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', padding: '10px 24px' }}>
                  <Plus size={16} /> Add Question
                </button>
              </form>
            </div>

            {/* Existing Questions List */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
                Current Induction Questions ({questions.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questions.map((q, idx) => (
                  <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.94rem' }}>
                        {idx + 1}. {q.question} {q.required === 1 && <span style={{ color: '#DC2626' }}>*</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Type: {q.question_type} {q.options?.length > 0 && `• (${q.options.map(o => o.option_text).join(', ')})`}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: EVENTS WITH PICTURE UPLOAD */}
        {activeTab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                Create New Campus Event
              </h3>
              <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Event Poster / Picture Upload */}
                <ImageUploader
                  value={eventImageUrl}
                  onChange={setEventImageUrl}
                  label="Event Poster / Picture Banner"
                  helperText="Upload event flyer or poster (16:9 recommended, PNG, JPG, WebP)"
                  aspectRatio="video"
                />

                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input type="text" className="input" placeholder="e.g. Hackatron 4.0" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="input" rows={3} value={eventDesc} onChange={e => setEventDesc(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Event Date</label>
                    <input type="date" className="input" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input type="text" className="input" value={eventVenue} onChange={e => setEventVenue(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Registration URL (Optional)</label>
                  <input type="url" className="input" placeholder="https://..." value={eventRegUrl} onChange={e => setEventRegUrl(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', padding: '12px 28px' }}>
                  <Calendar size={16} /> Create & Publish Event
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: SOCIAL LINKS */}
        {activeTab === 'social' && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '680px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
              Add Verified Social Links
            </h3>
            <form onSubmit={handleAddSocialLink} style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
              <select className="input" value={newPlatform} onChange={e => setNewPlatform(e.target.value)} style={{ width: '150px' }}>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="GitHub">GitHub</option>
                <option value="YouTube">YouTube</option>
                <option value="Website">Website</option>
              </select>
              <input type="url" className="input" placeholder="https://..." value={newUrl} onChange={e => setNewUrl(e.target.value)} required style={{ flex: 1, minWidth: '220px' }} />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 22px' }}><Plus size={16} /> Add</button>
            </form>
          </div>
        )}

        {/* TAB 7: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '680px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
              Publish Campus Announcement
            </h3>
            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" className="input" placeholder="Announcement Title..." value={annTitle} onChange={e => setAnnTitle(e.target.value)} required />
              <textarea className="input" rows={4} placeholder="Announcement Content..." value={annContent} onChange={e => setAnnContent(e.target.value)} required />
              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', padding: '11px 26px' }}><Megaphone size={16} /> Publish Announcement</button>
            </form>
          </div>
        )}

      </div>

      {/* APPLICANT DETAIL INSPECTOR MODAL */}
      {selectedApplicant && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}>
          <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', padding: '32px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>{selectedApplicant.student_name}</h3>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>{selectedApplicant.student_email}</div>
              </div>
              <button onClick={() => setSelectedApplicant(null)} className="btn btn-secondary" style={{ padding: '6px 12px', borderRadius: '50%' }}>✕</button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Update Status:</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {['Submitted', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Waitlisted'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedApplicant.id, st)}
                    className={`btn ${selectedApplicant.status === st ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>Q&A Application Responses</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {selectedApplicant.answers && selectedApplicant.answers.map((ans, aIdx) => (
                <div key={aIdx} style={{ padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{ans.question}</div>
                  <div style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '6px' }}>{ans.answer}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MEMBER MODAL */}
      {showMemberModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 250,
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '680px',
            width: '100%',
            padding: '32px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {editingMember ? 'Edit Member Profile' : 'Add New Club Member'}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {editingMember ? `Update ${editingMember.name}'s details and role in the club.` : 'Fill out the details to register a member in your club roster.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMemberModal(false)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', borderRadius: '50%' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Member Photo Upload */}
              <ImageUploader
                value={memberForm.avatar_url}
                onChange={(url) => setMemberForm(prev => ({ ...prev, avatar_url: url }))}
                label="Member Photo / Avatar"
                helperText="Upload member portrait (PNG, JPG, WebP)"
                aspectRatio="square"
              />

              {/* Basic Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. John Doe"
                    value={memberForm.name}
                    onChange={e => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Position / Designation *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. President, Technical Lead, Coordinator"
                    value={memberForm.position}
                    onChange={e => setMemberForm(prev => ({ ...prev, position: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Contact Information Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="e.g. student@bitsindri.ac.in"
                    value={memberForm.email}
                    onChange={e => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="e.g. +91 9876543210"
                    value={memberForm.phone}
                    onChange={e => setMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Academic & Status Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Department / Branch</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. CSE"
                    value={memberForm.department}
                    onChange={e => setMemberForm(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Batch Year</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 2023-2027"
                    value={memberForm.batch_year}
                    onChange={e => setMemberForm(prev => ({ ...prev, batch_year: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Joined Date</label>
                  <input
                    type="date"
                    className="input"
                    value={memberForm.joined_date}
                    onChange={e => setMemberForm(prev => ({ ...prev, joined_date: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Membership Status</label>
                  <select
                    className="input"
                    value={memberForm.status}
                    onChange={e => setMemberForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Social Links */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://linkedin.com/in/..."
                    value={memberForm.linkedin_url}
                    onChange={e => setMemberForm(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GitHub Profile URL</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://github.com/..."
                    value={memberForm.github_url}
                    onChange={e => setMemberForm(prev => ({ ...prev, github_url: e.target.value }))}
                  />
                </div>
              </div>

              {/* Bio / Highlights */}
              <div className="form-group">
                <label className="form-label">Member Bio / Highlights</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Short note about responsibilities, domain focus, or achievements..."
                  value={memberForm.bio}
                  onChange={e => setMemberForm(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="btn btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {actionLoading ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member to Roster'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
