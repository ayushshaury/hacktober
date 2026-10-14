import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, Sparkles, Search, Grid, List, 
  ExternalLink, ChevronRight, Trophy, Flame, ShieldCheck, 
  X, AlertCircle, ArrowUpRight, Share2, Tag
} from 'lucide-react';
import { PixelIcon } from '../components/PixelIcon';

// High-definition 16-bit retro arcade assets
import eventHacksindriImg from '../assets/event_hacksindri_pixel.jpg';
import eventContestImg from '../assets/event_contest_pixel.jpg';
import eventGreenCampusImg from '../assets/event_green_campus_pixel.jpg';
import eventTechfestImg from '../assets/event_techfest_pixel.jpg';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTiming, setActiveTiming] = useState('upcoming'); // 'upcoming' | 'past'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'timeline'
  const [quickViewEvent, setQuickViewEvent] = useState(null);

  // Countdown timer state for the spotlight hero event
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });

  useEffect(() => {
    setLoading(true);
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Curated database-synchronized fallback events
  const fallbackEvents = useMemo(() => [
    {
      id: 1,
      title: 'Hackatron 4.0 — National 36-Hour Hackathon',
      club_name: 'Hackathon and Coding Club (HnCC)',
      club_slug: 'hncc',
      event_date: '2026-11-15',
      start_time: '09:00 AM',
      end_time: '09:00 PM',
      venue: 'Deshpande Auditorium & IT Building',
      registration_url: 'https://www.hnccbits.com/',
      category: 'HACKATHON',
      status: 'Registration Open',
      description: 'Flagship national level 36-hour hackathon organized by HnCC, BIT Sindri. Solve real-world challenges in AI/ML, Web Dev, Open Source, and Mobile Apps with cash prizes, mentor guidance & exclusive swags.',
      image_url: eventHacksindriImg,
      highlights: ['36-Hour Hackathon', 'Cash Prize Pool ₹50K+', 'Free Swags & Food']
    },
    {
      id: 2,
      title: 'BIT Code — Monthly Campus Coding Contest',
      club_name: 'Hackathon and Coding Club (HnCC)',
      club_slug: 'hncc',
      event_date: '2026-10-25',
      start_time: '06:00 PM',
      end_time: '08:30 PM',
      venue: 'Online (CodeChef)',
      registration_url: 'https://www.hnccbits.com/',
      category: 'CONTEST',
      status: 'Published',
      description: 'Monthly competitive programming contest on CodeChef platform hosted by HnCC to boost campus DSA, algorithmic problem solving, and ICPC readiness with live leaderboard.',
      image_url: eventContestImg,
      highlights: ['CodeChef Platform', 'DSA / CP Contest', 'Rank Certificates']
    },
    {
      id: 3,
      title: 'Sandhaan 2026 — Mega Techno-Management Fest',
      club_name: 'Model Club',
      club_slug: 'model-club',
      event_date: '2026-12-05',
      start_time: '10:00 AM',
      end_time: '07:00 PM',
      venue: 'BIT Sindri Main Campus',
      registration_url: 'https://www.bitsindri.ac.in/',
      category: 'TECH FEST',
      status: 'Registration Open',
      description: 'Annual mega tech fest featuring robotics arenas, paper presentations, guest lectures by top technology leaders, drone racing, and technical project exhibitions.',
      image_url: eventTechfestImg,
      highlights: ['Robotics Arena', 'Guest Keynotes', 'Project Expo']
    },
    {
      id: 4,
      title: 'E-Summit 2026 — Annual Entrepreneurship & Innovation Summit',
      club_name: 'IIC (Institution Innovation Council)',
      club_slug: 'iic',
      event_date: '2026-11-02',
      start_time: '09:30 AM',
      end_time: '05:00 PM',
      venue: 'Placement Cell Auditorium',
      registration_url: 'https://www.bitsindri.ac.in/start-up-cell/',
      category: 'WORKSHOP',
      status: 'Registration Open',
      description: 'Pitch your startup ideas to angel investors, participate in Navonmesh pitch deck competition, and interact directly with prominent BIT Sindri founder alumni.',
      image_url: eventTechfestImg,
      highlights: ['Pitch Deck Arena', 'Founder Keynotes', 'Angel Funding']
    },
    {
      id: 5,
      title: 'Van Mahotsav & Green Campus Tree Plantation Drive',
      club_name: 'Eco Club',
      club_slug: 'eco-club',
      event_date: '2026-10-30',
      start_time: '07:00 AM',
      end_time: '11:00 AM',
      venue: 'Campus Sports Ground',
      registration_url: 'https://www.bitsindri.ac.in/eco-club/',
      category: 'DRIVE',
      status: 'Published',
      description: 'Annual environmental awareness and mass tree sapling plantation drive across hostels and campus gardens to promote carbon-neutral campus living.',
      image_url: eventGreenCampusImg,
      highlights: ['Eco Awareness', 'Mass Plantation', 'Certificate of Green Service']
    }
  ], []);

  // Map image and category metadata cleanly onto incoming events
  const allEvents = useMemo(() => {
    const rawList = events.length > 0 ? events : fallbackEvents;
    return rawList.map(item => {
      const titleLower = (item.title || '').toLowerCase();
      let category = item.category || 'EVENT';
      let img = item.image_url;

      if (!item.category) {
        if (titleLower.includes('hack')) category = 'HACKATHON';
        else if (titleLower.includes('code') || titleLower.includes('contest') || titleLower.includes('dsa')) category = 'CONTEST';
        else if (titleLower.includes('fest') || titleLower.includes('summit')) category = 'TECH FEST';
        else if (titleLower.includes('green') || titleLower.includes('plant') || titleLower.includes('drive')) category = 'DRIVE';
        else if (titleLower.includes('work') || titleLower.includes('bootcamp')) category = 'WORKSHOP';
      }

      if (!img) {
        if (category === 'HACKATHON') img = eventHacksindriImg;
        else if (category === 'CONTEST') img = eventContestImg;
        else if (category === 'DRIVE') img = eventGreenCampusImg;
        else img = eventTechfestImg;
      }

      return {
        ...item,
        category,
        image_url: img
      };
    });
  }, [events, fallbackEvents]);

  // Designate the flagship spotlight hero event (e.g. Hackatron or first upcoming)
  const spotlightEvent = useMemo(() => {
    return allEvents.find(e => e.title.toLowerCase().includes('hackatron') || e.title.toLowerCase().includes('hack')) || allEvents[0];
  }, [allEvents]);

  // Real-time Countdown Timer for Spotlight Event
  useEffect(() => {
    if (!spotlightEvent || !spotlightEvent.event_date) return;

    const targetDate = new Date(`${spotlightEvent.event_date}T09:00:00`);

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setCountdown({ days: '00', hours: '00', mins: '00', secs: '00' });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setCountdown({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        mins: String(m).padStart(2, '0'),
        secs: String(s).padStart(2, '0')
      });
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [spotlightEvent]);

  // Helper date parser for retro calendar stamp
  const parseEventDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return { month: 'CAMP', day: '26', full: dateStr };
      }
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return {
        month: monthNames[d.getMonth()],
        day: String(d.getDate()).padStart(2, '0'),
        full: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    } catch {
      return { month: 'CAMP', day: '26', full: dateStr };
    }
  };

  // Category Badge Styler
  const getCategoryBadgeColor = (cat) => {
    switch ((cat || '').toUpperCase()) {
      case 'HACKATHON': return { bg: 'rgba(240, 113, 103, 0.16)', text: 'var(--color-coral)', border: 'rgba(240, 113, 103, 0.45)' };
      case 'CONTEST': return { bg: 'rgba(56, 189, 248, 0.16)', text: 'var(--color-cyan)', border: 'rgba(56, 189, 248, 0.45)' };
      case 'TECH FEST': return { bg: 'rgba(243, 208, 99, 0.16)', text: 'var(--color-gold)', border: 'rgba(243, 208, 99, 0.45)' };
      case 'DRIVE': return { bg: 'rgba(74, 222, 128, 0.16)', text: 'var(--color-mint)', border: 'rgba(74, 222, 128, 0.45)' };
      case 'WORKSHOP': return { bg: 'rgba(192, 132, 252, 0.16)', text: 'var(--color-purple)', border: 'rgba(192, 132, 252, 0.45)' };
      default: return { bg: 'rgba(243, 208, 99, 0.16)', text: 'var(--color-gold)', border: 'var(--border-gold-dim)' };
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return allEvents.filter(ev => {
      // 1. Timing filter
      const isUpcoming = (ev.event_date >= today) || ev.status === 'Registration Open' || ev.status === 'Published';
      if (activeTiming === 'upcoming' && !isUpcoming) return false;
      if (activeTiming === 'past' && isUpcoming) return false;

      // 2. Category filter
      if (selectedCategory !== 'ALL' && ev.category !== selectedCategory) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = ev.title?.toLowerCase().includes(q);
        const matchesClub = ev.club_name?.toLowerCase().includes(q);
        const matchesVenue = ev.venue?.toLowerCase().includes(q);
        const matchesDesc = ev.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesClub && !matchesVenue && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [allEvents, activeTiming, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: allEvents.length };
    allEvents.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [allEvents]);

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '90px', position: 'relative' }} className="animate-fade-in events-retro-grid">
      
      {/* Top Ambient Glow Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '1000px',
        height: '240px',
        background: 'radial-gradient(circle, rgba(243, 208, 99, 0.08) 0%, rgba(56, 189, 248, 0.04) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '36px' }}>

        {/* ============================================================
            HERO HEADER
            ============================================================ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge-pixel gold" style={{ fontSize: '0.74rem' }}>
                <Sparkles size={12} style={{ marginRight: '5px' }} /> CAMPUS LIFE & ACTIVATION
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {allEvents.length} TOTAL VERIFIED EVENTS
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
              color: 'var(--color-gold)',
              lineHeight: 1.08,
              letterSpacing: '0.04em',
              textShadow: '0 0 16px rgba(243, 208, 99, 0.28)'
            }}>
              CAMPUS EVENTS
            </h1>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: 'var(--text-cream)',
              letterSpacing: '0.04em',
              marginTop: '6px',
              maxWidth: '620px'
            }}>
              Discover national hackathons, coding contests, innovation summits, techno-management fests, and workshops hosted by official BIT Sindri clubs.
            </p>
          </div>

          {/* Quick Stats Banner Pills */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="pixel-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0c141c' }}>
              <Flame size={20} style={{ color: 'var(--color-coral)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>UPCOMING</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.15rem', color: 'var(--text-cream)' }}>
                  {allEvents.filter(e => e.status === 'Registration Open' || e.status === 'Published').length} EVENTS
                </div>
              </div>
            </div>

            <div className="pixel-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0c141c' }}>
              <Trophy size={20} style={{ color: 'var(--color-gold)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>PRIZE POOL</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.15rem', color: 'var(--color-gold)' }}>
                  ₹1,50,000+
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            SPOTLIGHT FEATURED EVENT HERO BANNER
            ============================================================ */}
        {spotlightEvent && (
          <div className="event-hero-card pixel-corner-mark" style={{ marginBottom: '40px', padding: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', alignItems: 'stretch' }}>
              
              {/* Left Column: Spotlight Info & Countdown */}
              <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 2 }}>
                <div>
                  
                  {/* Spotlight Header Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <span className="badge-pixel gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                      <Sparkles size={14} /> ★ SPOTLIGHT EVENT
                    </span>
                    <span className="event-live-pill">
                      <span className="event-live-dot" /> LIVE / REGISTRATION OPEN
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
                    color: 'var(--text-cream)',
                    lineHeight: 1.2,
                    letterSpacing: '0.03em',
                    marginBottom: '10px'
                  }}>
                    {spotlightEvent.title}
                  </h2>

                  {/* Host Club Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ color: 'var(--color-gold)', display: 'inline-flex', alignItems: 'center' }}>
                      <ShieldCheck size={16} />
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                      {spotlightEvent.club_name}
                    </span>
                  </div>

                  {/* Description Synopsis */}
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.65,
                    marginBottom: '20px'
                  }}>
                    {spotlightEvent.description}
                  </p>

                  {/* Event Metadata Chips */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-cream)', fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                      <Calendar size={15} style={{ color: 'var(--color-gold)' }} />
                      <span>{parseEventDate(spotlightEvent.event_date).full}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-cream)', fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                      <Clock size={15} style={{ color: 'var(--color-cyan)' }} />
                      <span>{spotlightEvent.start_time || '09:00 AM'} - {spotlightEvent.end_time || '09:00 PM'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-cream)', fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
                      <MapPin size={15} style={{ color: 'var(--color-coral)' }} />
                      <span>{spotlightEvent.venue || 'BIT Sindri Main Auditorium'}</span>
                    </div>
                  </div>
                </div>

                {/* Countdown Timer + Action CTAs */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-gold)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '8px' }}>
                      ⚡ EVENT COMMENCES IN:
                    </div>
                    
                    <div className="event-countdown-box">
                      <div className="event-countdown-unit">
                        <div className="event-countdown-num">{countdown.days}</div>
                        <div className="event-countdown-lbl">DAYS</div>
                      </div>
                      <div style={{ color: 'var(--color-gold)', fontWeight: 800 }}>:</div>
                      <div className="event-countdown-unit">
                        <div className="event-countdown-num">{countdown.hours}</div>
                        <div className="event-countdown-lbl">HOURS</div>
                      </div>
                      <div style={{ color: 'var(--color-gold)', fontWeight: 800 }}>:</div>
                      <div className="event-countdown-unit">
                        <div className="event-countdown-num">{countdown.mins}</div>
                        <div className="event-countdown-lbl">MINS</div>
                      </div>
                      <div style={{ color: 'var(--color-gold)', fontWeight: 800 }}>:</div>
                      <div className="event-countdown-unit">
                        <div className="event-countdown-num">{countdown.secs}</div>
                        <div className="event-countdown-lbl">SECS</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link
                      to={spotlightEvent.registration_url ? spotlightEvent.registration_url : `/events/${spotlightEvent.id}`}
                      target={spotlightEvent.registration_url?.startsWith('http') ? '_blank' : '_self'}
                      rel="noreferrer"
                      className="btn-pixel-gold"
                      style={{ padding: '12px 28px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      REGISTER FOR EVENT <ArrowUpRight size={16} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setQuickViewEvent(spotlightEvent)}
                      className="btn-pixel-outline"
                      style={{ padding: '11px 20px', fontSize: '0.84rem' }}
                    >
                      QUICK PREVIEW
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Hero Cinematic Artwork Banner */}
              <div style={{
                position: 'relative',
                minHeight: '320px',
                backgroundColor: '#05080c',
                borderLeft: '1px solid var(--border-gold-dim)',
                overflow: 'hidden'
              }}>
                <img
                  src={spotlightEvent.image_url || eventHacksindriImg}
                  alt={spotlightEvent.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    imageRendering: 'auto'
                  }}
                />
                
                {/* Visual Gradient Shading */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to right, rgba(14, 23, 34, 0.85) 0%, rgba(14, 23, 34, 0.2) 50%, rgba(14, 23, 34, 0.7) 100%)',
                  pointerEvents: 'none'
                }} />

                {/* Highlights tags floating over artwork */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-end',
                  zIndex: 2
                }}>
                  {spotlightEvent.highlights && spotlightEvent.highlights.map((hl, hIdx) => (
                    <span
                      key={hIdx}
                      style={{
                        backgroundColor: 'rgba(8, 13, 19, 0.88)',
                        border: '1px solid var(--border-gold)',
                        color: 'var(--color-gold)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        boxShadow: '2px 2px 0px #000'
                      }}
                    >
                      ★ {hl}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================
            FILTERING, SEARCH & CONTROLS TOOLBAR
            ============================================================ */}
        <div style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-card)',
          padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
        }}>
          
          {/* Top Row: Search input + Timing switcher + View Mode toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="pixel-input"
                placeholder="Search events, hackathons, workshops, fests, or host clubs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '38px', width: '100%' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Timing Toggle (UPCOMING vs PAST) */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTiming('upcoming')}
                className={`filter-btn ${activeTiming === 'upcoming' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '9px 18px' }}
              >
                UPCOMING EVENTS
              </button>
              <button
                type="button"
                onClick={() => setActiveTiming('past')}
                className={`filter-btn ${activeTiming === 'past' ? 'active' : ''}`}
                style={{ fontSize: '0.82rem', padding: '9px 18px' }}
              >
                PAST ARCHIVE
              </button>
            </div>

            {/* Layout Mode Switcher (Grid vs Timeline) */}
            <div style={{ display: 'flex', border: '1px solid var(--border-card)', backgroundColor: '#070c10', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid Arcade View"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'grid' ? 'var(--color-gold)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--text-dark)' : 'var(--text-muted)',
                  fontWeight: 700
                }}
              >
                <Grid size={15} /> GRID
              </button>

              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                title="Roadmap Timeline View"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'timeline' ? 'var(--color-gold)' : 'transparent',
                  color: viewMode === 'timeline' ? 'var(--text-dark)' : 'var(--text-muted)',
                  fontWeight: 700
                }}
              >
                <List size={15} /> TIMELINE
              </button>
            </div>

          </div>

          {/* Bottom Row: Category Pill Chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['ALL', 'HACKATHON', 'CONTEST', 'TECH FEST', 'WORKSHOP', 'DRIVE'].map(cat => {
              const isSel = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.78rem',
                    letterSpacing: '0.04em',
                    backgroundColor: isSel ? 'var(--color-gold)' : '#070c10',
                    color: isSel ? 'var(--text-dark)' : 'var(--text-muted)',
                    border: isSel ? '1px solid #d4b54e' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{cat === 'ALL' ? 'ALL EVENTS' : cat}</span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: isSel ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.06)',
                    padding: '1px 6px',
                    borderRadius: '2px'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* ============================================================
            MAIN CONTENT AREA
            ============================================================ */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '12px' }}>
              INITIALIZING CAMPUS EVENTS CALENDAR...
            </div>
            <div style={{ fontSize: '0.84rem' }}>Fetching real-time verified schedules and hackathons</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="pixel-card" style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: '#0c141c' }}>
            <AlertCircle size={36} style={{ color: 'var(--color-coral)', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--text-cream)' }}>
              NO MATCHING EVENTS FOUND
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '420px', margin: '8px auto 20px auto' }}>
              No campus events match your selected filters. Try resetting the category filter or searching with a different term.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); setActiveTiming('upcoming'); }}
              className="btn-pixel-gold"
              style={{ padding: '10px 24px', fontSize: '0.84rem' }}
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          
          /* ============================================================
             1. GRID ARCADE VIEW (RESPONSIVE MULTI-COLUMN)
             ============================================================ */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {filteredEvents.map((ev, idx) => {
              const badgeTheme = getCategoryBadgeColor(ev.category);
              const dateObj = parseEventDate(ev.event_date);

              return (
                <div
                  key={ev.id}
                  className="event-grid-card pixel-corner-mark"
                  style={{
                    animation: 'slideCardUp 0.35s ease forwards',
                    animationDelay: `${idx * 0.05}s`
                  }}
                >
                  
                  {/* Top Image Banner */}
                  <div className="event-img-wrap">
                    <img
                      src={ev.image_url || eventHacksindriImg}
                      alt={ev.title}
                      loading="lazy"
                    />

                    {/* Floating Category Badge (Top Left) */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: badgeTheme.bg,
                      color: badgeTheme.text,
                      border: `1px solid ${badgeTheme.border}`,
                      padding: '4px 10px',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.74rem',
                      letterSpacing: '0.04em',
                      backdropFilter: 'blur(4px)',
                      zIndex: 3
                    }}>
                      {ev.category}
                    </div>

                    {/* Live Status Pill (Top Right) */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 3 }}>
                      <span className="event-live-pill" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                        <span className="event-live-dot" /> {ev.status === 'Registration Open' ? 'REGISTRATION OPEN' : 'VERIFIED'}
                      </span>
                    </div>

                    {/* Retro Arcade Calendar Stamp (Bottom Left) */}
                    <div className="event-calendar-stamp">
                      <div className="month">{dateObj.month}</div>
                      <div className="day">{dateObj.day}</div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '20px 20px 16px 20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      {/* Host Club Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--color-gold)' }}><ShieldCheck size={14} /></span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.club_name || 'BIT Sindri Club'}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h3 style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '1.18rem',
                        color: 'var(--text-cream)',
                        lineHeight: 1.3,
                        marginBottom: '10px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        <Link to={`/events/${ev.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {ev.title}
                        </Link>
                      </h3>

                      {/* Description excerpt */}
                      <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.55,
                        marginBottom: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {ev.description || 'Join this event to collaborate, build projects, and compete for certificates and prizes.'}
                      </p>

                      {/* Venue & Time details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-cream)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                          <Clock size={13} style={{ color: 'var(--color-cyan)', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ev.start_time ? `${ev.start_time} - ${ev.end_time || 'End'}` : 'Schedule in Details'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-cream)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                          <MapPin size={13} style={{ color: 'var(--color-coral)', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ev.venue || 'BIT Sindri Campus'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}>
                      <Link
                        to={`/events/${ev.id}`}
                        className="btn-pixel-gold"
                        style={{
                          flex: 1,
                          padding: '9px 14px',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        EXPLORE EVENT <ChevronRight size={15} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setQuickViewEvent(ev)}
                        title="Quick Preview Modal"
                        className="btn-pixel-outline"
                        style={{ padding: '8px 12px' }}
                      >
                        <Sparkles size={14} />
                      </button>

                      {ev.registration_url && (
                        <a
                          href={ev.registration_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Official Portal Registration"
                          className="btn-pixel-outline"
                          style={{ padding: '8px 12px' }}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        ) : (

          /* ============================================================
             2. TIMELINE ROADMAP VIEW (CHRONOLOGICAL CAMPUS TRACK)
             ============================================================ */
          <div className="timeline-track" style={{ marginTop: '16px' }}>
            {filteredEvents.map((ev, idx) => {
              const badgeTheme = getCategoryBadgeColor(ev.category);
              const dateObj = parseEventDate(ev.event_date);

              return (
                <div key={ev.id} style={{ position: 'relative', marginBottom: '32px' }}>
                  
                  {/* Glowing step node */}
                  <div className="timeline-step-node" />

                  {/* Timeline Event Card */}
                  <div className="pixel-card pixel-corner-mark" style={{
                    backgroundColor: '#0c141c',
                    padding: '24px',
                    marginLeft: '12px',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: '24px',
                    alignItems: 'center',
                    animation: 'slideCardUp 0.35s ease forwards',
                    animationDelay: `${idx * 0.05}s`
                  }}>
                    
                    {/* Left: Retro Calendar Stamp */}
                    <div style={{
                      width: '68px',
                      backgroundColor: '#060a0e',
                      border: '1px solid var(--border-gold)',
                      textAlign: 'center',
                      boxShadow: '2px 2px 0px #8a7329',
                      flexShrink: 0
                    }}>
                      <div style={{ backgroundColor: 'var(--color-gold)', color: 'var(--text-dark)', fontFamily: 'var(--font-pixel)', fontSize: '0.72rem', fontWeight: 800, padding: '3px 0' }}>
                        {dateObj.month}
                      </div>
                      <div style={{ color: 'var(--text-cream)', fontFamily: 'var(--font-pixel)', fontSize: '1.5rem', fontWeight: 800, padding: '4px 0' }}>
                        {dateObj.day}
                      </div>
                    </div>

                    {/* Middle: Details */}
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span style={{
                          backgroundColor: badgeTheme.bg,
                          color: badgeTheme.text,
                          border: `1px solid ${badgeTheme.border}`,
                          padding: '2px 8px',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '0.68rem'
                        }}>
                          {ev.category}
                        </span>

                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                          {ev.club_name}
                        </span>

                        <span className="event-live-pill" style={{ fontSize: '0.64rem', padding: '2px 6px' }}>
                          <span className="event-live-dot" /> {ev.status}
                        </span>
                      </div>

                      <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.3rem', color: 'var(--text-cream)', marginBottom: '8px' }}>
                        <Link to={`/events/${ev.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {ev.title}
                        </Link>
                      </h3>

                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '10px' }}>
                        {ev.description}
                      </p>

                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-cream)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} style={{ color: 'var(--color-cyan)' }} />
                          <span>{ev.start_time || 'Schedule'} - {ev.end_time || 'TBD'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={13} style={{ color: 'var(--color-coral)' }} />
                          <span>{ev.venue || 'BIT Sindri Campus'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
                      <Link to={`/events/${ev.id}`} className="btn-pixel-gold" style={{ padding: '10px 22px', fontSize: '0.82rem', textAlign: 'center' }}>
                        VIEW EVENT →
                      </Link>
                      <button
                        type="button"
                        onClick={() => setQuickViewEvent(ev)}
                        className="btn-pixel-outline"
                        style={{ padding: '8px 16px', fontSize: '0.78rem' }}
                      >
                        QUICK PREVIEW
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        )}

      </div>

      {/* ============================================================
          QUICK VIEW EVENT PREVIEW MODAL
          ============================================================ */}
      {quickViewEvent && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '24px'
        }}>
          <div className="pixel-card pixel-corner-mark" style={{
            maxWidth: '680px',
            width: '100%',
            backgroundColor: '#0c141c',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 30px rgba(243, 208, 99, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span className="badge-pixel gold" style={{ fontSize: '0.74rem', marginBottom: '8px', display: 'inline-block' }}>
                  {quickViewEvent.category} • {quickViewEvent.status}
                </span>
                <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.6rem', color: 'var(--color-gold)', lineHeight: 1.2 }}>
                  {quickViewEvent.title}
                </h2>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--text-cream)', marginTop: '4px' }}>
                  Organized by <strong style={{ color: 'var(--color-gold)' }}>{quickViewEvent.club_name}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQuickViewEvent(null)}
                className="btn-pixel-outline"
                style={{ padding: '6px 12px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Image Banner */}
            <div style={{ height: '200px', backgroundColor: '#070c10', border: '1px solid var(--border-card)', overflow: 'hidden', marginBottom: '20px' }}>
              <img
                src={quickViewEvent.image_url || eventHacksindriImg}
                alt={quickViewEvent.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Event Key Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '22px' }}>
              <div style={{ backgroundColor: '#070c10', border: '1px solid var(--border-subtle)', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>DATE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-gold)', fontWeight: 700, marginTop: '2px' }}>
                  {parseEventDate(quickViewEvent.event_date).full}
                </div>
              </div>

              <div style={{ backgroundColor: '#070c10', border: '1px solid var(--border-subtle)', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>TIME</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-cyan)', fontWeight: 700, marginTop: '2px' }}>
                  {quickViewEvent.start_time || '09:00 AM'} - {quickViewEvent.end_time || '09:00 PM'}
                </div>
              </div>

              <div style={{ backgroundColor: '#070c10', border: '1px solid var(--border-subtle)', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>VENUE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-coral)', fontWeight: 700, marginTop: '2px' }}>
                  {quickViewEvent.venue || 'BIT Sindri Campus'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.95rem', color: 'var(--color-gold)', marginBottom: '8px' }}>
                OVERVIEW & HIGHLIGHTS
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {quickViewEvent.description}
              </p>
            </div>

            {/* Modal CTAs */}
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => setQuickViewEvent(null)}
                className="btn-pixel-outline"
                style={{ padding: '10px 20px' }}
              >
                Close
              </button>

              <Link
                to={`/events/${quickViewEvent.id}`}
                className="btn-pixel-gold"
                style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                onClick={() => setQuickViewEvent(null)}
              >
                Full Event Details <ChevronRight size={16} />
              </Link>

              {quickViewEvent.registration_url && (
                <a
                  href={quickViewEvent.registration_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pixel-gold"
                  style={{ padding: '10px 22px', backgroundColor: 'var(--color-cyan)', borderColor: 'var(--color-cyan)', color: '#000', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  Official Portal <ExternalLink size={15} />
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
