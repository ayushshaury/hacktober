import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Sparkles, ShieldCheck, Users, Flame, 
  ArrowUpRight, X, Filter, ChevronDown, CheckCircle2 
} from 'lucide-react';
import { ClubCard } from '../components/ClubCard';
import { getCategoryDisplayTag } from '../data/clubs';
import hnccLogo from '../assets/hncc_logo.png';

export const Clubs = () => {
  const { user } = useAuth();
  const isClubAdmin = user && (user.role === 'club_admin' || user.role === 'admin');
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [clubs, setClubs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'alpha' | 'code'
  const [loading, setLoading] = useState(true);

  const categoryFilters = ['ALL', 'TECH', 'CULTURAL', 'SPORTS', 'LITERARY', 'DESIGN', 'SOCIAL', 'OTHERS'];

  useEffect(() => {
    setLoading(true);
    fetch('/api/clubs')
      .then(res => res.json())
      .then(data => {
        setClubs(data.clubs || []);
      })
      .catch(err => console.error('Error fetching clubs:', err))
      .finally(() => setLoading(false));
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: clubs.length };
    clubs.forEach(c => {
      const tag = getCategoryDisplayTag(c.category);
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  }, [clubs]);

  // Compute recruiting count
  const recruitingCount = useMemo(() => {
    return clubs.filter(c => c.recruitment_open === 1).length;
  }, [clubs]);

  // Spotlight Featured Club (HnCC or first recruiting club)
  const spotlightClub = useMemo(() => {
    return clubs.find(c => c.slug === 'hncc') || clubs.find(c => c.recruitment_open === 1) || clubs[0];
  }, [clubs]);

  // Filter and sort logic
  const processedClubs = useMemo(() => {
    let result = clubs.filter(club => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = club.name.toLowerCase().includes(q);
        const matchesDesc = club.short_description?.toLowerCase().includes(q) || club.description?.toLowerCase().includes(q);
        const matchesCategory = club.category?.toLowerCase().includes(q);
        const matchesCode = club.club_code?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesCode) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL') {
        const tag = getCategoryDisplayTag(club.category);
        if (tag !== selectedCategory) return false;
      }

      // 3. Only Recruiting Filter
      if (onlyRecruiting && club.recruitment_open !== 1) {
        return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'alpha') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'code') {
        return (a.club_code || '').localeCompare(b.club_code || '');
      }
      // 'popular'
      const countA = a.member_count || (80 + ((a.id * 7) % 65));
      const countB = b.member_count || (80 + ((b.id * 7) % 65));
      return countB - countA;
    });

    return result;
  }, [clubs, searchQuery, selectedCategory, onlyRecruiting, sortBy]);

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
            HEADER & CAMPUS METRICS
            ============================================================ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge-pixel gold" style={{ fontSize: '0.74rem' }}>
                <Sparkles size={12} style={{ marginRight: '5px' }} /> BIT SINDRI CAMPUS DIRECTORY
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {clubs.length} VERIFIED STUDENT BODIES
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
              CAMPUS CLUBS
            </h1>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: 'var(--text-cream)',
              letterSpacing: '0.04em',
              marginTop: '6px',
              maxWidth: '650px'
            }}>
              Explore technical societies, cultural academies, sports teams, literary forums, and innovation councils at BIT Sindri. Apply for inductions or view official rosters.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="pixel-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0c141c' }}>
              <Flame size={20} style={{ color: 'var(--color-coral)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>RECRUITING NOW</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.15rem', color: 'var(--color-mint)' }}>
                  {recruitingCount} CLUBS
                </div>
              </div>
            </div>

            <div className="pixel-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0c141c' }}>
              <Users size={20} style={{ color: 'var(--color-gold)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>STUDENT MEMBERS</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.15rem', color: 'var(--color-gold)' }}>
                  2,500+
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            SPOTLIGHT FEATURED CLUB HERO BANNER
            ============================================================ */}
        {spotlightClub && (
          <div className="event-hero-card pixel-corner-mark" style={{ marginBottom: '36px', padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '280px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#070b10',
                  border: '2px solid var(--border-gold)',
                  boxShadow: '3px 3px 0px #8a7329',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img
                    src={spotlightClub.logo_url || hnccLogo}
                    alt={spotlightClub.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span className="badge-pixel gold" style={{ fontSize: '0.72rem' }}>
                      ★ SPOTLIGHT SOCIETY
                    </span>
                    <span className="event-live-pill" style={{ fontSize: '0.68rem' }}>
                      <span className="event-live-dot" /> INDUCTIONS OPEN
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-gold)' }}>
                      CODE: {spotlightClub.club_code || 'BIT-001'}
                    </span>
                  </div>

                  <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.45rem', color: 'var(--text-cream)', lineHeight: 1.2 }}>
                    {spotlightClub.name}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '640px' }}>
                    {spotlightClub.short_description || 'Premier official club of BIT Sindri focused on technical innovation, coding, hackathons, and national competitions.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link
                  to={`/clubs/${spotlightClub.slug}`}
                  className="btn-pixel-gold"
                  style={{ padding: '10px 22px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  VISIT WORKSPACE <ArrowUpRight size={15} />
                </Link>
                {spotlightClub.recruitment_open === 1 && !isClubAdmin && (
                  <Link
                    to={`/clubs/${spotlightClub.slug}/apply`}
                    className="btn-pixel-outline"
                    style={{ padding: '9px 18px', fontSize: '0.82rem', color: 'var(--color-mint)', borderColor: 'rgba(74, 222, 128, 0.4)' }}
                  >
                    APPLY FOR INDUCTION
                  </Link>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ============================================================
            FILTERING, SEARCH & TOOLBAR CONTROLS
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
          
          {/* Top Controls Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="pixel-input"
                placeholder="Search clubs by name, code (BIT-001), keywords..."
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

            {/* Quick Toggle: Only Recruiting Clubs */}
            <button
              type="button"
              onClick={() => setOnlyRecruiting(!onlyRecruiting)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: onlyRecruiting ? 'rgba(74, 222, 128, 0.18)' : '#070c10',
                color: onlyRecruiting ? 'var(--color-mint)' : 'var(--text-muted)',
                border: onlyRecruiting ? '1px solid var(--color-mint)' : '1px solid var(--border-card)',
                transition: 'all 0.15s ease'
              }}
            >
              <span className={onlyRecruiting ? "event-live-dot" : ""} style={!onlyRecruiting ? { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block' } : {}} />
              RECRUITING NOW ONLY ({recruitingCount})
            </button>

            {/* Sorting Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>SORT:</span>
              <select
                className="pixel-input"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ width: 'auto', padding: '8px 12px', fontSize: '0.8rem' }}
              >
                <option value="popular">Most Members</option>
                <option value="alpha">Name (A - Z)</option>
                <option value="code">Club Code</option>
              </select>
            </div>

          </div>

          {/* Bottom Row: Category Pill Chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categoryFilters.map(filter => {
              const isSel = selectedCategory === filter;
              const count = categoryCounts[filter] || 0;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedCategory(filter)}
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
                  <span>{filter === 'ALL' ? 'ALL CLUBS' : filter}</span>
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
            CLUBS GRID
            ============================================================ */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '12px' }}>
              SYNCHRONIZING VERIFIED CAMPUS SOCIETIES...
            </div>
            <div style={{ fontSize: '0.84rem' }}>Fetching live rosters and induction forms</div>
          </div>
        ) : processedClubs.length === 0 ? (
          <div className="pixel-card" style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: '#0c141c' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--text-cream)' }}>
              NO CLUBS FOUND
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '420px', margin: '8px auto 20px auto' }}>
              No campus societies match your search "{searchQuery}" in category [{selectedCategory}].
            </p>
            <button
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); setOnlyRecruiting(false); }}
              className="btn-pixel-gold"
              style={{ padding: '10px 24px', fontSize: '0.84rem' }}
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {processedClubs.map((club, idx) => (
              <ClubCard key={club.id} club={club} index={idx} />
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
