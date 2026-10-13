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

  // Multi-club admin: active club switcher
  const [myClubs, setMyClubs] = useState([]);
  const [activeClubId, setActiveClubId] = useState(user?.club_id || (user?.club_ids && user.club_ids[0]) || null);

  const withClub = (url) => {
    if (!activeClubId) return url;
    return `${url}${url.includes('?') ? '&' : '?'}club_id=${activeClubId}`;
  };
  const apiFetch = (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    return fetch(withClub(url), { ...options, headers });
  };

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
  const [admins, setAdmins] = useState([]);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [adminMsg, setAdminMsg] = useState('');
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

  // Event edit and management state
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEventEditModal, setShowEventEditModal] = useState(false);
  const [eventEditForm, setEventEditForm] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    venue: '',
    registration_url: '',
    image_url: '',
    status: 'Published'
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/my-club');
      const resData = await res.json();

      if (!res.ok) throw new Error(resData.error || 'Failed to load admin workspace');

      setData(resData.club);
      setShortDesc(resData.club.short_description || '');
      setDesc(resData.club.description || '');
      setWebsiteUrl(resData.club.website_url || '');
      setRecruitmentOpen(resData.club.recruitment_open === 1);
      setLogoUrl(resData.club.logo_url || '');

      // Fetch Form Builder questions safely
      try {
        const formRes = await apiFetch('/api/induction/admin/form');
        const formData = await formRes.json();
        if (formData.questions) setQuestions(formData.questions);
      } catch (formErr) {
        console.warn('Form questions notice:', formErr);
      }

    } catch (err) {
      console.error('fetchAdminData error:', err);
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

      const res = await apiFetch(`/api/admin/applicants?${params.toString()}`, {
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

      const res = await apiFetch(`/api/admin/members?${params.toString()}`, {
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
    if (!activeClubId && (user?.club_id || (user?.club_ids && user.club_ids[0]))) {
      setActiveClubId(user.club_id || user.club_ids[0]);
    }
  }, [user]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    (async () => {
      try {
        const res = await apiFetch('/api/admin/my-clubs');
        const resData = await res.json();
        const clubs = resData.clubs || [];
        if (isMounted) {
          setMyClubs(clubs);
          if (clubs.length && !activeClubId) {
            setActiveClubId(clubs[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading assigned clubs:', err);
      }
    })();
    return () => { isMounted = false; };
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAdminData();
      fetchMembers();
      fetchAdmins();
      if (activeTab === 'applicants') fetchApplicants();
    }
  }, [token, activeClubId]);

  useEffect(() => {
    if (token && activeTab === 'applicants') {
      fetchApplicants();
    }
  }, [token, activeClubId, activeTab, applicantStatusFilter, applicantSearch]);

  useEffect(() => {
    if (token && activeTab === 'members') {
      fetchMembers();
    }
  }, [token, activeClubId, activeTab, memberStatusFilter, memberSearch]);

  const fetchAdmins = async () => {
    try {
      const res = await apiFetch('/api/admin/admins');
      const resData = await res.json();
      if (res.ok) setAdmins(resData.admins || []);
    } catch (err) {
      console.error('Error loading admins:', err);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAdminMsg('');
    try {
      const res = await apiFetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password,
          club_id: activeClubId
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to add admin');
      setAdminMsg(resData.message);
      setAdminForm({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err) {
      setAdminMsg(err.message);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (!window.confirm('Remove this admin access?')) return;
    try {
      const res = await apiFetch(`/api/admin/admins/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ club_id: activeClubId })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to remove admin');
      fetchAdmins();
    } catch (err) {
      setAdminMsg(err.message);
    }
  };

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

      const res = await apiFetch(url, {
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
      const res = await apiFetch(`/api/admin/members/${memberId}`, {
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
      const res = await apiFetch('/api/admin/my-club', {
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
      const res = await apiFetch('/api/admin/induction/toggle-status', {
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
      const res = await apiFetch('/api/induction/admin/question', {
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
      const res = await apiFetch(`/api/induction/admin/question/${qId}`, {
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
      const res = await apiFetch(`/api/admin/applicants/${appId}/status`, {
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
      const res = await apiFetch('/api/admin/social-links', {
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
      const res = await apiFetch(`/api/admin/social-links/${id}`, {
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
      const res = await apiFetch('/api/admin/announcements', {
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
      const res = await apiFetch(`/api/admin/announcements/${id}`, {
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
      const res = await apiFetch('/api/events', {
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
        setMsg('New event published successfully!');
        fetchAdminData();
      } else {
        const errJson = await res.json();
        setError(errJson.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Error creating event: ' + err.message);
    }
  };

  const handleOpenEditEvent = (ev) => {
    setEditingEvent(ev);
    setEventEditForm({
      title: ev.title || '',
      description: ev.description || '',
      event_date: ev.event_date ? ev.event_date.split('T')[0] : '',
      start_time: ev.start_time || '',
      end_time: ev.end_time || '',
      venue: ev.venue || 'BIT Sindri Campus',
      registration_url: ev.registration_url || '',
      image_url: ev.image_url || '',
      status: ev.status || 'Published'
    });
    setShowEventEditModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(eventEditForm)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to update event');
      setMsg('Event updated successfully!');
      setShowEventEditModal(false);
      setEditingEvent(null);
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Error updating event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete event "${eventTitle}"? This action cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to delete event');
      setMsg('Event removed successfully');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Error deleting event');
    } finally {
      setActionLoading(false);
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
    if (url.startsWith('/uploads')) return `${url}`;
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
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }} className="animate-fade-in">
      
      {/* Header Banner */}
      <div style={{ 
        backgroundColor: '#0c141c', 
        borderBottom: '1px solid var(--border-gold-dim)', 
        padding: '36px 0 28px 0',
        backgroundImage: 'linear-gradient(to bottom, #0c141c 0%, #070c10 100%)'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {data.logo_url ? (
                <img 
                  src={data.logo_url.startsWith('/uploads') ? `${data.logo_url}` : data.logo_url}
                  alt={data.name}
                  style={{ width: '56px', height: '56px', border: '1px solid var(--border-gold)', objectFit: 'cover', boxShadow: '2px 2px 0px #8a7329' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge-pixel gold">
                    <ShieldCheck size={13} style={{ marginRight: '4px' }} /> OFFICIAL WORKSPACE
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-gold)', letterSpacing: '0.04em' }}>CODE: {data.club_code}</span>
                </div>
                <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.9rem', color: 'var(--color-gold)', marginTop: '8px', letterSpacing: '0.04em', textShadow: '0 0 10px rgba(243, 208, 99, 0.3)' }}>
                  {data.name}
                </h1>
                {myClubs.length > 1 && (
                  <select
                    className="pixel-input"
                    value={activeClubId || ''}
                    onChange={(e) => setActiveClubId(parseInt(e.target.value))}
                    style={{ marginTop: '8px', maxWidth: '320px', fontWeight: 600 }}
                  >
                    {myClubs.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span className="badge-pixel" style={{ 
                backgroundColor: recruitmentOpen ? 'var(--color-mint-dim)' : 'var(--color-coral-dim)',
                color: recruitmentOpen ? 'var(--color-mint)' : 'var(--color-coral)',
                border: recruitmentOpen ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid rgba(240, 113, 103, 0.4)',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: recruitmentOpen ? 'var(--color-mint)' : 'var(--color-coral)',
                  display: 'inline-block',
                  marginRight: '6px',
                  boxShadow: recruitmentOpen ? '0 0 6px var(--color-mint)' : '0 0 6px var(--color-coral)'
                }} />
                INDUCTION FORM: {recruitmentOpen ? 'OPEN' : 'CLOSED'}
              </span>

              <button
                type="button"
                onClick={handleToggleInductionStatus}
                disabled={actionLoading}
                className={recruitmentOpen ? "btn-pixel-outline" : "btn-pixel-gold"}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  fontSize: '0.82rem'
                }}
              >
                {recruitmentOpen ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {recruitmentOpen ? 'CLOSE INDUCTION FORM' : 'OPEN INDUCTION FORM'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '32px' }}>
        
        {/* Feedback / Alert Banners */}
        {msg && (
          <div style={{ backgroundColor: 'rgba(74, 222, 128, 0.15)', color: 'var(--color-mint)', border: '1px solid var(--color-mint)', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> {msg}
            </div>
            <button type="button" onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-mint)', fontWeight: 700 }}>✕</button>
          </div>
        )}
        {error && (
          <div style={{ backgroundColor: 'rgba(240, 113, 103, 0.15)', color: 'var(--color-coral)', border: '1px solid var(--color-coral)', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {error}
            </div>
            <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-coral)', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* Retro Tab Navigation Strip */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          backgroundColor: '#080d12', 
          padding: '6px', 
          border: '1px solid var(--border-card)', 
          marginBottom: '32px', 
          overflowX: 'auto',
          maxWidth: '100%',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)'
        }}>
          {[
            { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard },
            { id: 'members', label: `MEMBERS (${data.stats?.members ?? members.length ?? 0})`, icon: Users },
            { id: 'applicants', label: `APPLICANTS (${data.stats?.applications || 0})`, icon: UserCheck },
            { id: 'admins', label: `ADMINS (${admins.filter(a => a.club_id === activeClubId).length})`, icon: ShieldCheck },
            { id: 'profile', label: 'CLUB PROFILE', icon: Edit3 },
            { id: 'form-builder', label: 'FORM BUILDER', icon: FileSpreadsheet },
            { id: 'events', label: `EVENTS (${data.events?.length || 0})`, icon: Calendar },
            { id: 'social', label: 'SOCIAL LINKS', icon: LinkIcon },
            { id: 'announcements', label: 'ANNOUNCEMENTS', icon: Megaphone },
            ...(data?.slug === 'hncc' || user?.club_slug === 'hncc' || user?.email?.includes('hncc') ? [{ id: 'ai-ranking', label: '★ AI SHORTLISTING', icon: Sparkles }] : [])
          ].map(tab => {
            const IconComponent = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  border: isSel ? '1px solid #d4b54e' : '1px solid transparent',
                  backgroundColor: isSel ? 'var(--color-gold)' : 'transparent',
                  color: isSel ? 'var(--text-dark)' : 'var(--text-muted)',
                  boxShadow: isSel ? '2px 2px 0px #8a7329' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="pixel-card pixel-corner-mark" style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>TOTAL PROFILE VIEWS</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-cyan)', marginTop: '6px', textShadow: '0 0 10px rgba(56, 189, 248, 0.35)' }}>
                  {data.stats?.views || 0}
                </div>
              </div>

              <div className="pixel-card pixel-corner-mark" style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>TOTAL APPLICANTS</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-coral)', marginTop: '6px', textShadow: '0 0 10px rgba(240, 113, 103, 0.35)' }}>
                  {data.stats?.applications || 0}
                </div>
              </div>

              <div className="pixel-card pixel-corner-mark" style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>TOTAL CLUB MEMBERS</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-purple)', marginTop: '6px', textShadow: '0 0 10px rgba(192, 132, 252, 0.35)' }}>
                  {data.stats?.members ?? members.length ?? 0}
                </div>
              </div>

              <div className="pixel-card pixel-corner-mark" style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>PUBLISHED EVENTS</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-mint)', marginTop: '6px', textShadow: '0 0 10px rgba(74, 222, 128, 0.35)' }}>
                  {data.stats?.events || 0}
                </div>
              </div>
            </div>

            <div className="pixel-card pixel-corner-mark" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--color-gold)', marginBottom: '14px', letterSpacing: '0.04em' }}>
                Club Category & Profile Summary
              </h3>
              <p style={{ color: 'var(--text-cream)', fontSize: '0.9rem', marginBottom: '12px' }}>
                <strong style={{ color: 'var(--color-gold)' }}>Category:</strong> {data.category}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--color-gold)' }}>Short Description:</strong> {data.short_description}
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
                <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.45rem', color: 'var(--color-gold)', letterSpacing: '0.04em' }}>
                  CLUB MEMBERS & LEADERSHIP ROSTER
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '4px' }}>
                  Manage active student members, leadership team, coordinators, and alumni with full profiles.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddMember}
                className="btn-pixel-gold"
                style={{ padding: '10px 20px', fontSize: '0.86rem' }}
              >
                <UserPlus size={16} /> Add Club Member
              </button>
            </div>

            {/* Quick Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="pixel-card pixel-corner-mark" style={{ padding: '18px 22px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Members</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-cream)', marginTop: '4px' }}>
                  {members.length}
                </div>
              </div>
              <div className="pixel-card pixel-corner-mark" style={{ padding: '18px 22px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-mint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Members</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-mint)', marginTop: '4px' }}>
                  {members.filter(m => m.status === 'Active').length}
                </div>
              </div>
              <div className="pixel-card pixel-corner-mark" style={{ padding: '18px 22px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Executive Leads</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-cyan)', marginTop: '4px' }}>
                  {members.filter(m => {
                    const p = (m.position || '').toLowerCase();
                    return p.includes('lead') || p.includes('president') || p.includes('head') || p.includes('secretary');
                  }).length}
                </div>
              </div>
              <div className="pixel-card pixel-corner-mark" style={{ padding: '18px 22px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alumni</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-purple)', marginTop: '4px' }}>
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
                  className="pixel-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Search by name, email, phone, position..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700, marginRight: '4px' }}>STATUS:</span>
                {['All', 'Active', 'Alumni', 'Inactive'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setMemberStatusFilter(st)}
                    className={`filter-btn ${memberStatusFilter === st ? 'active' : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Roster Table */}
            <div className="pixel-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="retro-table">
                  <thead>
                    <tr>
                      <th style={{ width: '24%' }}>Member Profile</th>
                      <th style={{ width: '16%' }}>Position / Role</th>
                      <th style={{ width: '22%' }}>Contact Information</th>
                      <th style={{ width: '13%' }}>Dept & Batch</th>
                      <th style={{ width: '11%' }}>Joined Date</th>
                      <th style={{ width: '7%' }}>Status</th>
                      <th style={{ width: '7%', textAlign: 'right' }}>Actions</th>
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
                          <Users size={36} color="var(--border-gold)" style={{ marginBottom: '12px' }} />
                          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', color: 'var(--text-cream)' }}>NO CLUB MEMBERS FOUND</div>
                          <div style={{ fontSize: '0.85rem', marginTop: '6px', marginBottom: '18px' }}>
                            {memberSearch ? 'No members match your search criteria.' : 'Add your first member to start managing your club roster.'}
                          </div>
                          <button
                            type="button"
                            onClick={handleOpenAddMember}
                            className="btn-pixel-gold"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
                          >
                            <UserPlus size={14} /> Add Club Member
                          </button>
                        </td>
                      </tr>
                    ) : (
                      members.map(member => (
                        <tr key={member.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {member.avatar_url ? (
                                <img
                                  src={getAvatarSrc(member.avatar_url)}
                                  alt={member.name}
                                  style={{ width: '40px', height: '40px', border: '1px solid var(--border-gold-dim)', objectFit: 'cover' }}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div style={{ width: '40px', height: '40px', border: '1px solid var(--border-card)', backgroundColor: '#080d12', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--font-pixel)', fontSize: '1.1rem' }}>
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-cream)', fontSize: '0.92rem' }}>{member.name}</div>
                                {member.bio && (
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {member.bio}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge-pixel gold">
                              {member.position}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {member.email && (
                                <a href={`mailto:${member.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-gold)', textDecoration: 'none' }}>
                                  <Mail size={12} /> {member.email}
                                </a>
                              )}
                              {member.phone && (
                                <a href={`tel:${member.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                  <Phone size={12} /> {member.phone}
                                </a>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-cream)' }}>{member.department || 'N/A'}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>{member.batch_year || '—'}</div>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {formatJoinedDate(member.joined_date)}
                          </td>
                          <td>
                            <span className={`badge-pixel ${member.status === 'Active' ? 'others' : member.status === 'Alumni' ? 'tech' : 'cultural'}`}>
                              {member.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditMember(member)}
                                className="btn-pixel-outline"
                                title="Edit member"
                                style={{ padding: '6px 8px' }}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMember(member.id, member.name)}
                                className="btn-pixel-outline"
                                title="Remove member"
                                style={{ padding: '6px 8px', color: 'var(--color-coral)', borderColor: 'var(--color-coral)' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMINS */}
        {activeTab === 'admins' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.45rem', color: 'var(--color-gold)', letterSpacing: '0.04em' }}>
              CLUB ADMINS
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '4px', marginBottom: '24px' }}>
              Admins have full access to the club they are assigned to. You can grant admin access to other members here.
            </p>

            <div className="pixel-card pixel-corner-mark" style={{ padding: '24px', marginBottom: '24px', maxWidth: '560px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                [ GRANT ADMIN ACCESS ]
              </div>
              <form onSubmit={handleAddAdmin} style={{ display: 'grid', gap: '14px' }}>
                <input
                  type="text"
                  className="pixel-input"
                  placeholder="Full name (only for new admin)"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                />
                <input
                  type="email"
                  className="pixel-input"
                  placeholder="Email address"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                />
                <input
                  type="password"
                  className="pixel-input"
                  placeholder="Password (only for new admin, min 6 chars)"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                  <button type="submit" className="btn-pixel-gold" style={{ padding: '10px 22px', fontSize: '0.86rem' }}>
                    <UserPlus size={15} /> Add Admin
                  </button>
                  {adminMsg && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-mint)' }}>{adminMsg}</span>}
                </div>
              </form>
            </div>

            <div className="pixel-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="retro-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Admin</th>
                    <th style={{ width: '34%' }}>Email Address</th>
                    <th style={{ width: '24%' }}>Assigned Club</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.filter(a => a.club_id === activeClubId).length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px 18px', color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center' }}>
                        No admins assigned to this club yet.
                      </td>
                    </tr>
                  )}
                  {admins.filter(a => a.club_id === activeClubId).map(a => (
                    <tr key={`${a.id}-${a.club_id}`}>
                      <td style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-cream)' }}>{a.name}</td>
                      <td style={{ fontSize: '0.86rem', color: 'var(--color-gold)' }}>{a.email}</td>
                      <td style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>{a.club_name}</td>
                      <td style={{ textAlign: 'right' }}>
                        {a.id !== user.id ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveAdmin(a.id)}
                            className="btn-pixel-outline"
                            style={{ padding: '6px 12px', fontSize: '0.76rem', color: 'var(--color-coral)', borderColor: 'var(--color-coral)' }}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        ) : (
                          <span className="badge-pixel others">YOU</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: APPLICANTS */}
        {activeTab === 'applicants' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="pixel-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Search applicant name..."
                  value={applicantSearch}
                  onChange={e => setApplicantSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700, marginRight: '4px' }}>STATUS:</span>
                {['All', 'Submitted', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Waitlisted'].map(st => (
                  <button
                    key={st}
                    onClick={() => setApplicantStatusFilter(st)}
                    className={`filter-btn ${applicantStatusFilter === st ? 'active' : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pixel-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="retro-table">
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>Student Name</th>
                      <th style={{ width: '24%' }}>Email Address</th>
                      <th style={{ width: '16%' }}>Branch / Year</th>
                      <th style={{ width: '14%' }}>Submitted On</th>
                      <th style={{ width: '12%' }}>Status</th>
                      <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
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
                      applicants.map(app => (
                        <tr key={app.id}>
                          <td style={{ fontWeight: 700, color: 'var(--text-cream)' }}>{app.student_name}</td>
                          <td style={{ color: 'var(--color-gold)' }}>{app.student_email}</td>
                          <td>{app.branch || '—'} / {app.year || '—'}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(app.submitted_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge-pixel ${app.status === 'Shortlisted' || app.status === 'Selected' ? 'others' : app.status === 'Rejected' ? 'cultural' : 'tech'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              onClick={() => setSelectedApplicant(app)} 
                              className="btn-pixel-outline" 
                              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                            >
                              <Eye size={13} /> View Answers
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EDIT PROFILE WITH PICTURE UPLOAD */}
        {activeTab === 'profile' && (
          <div className="pixel-card pixel-corner-mark" style={{ padding: '36px', maxWidth: '780px' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.45rem', color: 'var(--color-gold)', marginBottom: '24px', letterSpacing: '0.04em' }}>
              MANAGE CLUB PROFILE & PICTURES
            </h3>

            {msg && <div style={{ padding: '12px 18px', backgroundColor: 'rgba(74, 222, 128, 0.15)', color: 'var(--color-mint)', border: '1px solid var(--color-mint)', marginBottom: '20px', fontSize: '0.86rem', fontFamily: 'var(--font-mono)' }}>{msg}</div>}

            <form onSubmit={handleUpdateProfile}>
              
              {/* Picture Upload Component */}
              <ImageUploader
                value={logoUrl}
                onChange={setLogoUrl}
                label="Club Logo / Profile Picture"
                helperText="Upload official club emblem (PNG, JPG, SVG or WebP)"
                aspectRatio="square"
              />

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Short Description</label>
                <input 
                  type="text" 
                  className="pixel-input" 
                  value={shortDesc} 
                  onChange={e => setShortDesc(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Full Profile Description</label>
                <textarea 
                  className="pixel-input" 
                  rows={5} 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Official Website URL</label>
                <input 
                  type="url" 
                  className="pixel-input" 
                  value={websiteUrl} 
                  onChange={e => setWebsiteUrl(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                <input 
                  type="checkbox" 
                  id="recCheck" 
                  checked={recruitmentOpen} 
                  onChange={e => setRecruitmentOpen(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="recCheck" className="form-label" style={{ marginBottom: 0, cursor: 'pointer', color: 'var(--text-cream)' }}>
                  Enable Recruitment Application Window
                </label>
              </div>

              <button type="submit" className="btn-pixel-gold" style={{ marginTop: '24px', padding: '12px 28px' }}>
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: INDUCTION FORM BUILDER */}
        {activeTab === 'form-builder' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Induction Acceptance Window Control Card */}
            <div className="pixel-card pixel-corner-mark" style={{ 
              padding: '24px 28px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap', 
              gap: '18px',
              borderLeft: recruitmentOpen ? '4px solid var(--color-mint)' : '4px solid var(--border-card)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge-pixel" style={{ 
                    backgroundColor: recruitmentOpen ? 'var(--color-mint-dim)' : 'var(--color-coral-dim)',
                    color: recruitmentOpen ? 'var(--color-mint)' : 'var(--color-coral)',
                    border: recruitmentOpen ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid rgba(240, 113, 103, 0.4)',
                    fontWeight: 700
                  }}>
                    {recruitmentOpen ? '● Form is Live & Open' : '○ Form is Currently Closed'}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>CLUB ADMIN PERMISSION</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--text-cream)', marginTop: '8px', letterSpacing: '0.04em' }}>
                  STUDENT INDUCTION FORM AVAILABILITY
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', maxWidth: '580px' }}>
                  {recruitmentOpen 
                    ? 'Students can currently view this form and submit their induction applications on the portal.' 
                    : 'The induction form is currently locked to students. When your team is ready to recruit new members, click the button to open it.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleInductionStatus}
                disabled={actionLoading}
                className={recruitmentOpen ? "btn-pixel-outline" : "btn-pixel-gold"}
                style={{ 
                  padding: '11px 24px', 
                  fontSize: '0.86rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px'
                }}
              >
                {recruitmentOpen ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {recruitmentOpen ? 'Close Induction Form' : 'Open Induction Form Now'}
              </button>
            </div>

            {/* Add Question Card */}
            <div className="pixel-card pixel-corner-mark" style={{ padding: '32px' }}>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.3rem', color: 'var(--color-gold)', marginBottom: '20px', letterSpacing: '0.04em' }}>
                ADD NEW INDUCTION QUESTION
              </h3>
              <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <input 
                    type="text" 
                    className="pixel-input" 
                    placeholder="e.g. Why do you want to join this club?" 
                    value={newQuestionText} 
                    onChange={e => setNewQuestionText(e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Question Type</label>
                    <select className="pixel-input" value={newQuestionType} onChange={e => setNewQuestionType(e.target.value)}>
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
                        className="pixel-input" 
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
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="reqCheck" className="form-label" style={{ marginBottom: 0, cursor: 'pointer', color: 'var(--text-cream)' }}>
                    Required Field
                  </label>
                </div>

                <button type="submit" className="btn-pixel-gold" style={{ width: 'fit-content', padding: '10px 24px' }}>
                  <Plus size={16} /> Add Question
                </button>
              </form>
            </div>

            {/* Existing Questions List */}
            <div className="pixel-card pixel-corner-mark" style={{ padding: '32px' }}>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.3rem', color: 'var(--color-gold)', marginBottom: '16px', letterSpacing: '0.04em' }}>
                CURRENT INDUCTION QUESTIONS ({questions.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questions.map((q, idx) => (
                  <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#080d12', border: '1px solid var(--border-card)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-cream)', fontSize: '0.94rem' }}>
                        {idx + 1}. {q.question} {q.required === 1 && <span style={{ color: 'var(--color-coral)' }}>*</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Type: {q.question_type} {q.options?.length > 0 && `• (${q.options.map(o => o.option_text).join(', ')})`}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: 'var(--color-coral)', cursor: 'pointer', padding: '6px' }} title="Delete question">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: EVENTS MANAGEMENT & PICTURE UPLOAD */}
        {activeTab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Existing Club Events Roster */}
            <div className="pixel-card pixel-corner-mark" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.35rem', color: 'var(--color-gold)', letterSpacing: '0.04em' }}>
                    CLUB EVENTS & WORKSHOPS ROSTER
                  </h3>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Manage and edit active campus events published by {data.name}. Edited events update across the public events portal immediately.
                  </p>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--color-gold)', backgroundColor: '#070c10', padding: '6px 14px', border: '1px solid var(--border-gold-dim)' }}>
                  {data.events?.length || 0} TOTAL EVENTS
                </div>
              </div>

              {(!data.events || data.events.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#080d12', border: '1px solid var(--border-card)' }}>
                  <Calendar size={32} style={{ color: 'var(--color-gold)', margin: '0 auto 12px auto' }} />
                  <div style={{ fontFamily: 'var(--font-pixel)', color: 'var(--text-cream)', fontSize: '1.05rem' }}>NO EVENTS PUBLISHED YET</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Create your club's first hackathon, coding contest, or workshop using the form below.
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-card)' }}>
                  <table className="retro-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>POSTER</th>
                        <th style={{ width: '28%' }}>EVENT TITLE</th>
                        <th style={{ width: '20%' }}>DATE & TIME</th>
                        <th style={{ width: '20%' }}>VENUE</th>
                        <th style={{ width: '12%' }}>STATUS</th>
                        <th style={{ width: '20%', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.events.map(ev => (
                        <tr key={ev.id}>
                          <td>
                            <div style={{ width: '64px', height: '42px', backgroundColor: '#070c10', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                              {ev.image_url ? (
                                <img
                                  src={ev.image_url.startsWith('/uploads') ? ev.image_url : ev.image_url}
                                  alt={ev.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                  <Calendar size={18} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-cream)', fontSize: '0.92rem' }}>{ev.title}</div>
                            {ev.description && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                {ev.description}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{formatDate(ev.event_date)}</div>
                            {(ev.start_time || ev.end_time) && (
                              <div style={{ fontSize: '0.76rem', color: 'var(--color-cyan)', marginTop: '2px' }}>
                                {ev.start_time || ''} {ev.end_time ? `- ${ev.end_time}` : ''}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.84rem', color: 'var(--text-cream)' }}>{ev.venue || 'BIT Sindri Campus'}</div>
                          </td>
                          <td>
                            <span className={`badge-pixel ${ev.status === 'Registration Open' ? 'cultural' : 'tech'}`} style={{ fontSize: '0.7rem' }}>
                              {ev.status || 'Published'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditEvent(ev)}
                                className="btn-pixel-gold"
                                style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Edit this event"
                              >
                                <Pencil size={13} /> Edit
                              </button>
                              <a
                                href={`/events/${ev.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-pixel-outline"
                                style={{ padding: '6px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center' }}
                                title="View public event page"
                              >
                                <ExternalLink size={13} />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteEvent(ev.id, ev.title)}
                                className="btn-pixel-outline"
                                style={{ padding: '6px 10px', color: 'var(--color-coral)', borderColor: 'rgba(240, 113, 103, 0.4)' }}
                                title="Delete this event"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Create Event Section */}
            <div className="pixel-card pixel-corner-mark" style={{ padding: '32px' }}>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.35rem', color: 'var(--color-gold)', marginBottom: '20px', letterSpacing: '0.04em' }}>
                CREATE NEW CAMPUS EVENT
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
                  <label className="form-label">Event Title *</label>
                  <input type="text" className="pixel-input" placeholder="e.g. Hackatron 4.0" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="pixel-input" rows={3} placeholder="Event description, rules, eligibility, prizes..." value={eventDesc} onChange={e => setEventDesc(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Event Date *</label>
                    <input type="date" className="pixel-input" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input type="text" className="pixel-input" value={eventVenue} onChange={e => setEventVenue(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Registration URL (Optional)</label>
                  <input type="url" className="pixel-input" placeholder="https://..." value={eventRegUrl} onChange={e => setEventRegUrl(e.target.value)} />
                </div>
                <button type="submit" className="btn-pixel-gold" style={{ width: 'fit-content', padding: '12px 28px' }}>
                  <Calendar size={16} /> Create & Publish Event
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 8: SOCIAL LINKS */}
        {activeTab === 'social' && (
          <div className="pixel-card pixel-corner-mark" style={{ padding: '32px', maxWidth: '680px' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.35rem', color: 'var(--color-gold)', marginBottom: '20px', letterSpacing: '0.04em' }}>
              ADD VERIFIED SOCIAL LINKS
            </h3>
            <form onSubmit={handleAddSocialLink} style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
              <select className="pixel-input" value={newPlatform} onChange={e => setNewPlatform(e.target.value)} style={{ width: '150px' }}>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="GitHub">GitHub</option>
                <option value="YouTube">YouTube</option>
                <option value="Website">Website</option>
              </select>
              <input type="url" className="pixel-input" placeholder="https://..." value={newUrl} onChange={e => setNewUrl(e.target.value)} required style={{ flex: 1, minWidth: '220px' }} />
              <button type="submit" className="btn-pixel-gold" style={{ padding: '10px 22px' }}><Plus size={16} /> Add</button>
            </form>
          </div>
        )}

        {/* TAB 9: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="pixel-card pixel-corner-mark" style={{ padding: '32px', maxWidth: '680px' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.35rem', color: 'var(--color-gold)', marginBottom: '20px', letterSpacing: '0.04em' }}>
              PUBLISH CAMPUS ANNOUNCEMENT
            </h3>
            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" className="pixel-input" placeholder="Announcement Title..." value={annTitle} onChange={e => setAnnTitle(e.target.value)} required />
              <textarea className="pixel-input" rows={4} placeholder="Announcement Content..." value={annContent} onChange={e => setAnnContent(e.target.value)} required />
              <button type="submit" className="btn-pixel-gold" style={{ width: 'fit-content', padding: '11px 26px' }}><Megaphone size={16} /> Publish Announcement</button>
            </form>
          </div>
        )}

        {/* TAB: AI CANDIDATE RANKING (HnCC) */}
        {activeTab === 'ai-ranking' && (
          <div style={{ marginTop: '16px' }}>
            <HnccCandidateRanking />
          </div>
        )}

      </div>


      {/* APPLICANT DETAIL INSPECTOR MODAL */}
      {selectedApplicant && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}>
          <div className="pixel-card pixel-corner-mark" style={{ maxWidth: '640px', width: '100%', padding: '32px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--color-gold)' }}>{selectedApplicant.student_name}</h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-muted)' }}>{selectedApplicant.student_email}</div>
              </div>
              <button onClick={() => setSelectedApplicant(null)} className="btn-pixel-outline" style={{ padding: '6px 12px' }}>✕</button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">UPDATE STATUS:</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {['Submitted', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Waitlisted'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedApplicant.id, st)}
                    className={`filter-btn ${selectedApplicant.status === st ? 'active' : ''}`}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', color: 'var(--color-gold)', marginBottom: '14px', letterSpacing: '0.04em' }}>Q&A APPLICATION RESPONSES</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {selectedApplicant.answers && selectedApplicant.answers.map((ans, aIdx) => (
                <div key={aIdx} style={{ padding: '16px', backgroundColor: '#080d12', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-gold)' }}>{ans.question}</div>
                  <div style={{ color: 'var(--text-cream)', fontSize: '0.88rem', marginTop: '6px' }}>{ans.answer}</div>
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
          backgroundColor: 'rgba(0, 0, 0, 0.78)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 250,
          padding: '24px'
        }}>
          <div className="pixel-card pixel-corner-mark" style={{
            maxWidth: '680px',
            width: '100%',
            padding: '32px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--color-gold)', letterSpacing: '0.04em' }}>
                  {editingMember ? 'EDIT MEMBER PROFILE' : 'ADD NEW CLUB MEMBER'}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {editingMember ? `Update ${editingMember.name}'s details and role in the club.` : 'Fill out the details to register a member in your club roster.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMemberModal(false)}
                className="btn-pixel-outline"
                style={{ padding: '6px 12px' }}
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
                    className="pixel-input"
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
                    className="pixel-input"
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
                    className="pixel-input"
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
                    className="pixel-input"
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
                    className="pixel-input"
                    placeholder="e.g. CSE"
                    value={memberForm.department}
                    onChange={e => setMemberForm(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Batch Year</label>
                  <input
                    type="text"
                    className="pixel-input"
                    placeholder="e.g. 2023-2027"
                    value={memberForm.batch_year}
                    onChange={e => setMemberForm(prev => ({ ...prev, batch_year: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Joined Date</label>
                  <input
                    type="date"
                    className="pixel-input"
                    value={memberForm.joined_date}
                    onChange={e => setMemberForm(prev => ({ ...prev, joined_date: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Membership Status</label>
                  <select
                    className="pixel-input"
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
                    className="pixel-input"
                    placeholder="https://linkedin.com/in/..."
                    value={memberForm.linkedin_url}
                    onChange={e => setMemberForm(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GitHub Profile URL</label>
                  <input
                    type="url"
                    className="pixel-input"
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
                  className="pixel-input"
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
                  className="btn-pixel-outline"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixel-gold"
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

      {/* EDIT EVENT MODAL */}
      {showEventEditModal && editingEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 260,
          padding: '24px'
        }}>
          <div className="pixel-card pixel-corner-mark" style={{
            maxWidth: '680px',
            width: '100%',
            padding: '32px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--color-gold)', letterSpacing: '0.04em' }}>
                  EDIT EVENT: {editingEvent.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Update details, venue, dates, or registration links for this campus event.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowEventEditModal(false); setEditingEvent(null); }}
                className="btn-pixel-outline"
                style={{ padding: '6px 12px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Event Poster / Flyer */}
              <ImageUploader
                value={eventEditForm.image_url}
                onChange={(url) => setEventEditForm(prev => ({ ...prev, image_url: url }))}
                label="Event Poster / Picture Banner"
                helperText="Upload event flyer or poster (16:9 recommended, PNG, JPG, WebP)"
                aspectRatio="video"
              />

              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  className="pixel-input"
                  value={eventEditForm.title}
                  onChange={e => setEventEditForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="pixel-input"
                  rows={3}
                  value={eventEditForm.description}
                  onChange={e => setEventEditForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Event Date *</label>
                  <input
                    type="date"
                    className="pixel-input"
                    value={eventEditForm.event_date}
                    onChange={e => setEventEditForm(prev => ({ ...prev, event_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="pixel-input"
                    value={eventEditForm.status}
                    onChange={e => setEventEditForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Published">Published</option>
                    <option value="Registration Open">Registration Open</option>
                    <option value="Draft">Draft</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="text"
                    className="pixel-input"
                    placeholder="e.g. 09:00 AM"
                    value={eventEditForm.start_time}
                    onChange={e => setEventEditForm(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="text"
                    className="pixel-input"
                    placeholder="e.g. 05:00 PM"
                    value={eventEditForm.end_time}
                    onChange={e => setEventEditForm(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue</label>
                <input
                  type="text"
                  className="pixel-input"
                  value={eventEditForm.venue}
                  onChange={e => setEventEditForm(prev => ({ ...prev, venue: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration / Portal URL</label>
                <input
                  type="url"
                  className="pixel-input"
                  placeholder="https://..."
                  value={eventEditForm.registration_url}
                  onChange={e => setEventEditForm(prev => ({ ...prev, registration_url: e.target.value }))}
                />
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setShowEventEditModal(false); setEditingEvent(null); }}
                  className="btn-pixel-outline"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixel-gold"
                  disabled={actionLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {actionLoading ? 'Saving Changes...' : 'Save & Update Event'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
