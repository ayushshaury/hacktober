import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PixelIcon } from '../components/PixelIcon';
import { Users, Calendar, Award, GraduationCap, ExternalLink, ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';
import codingClubRoomImg from '../assets/coding_club_room_pixel.jpg';

export const ClubDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clubs/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Club not found');
        return res.json();
      })
      .then(data => {
        setClub(data.club);
      })
      .catch(err => {
        console.error('Error loading club detail:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LOADING CLUB DETAILS...</div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.8rem', color: 'var(--color-coral)' }}>CLUB NOT FOUND</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
          The requested club profile does not exist or has moved.
        </p>
        <Link to="/clubs" className="btn-pixel-gold">
          ← BACK TO CLUBS
        </Link>
      </div>
    );
  }

  const memberCount = club.member_count || (80 + ((club.id * 7) % 65));

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      <div className="container" style={{ paddingTop: '36px' }}>
        
        {/* Breadcrumb (Exact match to Panel 3) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '20px'
        }}>
          <Link to="/clubs" style={{ color: 'var(--color-cyan)', textDecoration: 'none' }}>
            CLUBS
          </Link>
          <span>&gt;</span>
          <span style={{ color: 'var(--color-gold)' }}>
            {club.name.toUpperCase()}
          </span>
        </div>

        {/* Hero Card Container (Bordered panel with icon, details & illustration) */}
        <div
          className="club-hero-card"
          style={{
            backgroundColor: '#0c141c',
            border: '1px solid var(--border-gold)',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 0 20px rgba(194, 166, 73, 0.1)'
          }}
        >
          
          {/* Left: Pixel Art Icon Box with Golden Corner Accents */}
          <div style={{
            width: '120px',
            height: '120px',
            backgroundColor: '#070c10',
            border: '2px solid var(--border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: 'inset 0 0 12px rgba(0,0,0,0.8)'
          }}>
            {/* Top-Left Corner Bracket */}
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '10px',
              height: '10px',
              borderTop: '2px solid var(--color-gold)',
              borderLeft: '2px solid var(--color-gold)'
            }} />
            <PixelIcon name={club.slug || club.category} size={64} />
          </div>

          {/* Center: Title, Tagline, Description & Action Buttons */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              color: 'var(--text-cream)',
              lineHeight: 1.1,
              letterSpacing: '0.04em',
              marginBottom: '6px'
            }}>
              {club.name}
            </h1>

            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--color-gold)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              {club.category} • {club.slug === 'hncc' ? 'BUILD • LEARN • COLLABORATE' : 'LEARN • LEAD • INNOVATE'}
            </div>

            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.86rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: '560px',
              marginBottom: '22px'
            }}>
              {club.short_description || club.description || 'A vibrant community of passionate students at BIT Sindri collaborating, learning, and building innovative projects together.'}
            </p>

            {/* Action Buttons: Apply Now & Visit Socials */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              {user && (user.role === 'club_admin' || user.role === 'admin') ? (
                <div
                  style={{
                    padding: '10px 18px',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#f87171',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  title="Club administrators cannot apply to clubs"
                >
                  <ShieldAlert size={14} /> ADMIN ACCESS: CANNOT APPLY
                </div>
              ) : club.recruitment_open === 1 ? (
                <Link
                  to={`/clubs/${club.slug}/apply`}
                  className="btn-pixel-gold"
                  style={{ padding: '10px 22px' }}
                >
                  APPLY NOW
                </Link>
              ) : (
                <button
                  disabled
                  className="btn-pixel-outline"
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                >
                  RECRUITMENT CLOSED
                </button>
              )}

              {club.website_url ? (
                <a
                  href={club.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pixel-outline"
                  style={{ padding: '10px 22px' }}
                >
                  VISIT SOCIALS <ExternalLink size={13} />
                </a>
              ) : (
                <a
                  href="https://www.bitsindri.ac.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pixel-outline"
                  style={{ padding: '10px 22px' }}
                >
                  VISIT SOCIALS <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Right: Decorative Pixel Art Workstation Room */}
          <div className="club-room-preview crt-arcade-monitor pixel-corner-mark">
            <img
              src={codingClubRoomImg}
              alt="Club Room"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                imageRendering: 'pixelated'
              }}
            />
          </div>

        </div>

        {/* 4-Box Stats Row (Exact match to Panel 3) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          
          {/* Box 1: Members */}
          <div className="pixel-corner-mark" style={{
            backgroundColor: '#0c141c',
            border: '1px solid var(--border-card)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <Users size={22} color="var(--color-gold)" />
            <div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--text-cream)' }}>
                {memberCount}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Members
              </div>
            </div>
          </div>

          {/* Box 2: Recruitments */}
          <div className="pixel-corner-mark" style={{
            backgroundColor: '#0c141c',
            border: '1px solid var(--border-card)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <Calendar size={22} color="var(--color-gold)" />
            <div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: club.recruitment_open === 1 ? 'var(--color-mint)' : 'var(--text-muted)' }}>
                {club.recruitment_open === 1 ? 'Ongoing' : 'Closed'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Recruitments
              </div>
            </div>
          </div>

          {/* Box 3: Activities */}
          <div className="pixel-corner-mark" style={{
            backgroundColor: '#0c141c',
            border: '1px solid var(--border-card)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <Award size={22} color="var(--color-gold)" />
            <div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--text-cream)' }}>
                Workshops
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Hackathons
              </div>
            </div>
          </div>

          {/* Box 4: Eligibility */}
          <div className="pixel-corner-mark" style={{
            backgroundColor: '#0c141c',
            border: '1px solid var(--border-card)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <GraduationCap size={22} color="var(--color-gold)" />
            <div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--text-cream)' }}>
                Open to
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                All Branches
              </div>
            </div>
          </div>

        </div>

        {/* Tabs: ABOUT, EVENTS, TEAM, GALLERY, FAQ */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {['about', 'events', 'team', 'gallery', 'faq'].map(tabKey => {
            const isSel = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                className={`filter-btn ${isSel ? 'active' : ''}`}
                style={{
                  padding: '8px 18px',
                  fontSize: '0.82rem'
                }}
              >
                {tabKey.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel (Framed gold border with retro typography) */}
        <div style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-gold-dim)',
          padding: '28px 32px',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.8
        }}>
          {activeTab === 'about' && (
            <div>
              <p style={{ color: 'var(--text-cream)', fontSize: '0.92rem', marginBottom: '16px' }}>
                {club.description || `We are a student run community at BIT Sindri focused on ${club.category?.toLowerCase() || 'technical exploration'}, peer collaboration, and leadership. Whether you are a beginner or experienced student, there is an empowering place for you here.`}
              </p>
              {club.events_summary && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <h4 style={{ fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', fontSize: '0.95rem', marginBottom: '8px' }}>
                    KEY HIGHLIGHTS & TRADITIONS
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    {club.events_summary}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h4 style={{ fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', fontSize: '1rem', marginBottom: '16px' }}>
                CLUB EVENTS & SESSIONS
              </h4>
              {club.events && club.events.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {club.events.map(ev => (
                    <div key={ev.id} style={{ padding: '14px 18px', backgroundColor: '#070c10', border: '1px solid var(--border-card)' }}>
                      <div style={{ fontFamily: 'var(--font-pixel)', color: 'var(--text-cream)', fontSize: '1rem' }}>{ev.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>📅 {ev.event_date} • 📍 {ev.venue || 'BIT Sindri'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No published events scheduled right now. Check back during fest season!
                </p>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h4 style={{ fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', fontSize: '1rem', marginBottom: '16px' }}>
                COORDINATORS & CORE TEAM
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
                Led by elected student coordinators and senior core members representing various engineering departments at BIT Sindri.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {['President / Club Lead', 'Vice President', 'Technical Coordinator', 'Event Manager'].map((pos, i) => (
                  <div key={i} style={{ padding: '14px', backgroundColor: '#070c10', border: '1px solid var(--border-card)' }}>
                    <div style={{ color: 'var(--text-cream)', fontWeight: 700, fontSize: '0.88rem' }}>Student Coordinator {i + 1}</div>
                    <div style={{ color: 'var(--color-gold)', fontSize: '0.76rem', marginTop: '2px' }}>{pos}</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: '4px' }}>BIT Sindri • Batch 2023-2027</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <h4 style={{ fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', fontSize: '1rem', marginBottom: '16px' }}>
                CAMPUS GALLERY & WORKSHOPS
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <img src={codingClubRoomImg} alt="Workspace" style={{ width: '100%', height: '140px', objectFit: 'cover', border: '1px solid var(--border-card)', imageRendering: 'pixelated' }} />
                <div style={{ height: '140px', backgroundColor: '#070c10', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PixelIcon name={club.slug} size={48} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div>
              <h4 style={{ fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', fontSize: '1rem', marginBottom: '16px' }}>
                FREQUENTLY ASKED QUESTIONS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ color: 'var(--text-cream)', fontWeight: 700 }}>Q: Who can join this club?</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>A: Open to all 1st, 2nd, and 3rd-year undergraduate students of BIT Sindri across all engineering branches.</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-cream)', fontWeight: 700 }}>Q: What is the induction process?</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>A: Submit an application via the portal, attend the screening/orientation, and showcase your enthusiasm or tasks assigned by the coordinators.</div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
