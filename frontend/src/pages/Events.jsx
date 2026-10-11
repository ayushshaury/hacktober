import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Search, ArrowRight, Compass, Clock, CheckCircle } from 'lucide-react';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());

    fetch(`/api/events?${params.toString()}`)
      .then(res => res.json())
      .then(data => setEvents(data.events || []))
      .catch(err => console.error('Error fetching events:', err))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  const getImageSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }} className="animate-fade-in">
      
      {/* Header Banner (Apple Style Clean Canvas) */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)', 
        padding: '52px 0 40px 0' 
      }}>
        <div className="container" style={{ maxWidth: '840px', textAlign: 'center' }}>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '5px 14px', 
            borderRadius: '999px', 
            backgroundColor: 'var(--color-light-blue)', 
            border: '1px solid #BAE0FD', 
            color: '#0066CC', 
            fontSize: '0.82rem', 
            fontWeight: 600, 
            marginBottom: '16px' 
          }}>
            <Calendar size={14} /> Campus Events & Technical Fests
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', letterSpacing: '-0.025em' }}>
            BIT Sindri <span className="gradient-text">Events Hub</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Explore hackathons, technological symposiums, coding contests, and cultural fests organized by verified institute clubs.
          </p>

        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '36px' }}>
        
        {/* Search Bar (Apple Style Squircle) */}
        <div className="glass-panel" style={{ padding: '14px 20px', marginBottom: '32px', maxWidth: '640px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '44px', borderRadius: '999px' }}
              placeholder="Search events by title, venue, or organizing club..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div className="spin" style={{ width: '28px', height: '28px', border: '3px solid #0071E3', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px' }} />
            Loading campus events...
          </div>
        ) : events.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Calendar size={44} color="#94A3B8" />
            <h3 style={{ marginTop: '16px', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>No campus events found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>Try searching with broader terms.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '26px' }}>
            {events.map(ev => (
              <div 
                key={ev.id} 
                className="glass-panel glass-panel-hover" 
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                
                {/* Event Picture / Banner if available */}
                {ev.image_url ? (
                  <div style={{ 
                    width: '100%', 
                    height: '170px', 
                    borderRadius: '14px', 
                    overflow: 'hidden', 
                    marginBottom: '18px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)' 
                  }}>
                    <img 
                      src={getImageSrc(ev.image_url)} 
                      alt={ev.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s var(--ease-apple)' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                ) : null}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span className="badge badge-technical">
                    <Calendar size={12} /> {ev.event_date || 'Upcoming'}
                  </span>
                  <span className="badge" style={{ backgroundColor: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6' }}>
                    {ev.status || 'Published'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.22rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.3 }}>
                  {ev.title}
                </h3>

                <div style={{ fontSize: '0.86rem', color: 'var(--color-secondary)', fontWeight: 600, marginBottom: '14px' }}>
                  Organized by {ev.club_name}
                </div>

                <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '22px', flex: 1 }}>
                  {ev.description ? ev.description.slice(0, 115) + '...' : ''}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  <MapPin size={15} color="var(--text-muted)" />
                  <span>{ev.venue || 'BIT Sindri Campus'}</span>
                </div>

                <Link 
                  to={`/events/${ev.id}`} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', padding: '10px' }}
                >
                  View Event & Register <ArrowRight size={14} />
                </Link>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
