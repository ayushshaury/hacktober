import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ClubCard } from '../components/ClubCard';
import { getCategoryDisplayTag } from '../data/clubs';

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
            {filteredClubs.map(club => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
