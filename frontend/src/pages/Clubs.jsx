import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Compass, Sparkles, X, UserPlus, ArrowRight, ExternalLink, Globe 
} from 'lucide-react';

export const Clubs = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [clubs, setClubs] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch Categories
  useEffect(() => {
    fetch('/api/clubs/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Fetch Clubs based on filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (selectedCategory && selectedCategory !== 'All') {
      params.append('category', selectedCategory);
    }
    if (searchQuery.trim() !== '') {
      params.append('search', searchQuery.trim());
    }
    if (onlyRecruiting) {
      params.append('recruitment_open', '1');
    }

    fetch(`/api/clubs?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setClubs(data.clubs || []);
      })
      .catch(err => console.error('Error fetching clubs:', err))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, onlyRecruiting]);

  const getCategoryBadgeClass = (category) => {
    if (!category) return 'badge-technical';
    const catLower = category.toLowerCase();
    if (catLower.includes('cultural') || catLower.includes('arts')) return 'badge-cultural';
    if (catLower.includes('social') || catLower.includes('community')) return 'badge-social';
    if (catLower.includes('sports')) return 'badge-sports';
    if (catLower.includes('media') || catLower.includes('literary')) return 'badge-media';
    if (catLower.includes('entrepreneurship') || catLower.includes('start-up') || catLower.includes('innovation') || catLower.includes('iic')) return 'badge-startup';
    return 'badge-technical';
  };

  const getLogoSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }} className="animate-fade-in">
      
      {/* Header Banner (Apple Style Subdued Canvas) */}
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
            <Compass size={14} /> 26 Verified Campus Societies & Forums
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', letterSpacing: '-0.025em' }}>
            BIT Sindri <span className="gradient-text">Club Directory</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Explore technical, engineering branch, socio-cultural, media, sports, and leadership organizations.
          </p>

        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '36px' }}>
        
        {/* Apple Style Filter Dock */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
          
          {/* Top Row: Search and Recruiting Toggle */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            
            <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '520px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '44px', borderRadius: '999px' }}
                placeholder="Search by club name, keywords (e.g. AI, robotics, drama)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Toggle Switch (Apple iOS style) */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
              <div 
                onClick={() => setOnlyRecruiting(!onlyRecruiting)}
                style={{
                  width: '46px',
                  height: '26px',
                  borderRadius: '999px',
                  backgroundColor: onlyRecruiting ? '#34C759' : '#E2E8F0',
                  position: 'relative',
                  transition: 'background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: '2px',
                  left: onlyRecruiting ? '22px' : '2px',
                  transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
              Recruitment Open Only
            </label>

          </div>

          {/* Categories Horizontal Pill Scroll */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => {
              const isSel = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '999px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    border: isSel ? '1px solid transparent' : '1px solid rgba(226, 232, 240, 0.9)',
                    backgroundColor: isSel ? '#0071E3' : '#FFFFFF',
                    color: isSel ? '#FFFFFF' : 'var(--text-body)',
                    boxShadow: isSel ? '0 4px 12px rgba(0, 113, 227, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="apple-box-hover"
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* Clubs Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div className="spin" style={{ width: '28px', height: '28px', border: '3px solid #0071E3', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px' }} />
            Loading BIT Sindri clubs directory...
          </div>
        ) : clubs.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Compass size={44} color="#94A3B8" />
            <h3 style={{ marginTop: '16px', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>No clubs matched your search criteria</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>Try clearing category filters or adjusting search terms.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '26px' }}>
            {clubs.map(club => (
              <div 
                key={club.id} 
                className="glass-panel glass-panel-hover" 
                style={{ display: 'flex', flexDirection: 'column', padding: '26px' }}
              >
                
                {/* Header with Picture/Logo */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {club.logo_url ? (
                      <img 
                        src={getLogoSrc(club.logo_url)}
                        alt={club.name}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '14px',
                          objectFit: 'cover',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                          border: '1px solid rgba(226, 232, 240, 0.8)'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '14px', 
                      backgroundColor: '#EBF5FF', 
                      border: '1px solid #BAE0FD', 
                      display: club.logo_url ? 'none' : 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 800, 
                      color: '#0066CC', 
                      fontSize: '1.15rem',
                      boxShadow: '0 4px 10px rgba(0, 113, 227, 0.08)'
                    }}>
                      {club.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.25 }}>
                        {club.name}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '2px', fontWeight: 500 }}>
                        Code: {club.club_code}
                      </div>
                    </div>
                  </div>

                  {club.recruitment_open === 1 && (
                    <span className="badge" style={{ backgroundColor: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6', whiteSpace: 'nowrap' }}>
                      Recruiting
                    </span>
                  )}
                </div>

                {/* Category Badge */}
                <div style={{ marginBottom: '12px' }}>
                  <span className={`badge ${getCategoryBadgeClass(club.category)}`}>
                    {club.category}
                  </span>
                </div>

                {/* Short Description */}
                <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                  {club.short_description || club.description}
                </p>

                {/* Skill / Domain Tags */}
                {club.ml_keywords && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '22px' }}>
                    {club.ml_keywords.split(',').slice(0, 3).map((tag, tIdx) => (
                      <span key={tIdx} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', backgroundColor: 'rgba(241, 245, 249, 0.8)', color: 'var(--text-muted)', border: '1px solid rgba(226, 232, 240, 0.8)', fontWeight: 500 }}>
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <Link 
                    to={`/clubs/${club.slug}`} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '9px', fontSize: '0.86rem' }}
                  >
                    View Profile
                  </Link>
                  {club.recruitment_open === 1 && (
                    <Link 
                      to={`/clubs/${club.slug}/apply`} 
                      className="btn btn-primary" 
                      style={{ padding: '9px 16px', fontSize: '0.86rem' }}
                    >
                      Apply <ArrowRight size={14} />
                    </Link>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
