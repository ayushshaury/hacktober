import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PixelIcon } from '../components/PixelIcon';
import { ArrowRight } from 'lucide-react';

export const MyApplications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [token]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/induction/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load applications');
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Submitted': return { bg: 'rgba(56, 189, 248, 0.2)', border: '#38bdf8', color: '#38bdf8' };
      case 'Under Review': return { bg: 'rgba(243, 208, 99, 0.2)', border: '#f3d063', color: '#f3d063' };
      case 'Shortlisted':
      case 'Selected': return { bg: 'rgba(74, 222, 128, 0.2)', border: '#4ade80', color: '#4ade80' };
      case 'Rejected': return { bg: 'rgba(240, 113, 103, 0.2)', border: '#f07167', color: '#f07167' };
      default: return { bg: '#162733', border: '#243b48', color: '#8ea3b4' };
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '920px', paddingTop: '40px' }}>
        
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '2.4rem', color: 'var(--text-cream)' }}>
            MY APPLICATIONS
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            TRACK YOUR SUBMITTED INDUCTION FORMS
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            LOADING APPLICATION RECORDS...
          </div>
        ) : applications.length === 0 ? (
          <div style={{ backgroundColor: '#0c141c', border: '1px solid var(--border-card)', padding: '48px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.2rem', color: 'var(--text-cream)', marginBottom: '8px' }}>
              NO APPLICATIONS FOUND
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '24px' }}>
              You haven't submitted any induction applications yet. Explore recruiting clubs to apply!
            </p>
            <Link to="/clubs" className="btn-pixel-gold">
              EXPLORE CLUBS →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {applications.map(app => {
              const badge = getStatusBadge(app.status);
              return (
                <div
                  key={app.id}
                  className="pixel-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#070c10', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PixelIcon name={app.club_slug || app.club_category} size={28} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.05rem', color: 'var(--text-cream)' }}>
                        {app.club_name}
                      </h4>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Submitted on: {new Date(app.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      backgroundColor: badge.bg,
                      border: `1px solid ${badge.border}`,
                      color: badge.color
                    }}>
                      {app.status?.toUpperCase()}
                    </span>

                    <Link
                      to={`/clubs/${app.club_slug}`}
                      className="btn-pixel-outline"
                      style={{ padding: '6px 14px', fontSize: '0.76rem' }}
                    >
                      VIEW CLUB →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
