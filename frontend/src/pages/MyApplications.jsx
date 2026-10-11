import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, ArrowRight, Building2 } from 'lucide-react';

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

  const getStatusBadgeStyle = (st) => {
    switch (st) {
      case 'Submitted': return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'Under Review': return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'Shortlisted': return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
      case 'Selected': return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' };
      case 'Rejected': return { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' };
      case 'Waitlisted': return { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF' };
      default: return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Header Banner */}
      <div style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '40px 0 32px 0' }}>
        <div className="container" style={{ maxWidth: '840px', textAlign: 'center' }}>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            backgroundColor: '#EFF6FF', 
            border: '1px solid #BFDBFE', 
            color: '#1D4ED8', 
            fontSize: '0.82rem', 
            fontWeight: 600, 
            marginBottom: '14px' 
          }}>
            <FileText size={14} /> Student Application Status Tracker
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            My Induction <span style={{ color: '#2563EB' }}>Applications</span>
          </h1>

          <p style={{ color: '#475569', fontSize: '1rem' }}>
            Track the status of your submitted club induction forms across BIT Sindri campus societies.
          </p>

        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ maxWidth: '920px', marginTop: '36px' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
            Loading your induction application records...
          </div>
        ) : applications.length === 0 ? (
          <div className="card-panel" style={{ padding: '48px', textAlign: 'center' }}>
            <FileText size={40} color="#94A3B8" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>No Induction Applications Found</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px', marginBottom: '24px' }}>
              You haven't submitted any club induction forms yet. Explore recruiting clubs and submit your candidate application.
            </p>
            <Link to="/clubs?recruitment_open=1" className="btn btn-primary">
              Browse Recruiting Clubs <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="card-panel" style={{ overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Club Name</th>
                  <th>Category</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => {
                  const stStyle = getStatusBadgeStyle(app.status);
                  return (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>
                        {app.club_name}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        {app.club_category}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748B' }}>
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: stStyle.bg, color: stStyle.text, border: `1px solid ${stStyle.border}` }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/clubs/${app.club_slug}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          View Club
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
