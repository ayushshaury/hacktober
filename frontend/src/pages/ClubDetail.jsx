import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, Globe, Calendar, ExternalLink, CheckCircle2, UserPlus, 
  ArrowLeft, Share2, Award, ChevronRight, MessageSquare, Users, 
  Mail, Phone, Linkedin, Github 
} from 'lucide-react';

export const ClubDetail = () => {
  const { slug } = useParams();
  const [club, setClub] = useState(null);
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

  const getLogoSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#FBFBFD', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading club profile...</div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', fontWeight: 800 }}>Club Profile Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '28px' }}>
          The requested club profile does not exist or has been updated.
        </p>
        <Link to="/clubs" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Clubs Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }} className="animate-fade-in">
      
      {/* Top Banner Header (Apple Style Glass Banner) */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid rgba(0,0,0,0.06)', 
        padding: '44px 0 36px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div className="container">
          
          <Link to="/clubs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 600 }}>
            <ArrowLeft size={15} /> Back to Clubs Directory
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {club.logo_url ? (
                <img 
                  src={getLogoSrc(club.logo_url)}
                  alt={club.name}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '20px',
                    objectFit: 'cover',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '20px', 
                backgroundColor: '#EBF5FF', 
                border: '1px solid #BAE0FD',
                display: club.logo_url ? 'none' : 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 800,
                color: '#0066CC',
                fontSize: '1.8rem',
                boxShadow: '0 8px 24px rgba(0, 113, 227, 0.12)'
              }}>
                {club.name.charAt(0)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                    {club.name}
                  </h1>
                  {club.recruitment_open === 1 && (
                    <span className="badge" style={{ backgroundColor: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6' }}>
                      Recruitment Open
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge-technical">{club.category}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Code: {club.club_code}</span>
                </div>
              </div>
            </div>

            {/* CTA Controls */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {club.website_url && (
                <a href={club.website_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
                  <Globe size={15} /> Official Website <ExternalLink size={13} />
                </a>
              )}

              {club.recruitment_open === 1 && (
                <Link to={`/clubs/${club.slug}/apply`} className="btn btn-primary" style={{ padding: '11px 24px' }}>
                  <UserPlus size={16} /> Apply for Induction
                </Link>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container" style={{ marginTop: '36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          
          {/* Left Column: About & Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* About Section */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
                About {club.name}
              </h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.96rem', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                {club.description || club.short_description}
              </p>
            </div>

            {/* Conducted Major Events */}
            {club.events_summary && (
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={20} color="var(--color-secondary)" /> Conducted Major Events & Initiatives
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {club.events_summary.split(';').map((eventItem, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '10px 16px', 
                        backgroundColor: '#F8FAFC', 
                        border: '1px solid rgba(226, 232, 240, 0.8)', 
                        borderRadius: '12px',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}
                    >
                      <CheckCircle2 size={16} color="#10B981" />
                      {eventItem.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Recruitment Status & Similar Clubs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Recruitment Card (Apple Box Style) */}
            <div className="glass-panel" style={{ 
              padding: '32px', 
              border: club.recruitment_open === 1 ? '1px solid #CEEAD6' : '1px solid var(--border-color)',
              background: club.recruitment_open === 1 ? 'linear-gradient(180deg, #FFFFFF 0%, #F6FBF7 100%)' : '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '12px', 
                  backgroundColor: club.recruitment_open === 1 ? '#E6F4EA' : '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserPlus size={22} color={club.recruitment_open === 1 ? '#137333' : '#64748B'} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Induction & Recruitment</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Candidate Applications</div>
                </div>
              </div>

              <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.6 }}>
                {club.recruitment_open === 1 
                  ? `${club.name} is currently accepting induction applications for the new academic batch!`
                  : `${club.name} induction application window is currently closed.`
                }
              </p>

              {club.recruitment_open === 1 ? (
                <Link 
                  to={`/clubs/${club.slug}/apply`}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '13px', textAlign: 'center', fontSize: '0.95rem' }}
                >
                  Apply for Induction
                </Link>
              ) : (
                <button className="btn btn-secondary" style={{ width: '100%', padding: '12px', opacity: 0.6, cursor: 'not-allowed' }} disabled>
                  Recruitment Closed
                </button>
              )}
            </div>

            {/* Similar Clubs Section */}
            {club.similar_clubs && club.similar_clubs.length > 0 && (
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '18px' }}>You May Also Like</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {club.similar_clubs.map((simClub) => (
                    <Link 
                      key={simClub.id} 
                      to={`/clubs/${simClub.slug}`}
                      className="apple-box-hover"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '14px',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {simClub.logo_url ? (
                          <img 
                            src={getLogoSrc(simClub.logo_url)} 
                            alt={simClub.name} 
                            style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EBF5FF', color: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {simClub.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>{simClub.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{simClub.category}</div>
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Club Members & Leadership Team Section */}
        {club.members && club.members.length > 0 && (
          <div style={{ marginTop: '54px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Users size={14} /> Official Roster
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', letterSpacing: '-0.025em' }}>
                  Members & Leadership Team
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
                  Meet the passionate student leads, coordinators, and active members of {club.name}.
                </p>
              </div>

              <span className="badge badge-technical" style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} /> {club.members.length} {club.members.length === 1 ? 'Registered Member' : 'Registered Members'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
              {club.members.map((member) => {
                const isLead = (member.position || '').toLowerCase().includes('lead') || 
                               (member.position || '').toLowerCase().includes('president') || 
                               (member.position || '').toLowerCase().includes('head');

                return (
                  <div
                    key={member.id}
                    className="glass-panel apple-box-hover"
                    style={{
                      padding: '26px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div>
                      {/* Avatar & Role Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url.startsWith('/uploads') ? `http://localhost:5000${member.avatar_url}` : member.avatar_url}
                            alt={member.name}
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '16px',
                              objectFit: 'cover',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              border: '1px solid rgba(0,0,0,0.06)'
                            }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            backgroundColor: isLead ? '#EBF5FF' : '#F1F5F9',
                            color: isLead ? '#0066CC' : 'var(--text-body)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.4rem',
                            border: isLead ? '1px solid #BAE0FD' : '1px solid #E2E8F0'
                          }}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {member.name}
                          </h4>
                          <span style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: isLead ? '#EBF5FF' : '#F8FAFC',
                            color: isLead ? '#0066CC' : 'var(--text-muted)',
                            border: isLead ? '1px solid #BAE0FD' : '1px solid #E2E8F0'
                          }}>
                            {member.position}
                          </span>
                        </div>
                      </div>

                      {/* Bio if available */}
                      {member.bio && (
                        <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', lineHeight: 1.55, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {member.bio}
                        </p>
                      )}

                      {/* Academic Meta Details */}
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '18px' }}>
                        {member.department && (
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {member.department} {member.batch_year ? `• ${member.batch_year}` : ''}
                          </div>
                        )}
                        {member.joined_date && (
                          <div>
                            Member since {new Date(member.joined_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Social & Contact Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '14px', borderTop: '1px solid rgba(226, 232, 240, 0.7)', flexWrap: 'wrap' }}>
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          title={`Email ${member.name}`}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Mail size={13} /> Email
                        </a>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          title={`Call ${member.name}`}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Phone size={13} /> Call
                        </a>
                      )}
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          title="LinkedIn Profile"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Linkedin size={13} /> LinkedIn
                        </a>
                      )}
                      {member.github_url && (
                        <a
                          href={member.github_url}
                          target="_blank"
                          rel="noreferrer"
                          title="GitHub Profile"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Github size={13} /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
