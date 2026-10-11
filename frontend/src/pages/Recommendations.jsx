import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, RefreshCw, Zap } from 'lucide-react';
import { PixelIcon } from '../components/PixelIcon';
import aiMatchRoomImg from '../assets/ai_match_room_pixel.jpg';

const PRESET_PROMPTS = [
  { label: "AI & ML", query: "I want to learn AI, machine learning and participate in competitive hackathons." },
  { label: "Web & Software", query: "Interested in fullstack web development, open source, React, C++ DSA and software projects." },
  { label: "Robotics & Hardware", query: "Passionate about robotics, microcontrollers, IoT, automation and sensors." },
  { label: "Automotive & Mechanical", query: "Passionate about automotive engineering, electric vehicles, vehicle design and BAJA competition." },
  { label: "Dramatics & Cultural", query: "Looking for stage dramatics, choreography, vocal singing, theatre and cultural fests." },
  { label: "Startups & IIC", query: "I have innovative business ideas, IIC projects, tech solutions and want incubation support." },
  { label: "Debate & Literary", query: "Interested in creative writing, parliamentary debating, journalism and public speaking." }
];

export const Recommendations = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const interactiveSectionRef = useRef(null);

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
        body: JSON.stringify({ query: searchQuery.trim(), max_recommendations: 4 })
      });

      const data = await res.json();
      if (res.ok) {
        setRecommendations(data.recommendations || []);
      } else {
        setError(data.error || 'Failed to fetch recommendations.');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetQuery) => {
    setQuery(presetQuery);
    handleSearch(presetQuery);
  };

  const scrollToQuestions = () => {
    if (interactiveSectionRef.current) {
      interactiveSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* ============================================================
          HERO SECTION (EXACT REPRODUCTION OF REFERENCE PANEL 5)
          ============================================================ */}
      <section className="container" style={{ paddingTop: '50px', paddingBottom: '40px' }}>
        <div style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-gold)',
          padding: '40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '36px',
          alignItems: 'center',
          boxShadow: '0 0 24px rgba(194, 166, 73, 0.12)'
        }}>
          
          {/* Left Column: Heading, Subtitle & Get Started Button */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
              color: 'var(--text-cream)',
              lineHeight: 1.1,
              letterSpacing: '0.04em',
              marginBottom: '16px'
            }}>
              FIND YOUR CLUB
            </h1>

            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.96rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '460px'
            }}>
              Answer a few questions and let us suggest the best clubs for you.
            </p>

            <button
              type="button"
              onClick={scrollToQuestions}
              className="btn-pixel-gold"
              style={{
                fontSize: '1rem',
                padding: '13px 28px'
              }}
            >
              GET STARTED →
            </button>
          </div>

          {/* Right Column: Exact Pixel Art Room with Cat & CRT Terminal */}
          <div
            className="crt-arcade-monitor pixel-corner-mark"
            style={{
              width: '100%',
              height: '320px',
              backgroundColor: '#080d12',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <img
              src={aiMatchRoomImg}
              alt="Retro Room with Cat and Terminal"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                imageRendering: 'pixelated'
              }}
            />
          </div>

        </div>
      </section>

      {/* ============================================================
          INTERACTIVE QUESTIONNAIRE / TERMINAL MATCH FINDER
          ============================================================ */}
      <section ref={interactiveSectionRef} className="container" style={{ marginTop: '20px' }}>
        <div style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-card)',
          padding: '36px'
        }}>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.25rem', color: 'var(--color-gold)', marginBottom: '6px' }}>
              &gt; SELECT PASSION KEYWORDS OR ENTER INTERESTS
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Click any preset below or write your custom interests to run the club similarity matcher:
            </p>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {PRESET_PROMPTS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePresetClick(preset.query)}
                className="filter-btn"
                style={{ fontSize: '0.76rem' }}
              >
                + {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Terminal Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <input
                type="text"
                className="pixel-input"
                style={{ padding: '14px 18px', fontSize: '0.92rem' }}
                placeholder="> Enter skills (e.g. React, CAD design, robotics, photography, public speaking)..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-pixel-gold"
              style={{ padding: '14px 28px' }}
            >
              {loading ? 'ANALYZING...' : 'RUN AI MATCH →'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div style={{ marginTop: '20px', padding: '12px 16px', backgroundColor: 'rgba(240, 113, 103, 0.15)', border: '1px solid var(--color-coral)', color: 'var(--color-coral)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              ! ERROR: {error}
            </div>
          )}

        </div>
      </section>

      {/* ============================================================
          RECOMMENDED CLUBS RESULT CARDS
          ============================================================ */}
      {searched && (
        <section className="container" style={{ marginTop: '36px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.4rem', color: 'var(--text-cream)' }}>
              MATCH RESULTS ({recommendations.length})
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Clubs ranked by interest compatibility:
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              CALCULATING COMPATIBILITY MATRIX...
            </div>
          ) : recommendations.length === 0 ? (
            <div style={{ backgroundColor: '#0c141c', border: '1px solid var(--border-card)', padding: '36px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No high-confidence matches found. Try selecting one of the preset chips above!</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {recommendations.map((rec, index) => {
                const matchPct = rec.score_percentage || (rec.score ? Math.round(rec.score * 100) : (95 - index * 6));
                return (
                  <div
                    key={rec.id || index}
                    className="pixel-card"
                    style={{ border: index === 0 ? '1px solid var(--border-gold)' : '1px solid var(--border-card)' }}
                  >
                    {/* Top Match Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span className="badge-pixel gold">
                        #{index + 1} {matchPct}% MATCH
                      </span>
                      {rec.recruitment_open === 1 && (
                        <span className="badge-pixel tech">
                          OPEN
                        </span>
                      )}
                    </div>

                    {/* Pixel Icon Container with Corner Marks */}
                    <div className="pixel-card-icon-frame pixel-corner-mark" style={{ height: '110px' }}>
                      <PixelIcon name={rec.slug || rec.category} size={48} />
                    </div>

                    <h4 style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '1.1rem',
                      color: 'var(--text-cream)',
                      marginBottom: '8px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.6rem',
                      lineHeight: 1.25
                    }}>
                      {rec.name}
                    </h4>

                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
                      {rec.short_description || rec.reason || 'Ideal match for your selected passions and skill path at BIT Sindri.'}
                    </p>

                    <Link
                      to={`/clubs/${rec.slug}`}
                      className="btn-pixel-outline"
                      style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.8rem', padding: '8px 14px' }}
                    >
                      EXPLORE CLUB PROFILE →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

    </div>
  );
};
