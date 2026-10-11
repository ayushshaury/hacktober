import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, Sparkles, Calendar, Search, ArrowRight, 
  ShieldCheck, UserPlus, CheckCircle, ExternalLink, Award, Users, Layers, Zap
} from 'lucide-react';

export const Home = () => {
  const [recruitingClubs, setRecruitingClubs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/clubs?recruitment_open=1')
      .then(res => res.json())
      .then(data => setRecruitingClubs((data.clubs || []).slice(0, 6)))
      .catch(err => console.error('Error fetching recruiting clubs:', err));

    fetch('/api/events')
      .then(res => res.json())
      .then(data => setUpcomingEvents((data.events || []).slice(0, 4)))
      .catch(err => console.error('Error fetching events:', err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/clubs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/clubs');
    }
  };

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

  const getImgSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }} className="animate-fade-in">
      
      {/* Hero Section (Apple & Google Style Clean Ambient Atmosphere) */}
      <section style={{ 
        background: 'radial-gradient(circle at 50% 25%, rgba(0, 113, 227, 0.07) 0%, rgba(251, 251, 253, 0) 70%), #FFFFFF',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '72px 0 64px 0' 
      }}>
        <div className="container" style={{ maxWidth: '880px', textAlign: 'center' }}>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 16px', 
            borderRadius: '999px', 
            backgroundColor: 'var(--color-light-blue)', 
            border: '1px solid #BAE0FD', 
            color: '#0066CC', 
            fontSize: '0.84rem', 
            fontWeight: 600, 
            marginBottom: '24px' 
          }}
          className="animate-float"
          >
            <Sparkles size={15} /> Official Campus Portal for 26 Verified Clubs
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 4.2vw, 3.8rem)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.03em' }}>
            Discover Your Community at <span className="gradient-text">BIT Sindri</span>
          </h1>

          <p style={{ fontSize: '1.12rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '680px', margin: '0 auto 36px auto' }}>
            Explore verified student societies, participate in premier campus hackathons, and apply for open recruitments in one seamless unified hub.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <Link to="/clubs" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '0.98rem' }}>
              Explore Clubs <ArrowRight size={16} />
            </Link>

            <Link to="/recommendations" className="btn btn-secondary" style={{ padding: '13px 28px', fontSize: '0.98rem' }}>
              <Sparkles size={16} color="var(--color-secondary)" /> AI Match Finder
            </Link>
          </div>

          {/* Search Box (Apple Style Glass Bar) */}
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input"
              style={{
                paddingLeft: '48px',
                paddingRight: '120px',
                paddingTop: '15px',
                paddingBottom: '15px',
                borderRadius: '999px',
                fontSize: '0.96rem',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: 'var(--shadow-card)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}
              placeholder="Search by club name, coding, robotics, photography..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '9px 20px',
                fontSize: '0.86rem'
              }}
            >
              Search
            </button>
          </form>

        </div>
      </section>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '52px' }}>
        
        {/* Metric Overview Cards (Apple Squircle Panels) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '22px', 
          marginBottom: '64px' 
        }}>
          <div className="glass-panel" style={{ padding: '26px', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-secondary)', fontSize: '2.4rem', fontWeight: 800 }}>26</div>
            <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.94rem', marginTop: '4px' }}>Verified Campus Clubs</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Technical, Cultural & Branch Societies</div>
          </div>

          <div className="glass-panel" style={{ padding: '26px', textAlign: 'center' }}>
            <div style={{ color: '#137333', fontSize: '2.4rem', fontWeight: 800 }}>{recruitingClubs.length}</div>
            <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.94rem', marginTop: '4px' }}>Active Recruitments</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Induction Forms Open Now</div>
          </div>

          <div className="glass-panel" style={{ padding: '26px', textAlign: 'center' }}>
            <div style={{ color: '#0071E3', fontSize: '2.4rem', fontWeight: 800 }}>{upcomingEvents.length || '5+'}</div>
            <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.94rem', marginTop: '4px' }}>Flagship Events</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Hackathons, Fests & Seminars</div>
          </div>

          <div className="glass-panel" style={{ padding: '26px', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-main)', fontSize: '2.4rem', fontWeight: 800 }}>100%</div>
            <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.94rem', marginTop: '4px' }}>Institute Verified</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Official BIT Sindri Administration</div>
          </div>
        </div>

        {/* SECTION: RECRUITING CLUBS SPOTLIGHT */}
        <section style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Clubs Currently Recruiting
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginTop: '4px' }}>
                Official induction applications are open for student registrations.
              </p>
            </div>

            <Link to="/clubs?recruitment_open=1" className="btn btn-outline" style={{ fontSize: '0.86rem' }}>
              View All Recruiting Clubs ({recruitingClubs.length}) <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {recruitingClubs.map(club => (
              <div key={club.id} className="glass-panel glass-panel-hover" style={{ padding: '26px', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {club.logo_url ? (
                      <img 
                        src={getImgSrc(club.logo_url)} 
                        alt={club.name} 
                        style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EBF5FF', color: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {club.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '1.16rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.25 }}>{club.name}</h3>
                      <span className={`badge ${getCategoryBadgeClass(club.category)}`} style={{ marginTop: '6px' }}>
                        {club.category.split('–')[0].trim()}
                      </span>
                    </div>
                  </div>

                  <span className="badge" style={{ backgroundColor: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6', whiteSpace: 'nowrap' }}>
                    <UserPlus size={12} /> Recruiting
                  </span>
                </div>

                <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                  {club.short_description}
                </p>

                {/* Skill tags */}
                {club.ml_keywords && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '22px' }}>
                    {club.ml_keywords.split(',').slice(0, 3).map((tag, tIdx) => (
                      <span key={tIdx} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', backgroundColor: '#F1F5F9', color: 'var(--text-body)', fontWeight: 500 }}>
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <Link to={`/clubs/${club.slug}`} className="btn btn-secondary" style={{ flex: 1, padding: '9px', fontSize: '0.86rem' }}>
                    View Profile
                  </Link>

                  <Link to={`/clubs/${club.slug}/apply`} className="btn btn-primary" style={{ flex: 1, padding: '9px', fontSize: '0.86rem' }}>
                    Apply <ArrowRight size={14} />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* SECTION: UPCOMING EVENTS PREVIEW */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Featured Campus Events
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginTop: '4px' }}>
                Upcoming institute hackathons, technical symposiums, and cultural fests.
              </p>
            </div>

            <Link to="/events" className="btn btn-outline" style={{ fontSize: '0.86rem' }}>
              View All Events <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {upcomingEvents.map(ev => (
              <div key={ev.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                
                {ev.image_url ? (
                  <div style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                    <img 
                      src={getImgSrc(ev.image_url)} 
                      alt={ev.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                ) : null}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="badge badge-technical">
                    <Calendar size={12} /> {ev.event_date}
                  </span>
                  <span className="badge" style={{ backgroundColor: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6' }}>
                    {ev.status || 'Published'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  {ev.title}
                </h3>

                <div style={{ fontSize: '0.84rem', color: 'var(--color-secondary)', fontWeight: 600, marginBottom: '14px' }}>
                  By {ev.club_name}
                </div>

                <p style={{ color: 'var(--text-body)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                  {ev.description ? ev.description.slice(0, 105) + '...' : ''}
                </p>

                <Link to={`/events/${ev.id}`} className="btn btn-secondary" style={{ width: '100%', padding: '9px' }}>
                  View Details & Register
                </Link>

              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
};
