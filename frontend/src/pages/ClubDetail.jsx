import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PixelIcon } from '../components/PixelIcon';
import { 
  Users, Calendar, Award, GraduationCap, ExternalLink, 
  ArrowLeft, CheckCircle, ShieldAlert, ChevronDown, ChevronUp, HelpCircle 
} from 'lucide-react';
import codingClubRoomImg from '../assets/coding_club_room_pixel.jpg';

const HNCC_FAQS = [
  {
    q: "What is HnCC?",
    a: "HnCC (Hackathon and Coding Club) is the Official Coding Club of BIT Sindri, Dhanbad. It operates as an open-source student organization where members learn, collaborate, and build innovative solutions and national-level hackathons like Hackatron.",
    tag: "ABOUT"
  },
  {
    q: "I am not from a CSE/IT Branch. Is HnCC the right choice for me?",
    a: "Absolutely! There is NO BRANCH RESTRICTION. Over 60% of HnCC members are from non-CS/IT branches (ECE, EE, ME, Civil, Mining, Chemical, Metallurgy, Production). If you are enthusiastic about technology and learning, you should definitely apply!",
    tag: "ELIGIBILITY"
  },
  {
    q: "I don't know anything about coding. What should I do?",
    a: "Just start with any Object-Oriented Programming Language (C++, Java, or Python). Focus on fundamental logic, attend our beginner bootcamp sessions, and practice consistently. Knowledge is free on the internet—what matters most is your curiosity and dedication.",
    tag: "BEGINNERS"
  },
  {
    q: "What qualities and technical domains are active at HnCC?",
    a: "Active domains include Competitive Programming, Web Development, Android App Development, Machine Learning & AI, UI/UX Design, Game Development, and Free & Open Source Software (FOSS). We seek students with problem-solving persistence and a 'hacker mentality' to build real solutions.",
    tag: "DOMAINS"
  },
  {
    q: "What tasks can I do to land an interview or showcase my skills?",
    a: "You can showcase beginner projects (a web app, Android app, or game), earn stars on HackerRank, practice DSA algorithms, create UI designs in Figma/Illustrator, or demonstrate hands-on Linux/Git skills to coordinators.",
    tag: "PROJECTS"
  },
  {
    q: "I don’t have a high-end laptop right now. Am I eligible to join?",
    a: "Yes! You don't need a high-end laptop to showcase your interest and learn the basics using online resources or college labs. While a laptop helps as you advance in development, not having an expensive setup right now will never stop you from joining.",
    tag: "HARDWARE"
  },
  {
    q: "When and how do the inductions take place?",
    a: "Induction cycles run round-the-year with major drives during semester orientations and fest seasons. Submit your application through this portal to begin the screening and orientation rounds.",
    tag: "INDUCTION"
  }
];

const GENERAL_FAQS = [
  {
    q: "Who can join this club?",
    a: "Open to all 1st, 2nd, and 3rd-year undergraduate students of BIT Sindri across all engineering branches.",
    tag: "ELIGIBILITY"
  },
  {
    q: "What is the induction process?",
    a: "Submit an application via the portal, attend the screening/orientation, and showcase your enthusiasm or tasks assigned by the coordinators.",
    tag: "INDUCTION"
  },
  {
    q: "Can I join multiple clubs at BIT Sindri?",
    a: "Yes, students can participate in multiple clubs as long as they can balance their commitments, projects, and academic schedule effectively.",
    tag: "MEMBERSHIP"
  },
  {
    q: "How does club membership benefit my college life and career?",
    a: "Club membership provides practical peer collaboration, mentorship from senior batches, hands-on project experience, and networking with alumni.",
    tag: "BENEFITS"
  }
];

export const ClubDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [openFaq, setOpenFaq] = useState(0);
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

          {activeTab === 'faq' && (() => {
            const faqsToRender = club?.slug === 'hncc' ? HNCC_FAQS : GENERAL_FAQS;
            return (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <h4 style={{
                    fontFamily: 'var(--font-pixel)',
                    color: 'var(--color-gold)',
                    fontSize: '1.05rem',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <HelpCircle size={18} /> FREQUENTLY ASKED QUESTIONS
                  </h4>
                  {club?.slug === 'hncc' && (
                    <a
                      href="https://www.hnccbits.com/faqs"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: '0.74rem',
                        color: 'var(--color-cyan)',
                        fontFamily: 'var(--font-mono)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        backgroundColor: 'rgba(56, 189, 248, 0.08)'
                      }}
                    >
                      OFFICIAL HNCC FAQS <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {faqsToRender.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#070c10',
                          border: isOpen ? '1px solid var(--border-gold)' : '1px solid var(--border-card)',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '14px 18px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            {faq.tag && (
                              <span style={{
                                fontSize: '0.68rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--color-gold)',
                                backgroundColor: 'rgba(243, 208, 99, 0.1)',
                                border: '1px solid rgba(243, 208, 99, 0.3)',
                                padding: '2px 8px',
                                letterSpacing: '0.04em'
                              }}>
                                {faq.tag}
                              </span>
                            )}
                            <span style={{
                              color: 'var(--text-cream)',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              fontFamily: 'var(--font-mono)'
                            }}>
                              Q: {faq.q}
                            </span>
                          </div>
                          <span style={{ color: 'var(--color-gold)', flexShrink: 0 }}>
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </button>

                        {isOpen && (
                          <div style={{
                            padding: '0 18px 16px 18px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            marginTop: '2px',
                            paddingTop: '12px'
                          }}>
                            <div style={{
                              color: 'var(--text-muted)',
                              fontSize: '0.86rem',
                              lineHeight: 1.7,
                              fontFamily: 'var(--font-mono)'
                            }}>
                              <span style={{ color: 'var(--color-mint)', fontWeight: 700 }}>A: </span>
                              {faq.a}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

      </div>

    </div>
  );
};
