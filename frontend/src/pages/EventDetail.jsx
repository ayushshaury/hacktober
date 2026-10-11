import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Compass, ExternalLink, ArrowLeft, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/events/${id}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Event not found');
        return res.json();
      })
      .then(data => {
        setEvent(data.event);
        if (data.event.is_registered) setRegSuccess(true);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  const getImageSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  const handleEventRegistration = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      const res = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      setRegSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '80px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading event details...
      </div>
    );
  }

  if (error && !event) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 20px' }}>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Event Not Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            The requested campus event details could not be loaded.
          </p>
          <Link to="/events" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back to Events Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 80px 24px' }} className="animate-fade-in">
      
      <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Event Hub
      </Link>

      {/* Main Event Card Banner */}
      <div className="glass-panel" style={{ padding: '36px', marginBottom: '32px' }}>
        
        {/* Event Picture Banner if provided */}
        {event.image_url ? (
          <div style={{ 
            width: '100%', 
            maxHeight: '340px', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            marginBottom: '28px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)' 
          }}>
            <img 
              src={getImageSrc(event.image_url)} 
              alt={event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
            />
          </div>
        ) : null}

        {/* Organizer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <Link to={`/clubs/${event.club_slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
            <Compass size={18} /> Organized by {event.club_name}
          </Link>

          <span className="badge" style={{ 
            backgroundColor: event.status === 'Registration Open' ? '#E6F4EA' : 'var(--color-light-blue)',
            color: event.status === 'Registration Open' ? '#137333' : '#0066CC',
            border: event.status === 'Registration Open' ? '1px solid #CEEAD6' : '1px solid #BAE0FD'
          }}>
            {event.status}
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: '24px', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
          {event.title}
        </h1>

        {/* Metadata Grid (Apple Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', padding: '20px', background: 'rgba(248, 250, 252, 0.7)', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', marginBottom: '32px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066CC' }}>
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.04em' }}>EVENT DATE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{event.event_date}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#E6F4EA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#137333' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.04em' }}>TIMINGS</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{event.start_time || 'TBA'} {event.end_time ? `- ${event.end_time}` : ''}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FEF7E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B08800' }}>
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.04em' }}>VENUE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{event.venue}</div>
            </div>
          </div>

        </div>

        {/* Full Event Description */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>Event Description</h3>
          <p style={{ color: 'var(--text-body)', fontSize: '0.98rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {event.description}
          </p>
        </div>

        {/* External Registration or On-Platform Action */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          {regSuccess ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#137333', background: '#E6F4EA', padding: '10px 20px', borderRadius: '999px', fontWeight: 700, fontSize: '0.92rem' }}>
              <CheckCircle2 size={18} /> You are registered for this event!
            </div>
          ) : (
            <button 
              onClick={handleEventRegistration} 
              disabled={registering}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              <UserCheck size={18} /> {registering ? 'Registering...' : 'Register for Event'}
            </button>
          )}

          {event.registration_url && (
            <a 
              href={event.registration_url} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-secondary"
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
            >
              Official Event Link <ExternalLink size={16} />
            </a>
          )}
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C5221F', marginTop: '16px', fontSize: '0.88rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

      </div>

    </div>
  );
};
