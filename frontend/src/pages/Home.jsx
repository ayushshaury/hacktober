import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PixelIcon } from '../components/PixelIcon';
import { Play, Users, FileText, Calendar, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import heroCampusImg from '../assets/hero_campus_pixel.jpg';

export const Home = () => {
  const [clubs, setClubs] = useState([]);
  const [recruitingClubs, setRecruitingClubs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [totalClubsCount, setTotalClubsCount] = useState(26);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/clubs').then(r => r.json()).catch(() => ({ clubs: [] })),
      fetch('/api/events').then(r => r.json()).catch(() => ({ events: [] }))
    ]).then(([clubsData, eventsData]) => {
      const allClubs = clubsData.clubs || [];
      setClubs(allClubs);
      setTotalClubsCount(allClubs.length || 26);
      setRecruitingClubs(allClubs.filter(c => c.recruitment_open === 1));
      setUpcomingEvents(eventsData.events || []);
      setLoading(false);
    });
  }, []);

  const getCategoryClass = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('tech') || c.includes('code') || c.includes('robot')) return 'tech';
    if (c.includes('cultur') || c.includes('music') || c.includes('drama')) return 'cultural';
    if (c.includes('science') || c.includes('astro')) return 'science';
    if (c.includes('lit') || c.includes('debate')) return 'literary';
    if (c.includes('sport')) return 'sports';
    return 'others';
  };

  const getEventBadgeClass = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('hack')) return 'cultural'; // Coral
    if (c.includes('work')) return 'others';   // Mint
    return 'tech';                            // Blue
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* ============================================================
          HERO SECTION (EXACT REPRODUCTION OF REFERENCE PANEL 1)
          ============================================================ */}
      <section style={{
        position: 'relative',
        minHeight: '620px',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-gold-dim)',
        backgroundColor: '#090E13'
      }}>
        
        {/* Pixel Art Campus Background Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${heroCampusImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          imageRendering: 'pixelated',
          opacity: 0.88,
          zIndex: 1
        }} />

        {/* Gradient vignette on left and top to guarantee text legibility */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(9, 14, 19, 0.94) 0%, rgba(9, 14, 19, 0.82) 42%, rgba(9, 14, 19, 0.25) 75%, transparent 100%), linear-gradient(to top, rgba(9, 14, 19, 0.95) 0%, transparent 40%)',
          zIndex: 2
        }} />

        {/* Hero Content */}
        <div className="container" style={{
          position: 'relative',
          zIndex: 3,
          paddingTop: '80px',
          paddingBottom: '80px',
          minHeight: '580px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          
          <div style={{ maxWidth: '640px' }}>
            
            {/* Title: FIND YOUR in cream, PEOPLE in coral */}
            <h1 style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(3.2rem, 7vw, 5.2rem)',
              lineHeight: 1.05,
              letterSpacing: '0.04em',
              marginBottom: '20px',
              textShadow: '3px 3px 0px #000000, 0 0 20px rgba(0,0,0,0.8)'
            }}>
              <span style={{ color: 'var(--text-cream)', display: 'block' }}>
                FIND YOUR
              </span>
              <span style={{ color: 'var(--color-coral)', display: 'block' }}>
                PEOPLE
              </span>
            </h1>

            {/* Subtitles */}
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.88rem, 1.8vw, 1.05rem)',
              color: 'var(--text-cream)',
              fontWeight: 700,
              lineHeight: 1.6,
              letterSpacing: '0.04em',
              marginBottom: '32px',
              maxWidth: '520px',
              textShadow: '2px 2px 0px #000000'
            }}>
              EXPLORE CLUBS. JOIN COMMUNITIES.<br />
              BUILD. LEARN. CREATE. TOGETHER.
            </p>

            {/* CTA Button */}
            <Link
              to="/clubs"
              className="btn-pixel-gold"
              style={{
                fontSize: '1.05rem',
                padding: '13px 26px'
              }}
            >
              <Play size={16} fill="var(--text-dark)" /> EXPLORE CLUBS
            </Link>

          </div>

        </div>

        {/* Bottom Statistics Strip (Bordered arcade panel in reference) */}
        <div style={{
          position: 'relative',
          zIndex: 4,
          backgroundColor: 'rgba(10, 16, 23, 0.94)',
          borderTop: '1px solid var(--border-gold-dim)',
          backdropFilter: 'blur(10px)',
          padding: '18px 0'
        }}>
          <div className="container">
            <div
              className="pixel-corner-mark"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                border: '1px solid var(--border-gold-dim)',
                backgroundColor: '#0c141c',
                padding: '16px 24px',
                boxShadow: '0 0 16px rgba(0,0,0,0.6)'
              }}
            >
              
              {/* Stat 1: Verified Clubs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#090e13'
                }}>
                  <Users size={20} color="var(--color-cyan)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-cream)', lineHeight: 1 }}>
                    {totalClubsCount}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: '2px' }}>
                    VERIFIED CLUBS
                  </div>
                </div>
              </div>

              {/* Stat 2: Active Recruitments */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#090e13'
                }}>
                  <FileText size={20} color="var(--color-gold)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gold)', lineHeight: 1 }}>
                    {recruitingClubs.length}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: '2px' }}>
                    ACTIVE RECRUITMENTS
                  </div>
                </div>
              </div>

              {/* Stat 3: Flagship Events */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#090e13'
                }}>
                  <Calendar size={20} color="var(--color-mint)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-mint)', lineHeight: 1 }}>
                    {upcomingEvents.length > 0 ? `${upcomingEvents.length}+` : '5+'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: '2px' }}>
                    FLAGSHIP EVENTS
                  </div>
                </div>
              </div>

              {/* Stat 4: Institute Verified */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#090e13'
                }}>
                  <ShieldCheck size={20} color="var(--color-coral)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-cream)', lineHeight: 1 }}>
                    100%
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: '2px' }}>
                    INSTITUTE VERIFIED
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* ============================================================
          FEATURED CLUBS GRID SECTION (MATCHES 4-COLUMN CARDS)
          ============================================================ */}
      <section className="container" style={{ marginTop: '56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.8rem', color: 'var(--text-cream)', letterSpacing: '0.04em' }}>
              CAMPUS CLUBS
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              EXPLORE ALL VERIFIED STUDENT SOCIETIES & ORGANISATIONS
            </p>
          </div>
          <Link to="/clubs" className="btn-pixel-outline" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
            VIEW ALL CLUBS →
          </Link>
        </div>

        {/* 4-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {clubs.slice(0, 8).map(club => {
            const catClass = getCategoryClass(club.category);
            return (
              <Link
                key={club.id}
                to={`/clubs/${club.slug}`}
                className="pixel-card"
                style={{ textDecoration: 'none' }}
              >
                {/* Pixel Art Illustration Box with Corner Mark */}
                <div className="pixel-card-icon-frame pixel-corner-mark">
                  <PixelIcon name={club.slug || club.category} size={54} />
                  {club.recruitment_open === 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'var(--color-gold)',
                      color: 'var(--text-dark)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      letterSpacing: '0.04em',
                      boxShadow: '1px 1px 0px #8a7329'
                    }}>
                      OPEN
                    </div>
                  )}
                </div>

                {/* Club Name with 2-line clamp */}
                <h3 style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '1.05rem',
                  color: 'var(--text-cream)',
                  marginBottom: '8px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2.6rem',
                  lineHeight: 1.25
                }}>
                  {club.name}
                </h3>

                {/* Category Tag */}
                <div style={{ marginBottom: '14px' }}>
                  <span className={`badge-pixel ${catClass}`}>
                    {club.category?.split(' ')[0] || 'TECH'}
                  </span>
                </div>

                {/* Card Footer: Members count & arrow */}
                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>{club.member_count ? `${club.member_count} members` : '85 members'}</span>
                  <span style={{ color: 'var(--color-gold)', fontSize: '1rem', fontWeight: 700 }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          AI MATCH FINDER CALLOUT BANNER (PANEL 5 PREVIEW)
          ============================================================ */}
      <section className="container" style={{ marginTop: '64px' }}>
        <div style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-gold)',
          padding: '36px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: '0 0 20px rgba(194, 166, 73, 0.12)'
        }}>
          <div style={{ maxWidth: '620px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--color-gold)',
              fontWeight: 700,
              marginBottom: '10px'
            }}>
              <Sparkles size={14} /> AI RECOMMENDATION SYSTEM
            </div>
            <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '2rem', color: 'var(--text-cream)', marginBottom: '10px' }}>
              FIND YOUR CLUB
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Answer a few questions regarding your skills and passion, and our intelligent algorithm will match you with the ideal BIT Sindri clubs.
            </p>
          </div>

          <Link to="/recommendations" className="btn-pixel-gold" style={{ padding: '12px 24px' }}>
            GET STARTED →
          </Link>
        </div>
      </section>

    </div>
  );
};
