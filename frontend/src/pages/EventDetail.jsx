import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ExternalLink, ArrowLeft, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PixelIcon } from '../components/PixelIcon';
import eventHacksindriImg from '../assets/event_hacksindri_pixel.jpg';
import eventContestImg from '../assets/event_contest_pixel.jpg';
import eventGreenCampusImg from '../assets/event_green_campus_pixel.jpg';
import eventTechfestImg from '../assets/event_techfest_pixel.jpg';

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
      <div style={{ maxWidth: '800px', margin: '80px auto', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        LOADING EVENT DETAILS...
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.8rem', color: 'var(--color-coral)' }}>EVENT NOT FOUND</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
          The requested campus event details could not be loaded.
        </p>
        <Link to="/events" className="btn-pixel-gold">
          ← BACK TO EVENTS
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '880px', paddingTop: '36px' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          <Link to="/events" style={{ color: 'var(--color-cyan)', textDecoration: 'none' }}>
            EVENTS
          </Link>
          <span>&gt;</span>
          <span style={{ color: 'var(--color-gold)' }}>
            {event.title.toUpperCase()}
          </span>
        </div>

        {/* Event Main Box */}
        <div style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-gold)',
          padding: '36px',
          boxShadow: '0 0 20px rgba(194, 166, 73, 0.1)'
        }}>
          
          {/* Banner */}
          <div style={{
            height: '240px',
            backgroundColor: '#070c10',
            border: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
            overflow: 'hidden'
          }}>
            <img
              src={event.image_url ? (event.image_url.startsWith('/uploads') ? `${event.image_url}` : event.image_url) : (
                event.title.toLowerCase().includes('code') || event.title.toLowerCase().includes('contest') ? eventContestImg :
                event.title.toLowerCase().includes('green') || event.title.toLowerCase().includes('plant') ? eventGreenCampusImg :
                event.title.toLowerCase().includes('fest') || event.title.toLowerCase().includes('summit') ? eventTechfestImg :
                eventHacksindriImg
              )}
              alt={event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '2.4rem', color: 'var(--text-cream)', marginBottom: '12px' }}>
            {event.title}
          </h1>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--border-gold)', marginBottom: '24px' }}>
            <div>📅 {event.event_date}</div>
            <div>📍 {event.venue || 'BIT Sindri Campus'}</div>
            <div>🏛️ {event.club_name || 'Organizing Club'}</div>
          </div>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '32px' }}>
            {event.description}
          </p>

          {/* Registration Section */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {regSuccess ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'var(--color-mint-dim)', border: '1px solid var(--color-mint)', color: 'var(--color-mint)', fontFamily: 'var(--font-mono)', fontSize: '0.86rem', fontWeight: 700 }}>
                <CheckCircle2 size={16} /> YOU ARE REGISTERED FOR THIS EVENT
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEventRegistration}
                disabled={registering}
                className="btn-pixel-gold"
                style={{ padding: '12px 28px' }}
              >
                {registering ? 'REGISTERING...' : 'REGISTER FOR EVENT →'}
              </button>
            )}

            {event.registration_url && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noreferrer"
                className="btn-pixel-outline"
                style={{ padding: '11px 22px' }}
              >
                OFFICIAL LINK <ExternalLink size={14} />
              </a>
            )}
          </div>

          {error && (
            <div style={{ marginTop: '16px', color: 'var(--color-coral)', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
              ! {error}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
