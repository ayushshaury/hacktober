import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, Search, ArrowRight, CheckCircle2, ChevronRight, 
  HelpCircle, RefreshCw, Sliders, Zap
} from 'lucide-react';

const PRESET_PROMPTS = [
  {
    label: "AI, ML & Hackathons",
    query: "I want to learn AI, machine learning and participate in competitive hackathons."
  },
  {
    label: "Web & Software Engineering",
    query: "Interested in fullstack web development, open source, React, C++ DSA and software projects."
  },
  {
    label: "Automotive & Mechanical",
    query: "Passionate about automotive engineering, electric vehicles, vehicle design and BAJA competition."
  },
  {
    label: "Dramatics & Cultural Arts",
    query: "Looking for choreography, stage dramatics, vocal singing, media and cultural fests."
  },
  {
    label: "IIC, Startups & Entrepreneurship",
    query: "I have innovative business ideas, IIC Institution Innovation Council projects, tech solutions and want incubation support."
  },
  {
    label: "Journalism & Literature",
    query: "Interested in creative writing, magazine editorial, journalism and content creation."
  }
];

export const Recommendations = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery || !searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim(), max_recommendations: 3 })
      });

      const data = await res.json();
      if (res.ok) {
        setRecommendations(data.recommendations || []);
      } else {
        setError(data.error || 'Failed to fetch recommendations.');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Network connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetQuery) => {
    setQuery(presetQuery);
    handleSearch(presetQuery);
  };

  const getImgSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }} className="animate-fade-in">
      
      {/* Header Banner (Apple Style Clean Ambience) */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)', 
        padding: '52px 0 40px 0' 
      }}>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          
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
            <Sparkles size={14} /> AI / Machine Learning Recommendation System
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', letterSpacing: '-0.025em' }}>
            Find Your Ideal Club with <span className="gradient-text">AI Matching</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
            Type your skills, career goals, or technical hobbies. Our natural language matching engine ranks the best institute organizations for you.
          </p>

          {/* Search Box (Apple Glass Bar) */}
          <div className="glass-panel" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-card)', borderRadius: '999px' }}>
            <Search size={20} color="var(--text-muted)" style={{ marginLeft: '12px' }} />
            <input 
              type="text"
              placeholder="What are you interested in? (e.g. I want to build AI bots, web apps and do hackathons)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1, border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.98rem', backgroundColor: 'transparent' }}
            />
            <button 
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="btn btn-primary"
              style={{ padding: '11px 24px', fontSize: '0.9rem' }}
            >
              {loading ? <RefreshCw size={16} className="spin" /> : <><Sparkles size={16} /> Find Matches</>}
            </button>
          </div>

          {/* Presets (Pill Tags) */}
          <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 500 }}>Try queries:</span>
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(preset.query)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontSize: '0.78rem',
                  color: 'var(--text-body)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'var(--transition-smooth)'
                }}
                className="apple-box-hover"
              >
                {preset.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Results Container */}
      <div className="container" style={{ maxWidth: '920px', marginTop: '40px' }}>
        
        {error && (
          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FCE8E6', border: '1px solid #FAD2CF', color: '#C5221F', textAlign: 'center', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <RefreshCw size={36} className="spin" color="#0071E3" />
            <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.96rem' }}>
              Computing semantic similarity and domain keyword weights...
            </p>
          </div>
        )}

        {!loading && searched && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Top Matched Clubs ({recommendations.length})
              </h2>

              <button
                onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <Sliders size={14} /> {showScoreBreakdown ? 'Hide ML Metrics' : 'Show ML Match Breakdown'}
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="glass-panel" style={{ padding: '52px', textAlign: 'center' }}>
                <HelpCircle size={40} color="#94A3B8" />
                <h3 style={{ marginTop: '14px', fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 700 }}>No direct club matches found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Try rephrasing your prompt or select one of the suggested prompts above.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {recommendations.map((club, idx) => (
                  <div 
                    key={club.id} 
                    className="glass-panel glass-panel-hover" 
                    style={{ 
                      padding: '28px', 
                      border: idx === 0 ? '1px solid #BAE0FD' : '1px solid var(--border-color)',
                      backgroundColor: idx === 0 ? 'linear-gradient(180deg, #FFFFFF 0%, #F5F9FF 100%)' : '#FFFFFF'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                      
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {club.logo_url ? (
                            <img 
                              src={getImgSrc(club.logo_url)}
                              alt={club.name}
                              style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EBF5FF', color: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                              {club.name.charAt(0)}
                            </div>
                          )}

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>{club.name}</h3>
                              {idx === 0 && (
                                <span className="badge" style={{ backgroundColor: '#0071E3', color: '#FFFFFF', fontWeight: 700 }}>
                                  <Zap size={12} /> #1 Top Match
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.84rem', color: 'var(--color-secondary)', marginTop: '2px', fontWeight: 600 }}>
                              {club.category}
                            </div>
                          </div>
                        </div>

                        <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', marginTop: '16px', lineHeight: 1.6 }}>
                          {club.short_description || club.description}
                        </p>
                      </div>

                      {/* Match Score Badge (Apple Style) */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          padding: '12px 20px', 
                          borderRadius: '16px', 
                          backgroundColor: '#E6F4EA', 
                          border: '1px solid #CEEAD6',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#137333', lineHeight: 1 }}>
                            {club.matchPercentage}%
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#137333', textTransform: 'uppercase', marginTop: '3px', letterSpacing: '0.04em' }}>
                            Match Affinity
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Matched Keywords Tags */}
                    {club.matchReasons && club.matchReasons.length > 0 && (
                      <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Matched Areas:</span>
                        {club.matchReasons.map((reason, rIdx) => (
                          <span 
                            key={rIdx} 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '4px 10px', 
                              borderRadius: '999px', 
                              backgroundColor: '#EBF5FF', 
                              color: '#0066CC',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}
                          >
                            <CheckCircle2 size={12} /> {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ML Math Breakdown Drawer */}
                    {showScoreBreakdown && (
                      <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <div><strong>Hybrid Formula:</strong> Score = (0.60 × Semantic Sim) + (0.40 × Keyword Match)</div>
                        <div style={{ marginTop: '4px' }}>
                          Semantic Score: <code>{club.semanticScore}</code> | Keyword Score: <code>{club.keywordScore}</code> | Final Hybrid: <code>{club.finalScore}</code>
                        </div>
                      </div>
                    )}

                    {/* Action Link */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <Link 
                        to={`/clubs/${club.slug}`} 
                        className="btn btn-primary"
                        style={{ padding: '9px 20px', fontSize: '0.88rem' }}
                      >
                        Explore Club Profile <ArrowRight size={14} />
                      </Link>
                      {club.recruitment_open === 1 && (
                        <Link 
                          to={`/clubs/${club.slug}/apply`} 
                          className="btn btn-secondary"
                          style={{ padding: '9px 18px', fontSize: '0.88rem' }}
                        >
                          Apply for Induction
                        </Link>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
