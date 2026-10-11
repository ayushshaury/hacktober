import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PixelIcon } from '../components/PixelIcon';
import eventHacksindriImg from '../assets/event_hacksindri_pixel.jpg';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data.events || []))
      .catch(err => console.error('Error fetching events:', err))
      .finally(() => setLoading(false));
  }, []);

  // Standard events curated to match reference panel 4 + active database events
  const defaultEvents = [
    {
      id: 'hs2',
      title: 'HackSindri 2.0',
      club_name: 'Coding Club',
      event_date: 'Nov 12 - Nov 13, 2026',
      category: 'HACKATHON',
      img: eventHacksindriImg,
      iconType: 'code'
    },
    {
      id: 'llw',
      title: 'Lens & Light Workshop',
      club_name: 'Photography Club',
      event_date: 'Oct 28, 2026',
      category: 'WORKSHOP',
      iconType: 'photo'
    },
    {
      id: 'omn',
      title: 'Open Mic Night',
      club_name: 'Music Society',
      event_date: 'Oct 20, 2026',
      category: 'EVENT',
      iconType: 'music'
    },
    {
      id: 'gds',
      title: 'Game Dev Sprint',
      club_name: 'Coding Club',
      event_date: 'Nov 5, 2026',
      category: 'WORKSHOP',
      iconType: 'sport'
    }
  ];

  // Merge database events if they exist
  const displayEvents = events.length > 0 
    ? events.map((e, idx) => ({
        ...e,
        category: (e.title.toLowerCase().includes('hack') ? 'HACKATHON' : e.title.toLowerCase().includes('work') ? 'WORKSHOP' : 'EVENT'),
        iconType: (e.title.toLowerCase().includes('hack') ? 'code' : idx % 2 === 0 ? 'photo' : 'music'),
        img: e.title.toLowerCase().includes('hack') ? eventHacksindriImg : null
      }))
    : defaultEvents;

  const getBadgeStyle = (cat) => {
    switch ((cat || '').toUpperCase()) {
      case 'HACKATHON': return 'cultural'; // Coral
      case 'WORKSHOP': return 'others';   // Mint
      default: return 'tech';             // Cyan
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      <div className="container" style={{ paddingTop: '40px', maxWidth: '920px' }}>
        
        {/* Title & Subtitle (Exact Match to Panel 4) */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
            color: 'var(--text-cream)',
            lineHeight: 1.1,
            letterSpacing: '0.04em'
          }}>
            EVENTS
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            marginTop: '6px'
          }}>
            HACKATHONS, WORKSHOPS, FESTS AND MORE
          </p>
        </div>

        {/* Tabs: UPCOMING / PAST EVENTS */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '32px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`filter-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            style={{ padding: '8px 20px', fontSize: '0.82rem' }}
          >
            UPCOMING
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`filter-btn ${activeTab === 'past' ? 'active' : ''}`}
            style={{ padding: '8px 20px', fontSize: '0.82rem' }}
          >
            PAST EVENTS
          </button>
        </div>

        {/* Compact Horizontal Event Cards Stack (Exact Match to Panel 4) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            LOADING CAMPUS EVENTS...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayEvents.map(ev => {
              const badgeClass = getBadgeStyle(ev.category);
              return (
                <Link
                  key={ev.id}
                  to={ev.registration_url || `/events/${ev.id}`}
                  style={{
                    backgroundColor: '#0c141c',
                    border: '1px solid var(--border-card)',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  className="pixel-card"
                >
                  {/* Left: Pixel Art Thumbnail Banner with Corner Mark */}
                  <div
                    className="pixel-corner-mark"
                    style={{
                      width: '120px',
                      height: '68px',
                      backgroundColor: '#070c10',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {ev.img ? (
                      <img
                        src={ev.img}
                        alt={ev.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          imageRendering: 'pixelated'
                        }}
                      />
                    ) : (
                      <PixelIcon name={ev.iconType || 'tech'} size={38} />
                    )}
                  </div>

                  {/* Center: Title, Club Name, Date */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '1.05rem',
                      color: 'var(--text-cream)',
                      marginBottom: '3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {ev.title}
                    </h3>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginBottom: '4px'
                    }}>
                      {ev.club_name || 'BIT Sindri Club'}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.74rem',
                      color: 'var(--border-gold)'
                    }}>
                      📅 {ev.event_date}
                    </div>
                  </div>

                  {/* Right: Category Badge & Arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <span className={`badge-pixel ${badgeClass}`}>
                      {ev.category}
                    </span>
                    <span style={{ color: 'var(--color-gold)', fontSize: '1.1rem', fontWeight: 700 }}>
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
