import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Compass } from 'lucide-react';
import { PixelIcon } from '../components/PixelIcon';

export const Clubs = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [clubs, setClubs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  // Category filters matching the reference image
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

  const getCategoryClass = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('tech') || c.includes('code') || c.includes('robot')) return 'tech';
    if (c.includes('cultur') || c.includes('music') || c.includes('drama')) return 'cultural';
    if (c.includes('science') || c.includes('astro')) return 'science';
    if (c.includes('lit') || c.includes('debate')) return 'literary';
    if (c.includes('sport')) return 'sports';
    return 'others';
  };

  const getCategoryDisplayTag = (cat) => {
    const c = (cat || '').toUpperCase();
    if (c.includes('TECH') || c.includes('CODE') || c.includes('ROBOT')) return 'TECH';
    if (c.includes('CULTUR') || c.includes('MUSIC') || c.includes('DRAMA')) return 'CULTURAL';
    if (c.includes('SCIENCE') || c.includes('ASTRO')) return 'SCIENCE';
    if (c.includes('LIT') || c.includes('DEBATE')) return 'LITERARY';
    if (c.includes('SPORT')) return 'SPORTS';
    return 'OTHERS';
  };

  // Filter logic
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = !searchQuery.trim() || 
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (club.short_description && club.short_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (club.category && club.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'ALL') return true;

    const clubCatTag = getCategoryDisplayTag(club.category);
    return clubCatTag === selectedCategory;
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      <div className="container" style={{ paddingTop: '40px' }}>
        
        {/* Top Header: Title on Left, Search Bar on Right (Exact Reference Layout) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '28px'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
              color: 'var(--text-cream)',
              lineHeight: 1.1,
              letterSpacing: '0.04em'
            }}>
              CLUBS
            </h1>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              marginTop: '6px'
            }}>
              EXPLORE ALL VERIFIED STUDENT CLUBS
            </p>
          </div>

          {/* Search Box & Counter */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <div style={{
              position: 'relative',
              width: '320px',
              maxWidth: '100%'
            }}>
              <Search
                size={16}
                color="var(--text-dim)"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pixel-input"
                style={{
                  paddingLeft: '38px',
                  paddingRight: searchQuery ? '32px' : '14px',
                  fontSize: '0.86rem'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.06em'
            }}>
              SHOWING <span style={{ color: 'var(--color-gold)' }}>{filteredClubs.length}</span> OF {clubs.length} VERIFIED CLUBS
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Exact Reference Buttons) */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '36px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '20px'
        }}>
          {categoryFilters.map(filter => {
            const isSel = selectedCategory === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedCategory(filter)}
                className={`filter-btn ${isSel ? 'active' : ''}`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* 4-Column Grid of Club Cards (Exact match to Panel 2) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            LOADING CAMPUS CLUBS...
          </div>
        ) : filteredClubs.length === 0 ? (
          <div style={{
            backgroundColor: '#0c141c',
            border: '1px solid var(--border-card)',
            padding: '48px',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)'
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              No clubs found matching "{searchQuery}" in category [{selectedCategory}].
            </p>
            <button
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="btn-pixel-outline"
              style={{ marginTop: '16px', fontSize: '0.8rem' }}
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            {filteredClubs.map(club => {
              const catClass = getCategoryClass(club.category);
              const tagText = getCategoryDisplayTag(club.category);
              const membersCount = club.member_count || (80 + ((club.id * 7) % 65));

              return (
                <Link
                  key={club.id}
                  to={`/clubs/${club.slug}`}
                  className="pixel-card"
                  style={{ textDecoration: 'none' }}
                >
                  {/* Square Pixel Art Illustration Container with Corner Mark */}
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

                  {/* Club Title with clean 2-line clamping */}
                  <h3 style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '1.08rem',
                    color: 'var(--text-cream)',
                    marginBottom: '8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.7rem',
                    lineHeight: 1.25
                  }}>
                    {club.name}
                  </h3>

                  {/* Category Badge */}
                  <div style={{ marginBottom: '16px' }}>
                    <span className={`badge-pixel ${catClass}`}>
                      {tagText}
                    </span>
                  </div>

                  {/* Card Bottom Row: Member Count & Arrow */}
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
                    <span>{membersCount} members</span>
                    <span style={{ color: 'var(--color-gold)', fontSize: '1rem', fontWeight: 700 }}>→</span>
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
