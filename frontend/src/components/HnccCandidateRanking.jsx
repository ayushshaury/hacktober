import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Users, Award, ShieldAlert, Phone, BookOpen, CheckCircle, RefreshCw, Lock } from 'lucide-react';

const DOMAINS = ['CP / DSA', 'Web Development', 'AI / ML'];

export const HnccCandidateRanking = () => {
  const { user, token } = useAuth();
  
  const [selectedDomain, setSelectedDomain] = useState('Web Development');
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Check if current user is an authorized HnCC Administrator or Super Admin
  const isAuthorized = user && (
    user.role === 'super_admin' || 
    (user.role === 'club_admin' && (user.club_slug === 'hncc' || user.club_id === 1 || user.email?.includes('hncc')))
  );

  const handleGenerateRanking = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthorized) {
      setError('Unauthorized: Only official HnCC Administrators can run this model.');
      return;
    }

    const count = parseInt(topN, 10);
    if (isNaN(count) || count < 1 || count > 500) {
      setError('Please enter a valid candidate count between 1 and 500.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/hncc/candidate-ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          domain: selectedDomain,
          top_n: count
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate candidate ranking');
      }

      setResults(data);
    } catch (err) {
      console.error('Error generating AI candidate ranking:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If user is not an authorized HnCC Admin, display locked access banner
  if (!isAuthorized) {
    return (
      <div 
        className="pixel-corner-mark"
        style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-gold-dim)',
          padding: '40px 28px',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#080d12',
          border: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px auto',
          boxShadow: '1px 1px 0px #8a7329'
        }}>
          <Lock size={26} color="var(--color-gold)" />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '1.4rem',
          color: 'var(--text-cream)',
          marginBottom: '10px',
          letterSpacing: '0.04em'
        }}>
          HnCC AI CANDIDATE RANKING SYSTEM
        </h3>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
          maxWidth: '560px',
          margin: '0 auto 20px auto',
          lineHeight: 1.6
        }}>
          This domain-wise AI candidate shortlisting feature is powered by the official 2k26 induction dataset and Sentence-Transformers embedding model.
          Access is strictly restricted to verified <strong style={{ color: 'var(--color-gold)' }}>HnCC Administrators</strong>.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: '#070c10',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          <ShieldAlert size={15} color="var(--color-coral)" />
          <span>Status: Restricted Access • Authorized HnCC Admins Only</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-mono)' }}>
      
      {/* Header Banner */}
      <div 
        className="pixel-corner-mark"
        style={{
          backgroundColor: '#090e13',
          border: '1px solid var(--border-gold)',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 0 16px rgba(194, 166, 73, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge-pixel gold">
                HnCC 2k26 AI ENGINE
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-mint)', fontWeight: 700 }}>
                ● MODEL ACTIVE (MiniLM-L6-v2)
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
              color: 'var(--text-cream)',
              lineHeight: 1.2
            }}>
              DOMAIN-WISE CANDIDATE RANKING
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '4px' }}>
              Select a domain and enter candidate count to run the 80% Technical Skills + 20% Communication scoring model.
            </p>
          </div>

          <div style={{
            padding: '10px 16px',
            backgroundColor: '#0c141c',
            border: '1px solid var(--border-card)',
            fontSize: '0.76rem',
            color: 'var(--text-muted)'
          }}>
            <div>WEIGHTS: <strong style={{ color: 'var(--color-gold)' }}>80% Skills</strong> + <strong style={{ color: 'var(--color-mint)' }}>20% Comm</strong></div>
            <div style={{ marginTop: '2px', color: 'var(--text-dim)' }}>DATASET: 495 Official Candidates</div>
          </div>
        </div>
      </div>

      {/* Control Panel: Domain Selector & Number Input */}
      <div 
        style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-card)',
          padding: '24px 28px',
          marginBottom: '28px'
        }}
      >
        <form onSubmit={handleGenerateRanking}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'flex-end' }}>
            
            {/* Domain Selector */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.92rem',
                color: 'var(--color-gold)',
                marginBottom: '10px',
                letterSpacing: '0.04em'
              }}>
                1. SELECT DOMAIN
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DOMAINS.map(domain => {
                  const isSel = selectedDomain === domain;
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => {
                        setSelectedDomain(domain);
                        // Do not auto-generate; wait for user click
                      }}
                      className={`filter-btn ${isSel ? 'active' : ''}`}
                      style={{
                        padding: '10px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 700
                      }}
                    >
                      {domain}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Count Input */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.92rem',
                color: 'var(--color-gold)',
                marginBottom: '10px',
                letterSpacing: '0.04em'
              }}>
                2. TOP CANDIDATES COUNT
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={topN}
                  onChange={(e) => setTopN(e.target.value)}
                  className="pixel-input"
                  style={{
                    width: '120px',
                    padding: '9px 14px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                  required
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  candidates (1 - 500)
                </span>
              </div>
            </div>

            {/* Generate Action Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-pixel-gold"
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '0.95rem'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> RUNNING MODEL...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> GENERATE AI RANKING →
                  </>
                )}
              </button>
            </div>

          </div>

        </form>

        {error && (
          <div style={{
            marginTop: '18px',
            padding: '12px 16px',
            backgroundColor: 'rgba(240, 113, 103, 0.15)',
            border: '1px solid var(--color-coral)',
            color: 'var(--color-coral)',
            fontSize: '0.84rem'
          }}>
            ! {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="animate-fade-in">
          
          {/* Results Summary Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '1.25rem',
                color: 'var(--text-cream)'
              }}>
                RANKED CANDIDATES: <span style={{ color: 'var(--color-gold)' }}>{results.domain}</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Showing top {results.candidates.length} of {results.total_available} eligible candidates ranked from highest to lowest score.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge-pixel gold">
                {results.candidates.length} RETURNED
              </span>
              <span className="badge-pixel tech">
                {results.domain} ONLY
              </span>
            </div>
          </div>

          {/* Candidates List Table / Cards */}
          {results.candidates.length === 0 ? (
            <div style={{
              backgroundColor: '#0c141c',
              border: '1px solid var(--border-card)',
              padding: '36px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              No eligible candidates found matching domain criteria.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.candidates.map((c) => (
                <div
                  key={c.candidate_id || c.rank}
                  className="pixel-card"
                  style={{
                    backgroundColor: '#0c141c',
                    border: c.rank <= 3 ? '1px solid var(--border-gold)' : '1px solid var(--border-card)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  
                  {/* Left: Rank & Candidate Information (Display-only Metadata) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                    
                    {/* Rank Number */}
                    <div style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: c.rank <= 3 ? 'rgba(243, 208, 99, 0.12)' : '#070c10',
                      border: c.rank <= 3 ? '1px solid var(--color-gold)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: c.rank <= 3 ? 'var(--color-gold)' : 'var(--text-cream)',
                      flexShrink: 0
                    }}>
                      #{c.rank}
                    </div>

                    {/* Metadata: Name, Branch, Phone */}
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '1.1rem',
                        color: 'var(--text-cream)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {c.candidate_name}
                        {c.rank === 1 && (
                          <span style={{ fontSize: '0.66rem', padding: '1px 6px', backgroundColor: 'var(--color-gold)', color: 'var(--text-dark)', fontWeight: 800 }}>
                            TOP MATCH
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--color-cyan)' }}>
                          🎓 {c.branch || 'Branch N/A'}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} color="var(--border-gold)" /> {c.phone_number || 'N/A'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Middle: Domain & Matched Skills Tags */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Domain: <strong style={{ color: 'var(--text-cream)' }}>{c.domain}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {c.matched_keywords && c.matched_keywords.slice(0, 3).map((kw, ki) => (
                        <span key={ki} style={{
                          padding: '2px 6px',
                          backgroundColor: '#070c10',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.68rem',
                          color: 'var(--color-mint)'
                        }}>
                          ✓ {kw}
                        </span>
                      ))}
                      {c.matched_languages && c.matched_languages.slice(0, 2).map((lang, li) => (
                        <span key={li} style={{
                          padding: '2px 6px',
                          backgroundColor: '#070c10',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.68rem',
                          color: 'var(--color-cyan)'
                        }}>
                          💻 {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Scores breakdown & Final Score Out of 100 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    
                    {/* Component Scores (Technical Skills & Communication) */}
                    <div style={{ textAlign: 'right', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <div>Skills (80%): <strong style={{ color: 'var(--color-gold)' }}>{c.skills_score}</strong>/100</div>
                      <div style={{ marginTop: '2px' }}>Comm (20%): <strong style={{ color: 'var(--color-mint)' }}>{c.communication_rating}★</strong> ({c.communication_score}/100)</div>
                    </div>

                    {/* Final Overall Matching Score */}
                    <div style={{
                      minWidth: '92px',
                      padding: '8px 14px',
                      backgroundColor: '#070c10',
                      border: '1px solid var(--border-gold)',
                      textAlign: 'center',
                      boxShadow: '1px 1px 0px #8a7329'
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '1.45rem',
                        fontWeight: 800,
                        color: 'var(--color-gold)',
                        lineHeight: 1
                      }}>
                        {c.final_score}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: '2px' }}>
                        SCORE / 100
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
