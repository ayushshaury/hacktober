import React from 'react';
import { Compass, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer style={{ 
      marginTop: 'auto', 
      borderTop: '1px solid #E2E8F0', 
      backgroundColor: '#F8FAFC',
      padding: '48px 0 28px 0'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '36px' }}>
          
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                <Compass size={18} />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>BIT Sindri Clubs</span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.6', maxWidth: '460px' }}>
              Centralized platform for 26 verified student clubs, events management, recruitment applications, and AI-powered recommendations at Birsa Institute of Technology, Sindri.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#475569' }}>
              <li><Link to="/clubs" style={{ color: '#475569', transition: 'color 0.15s' }}>All Campus Clubs</Link></li>
              <li><Link to="/events" style={{ color: '#475569', transition: 'color 0.15s' }}>Upcoming Events</Link></li>
              <li><Link to="/recommendations" style={{ color: '#2563EB', fontWeight: 600 }}>AI Club Finder</Link></li>
              <li><Link to="/login" style={{ color: '#475569', transition: 'color 0.15s' }}>Club Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Official Portals</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#475569' }}>
              <li>
                <a href="https://www.bitsindri.ac.in/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#475569' }}>
                  BIT Sindri Main Site <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.hnccbits.com/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#475569' }}>
                  HnCC Official <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div style={{ 
          borderTop: '1px solid #E2E8F0', 
          paddingTop: '20px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.82rem',
          color: '#64748B'
        }}>
          <div>
            © {new Date().getFullYear()} BIT Sindri Campus Platform. Designed for student engagement & leadership.
          </div>
          <div style={{ color: '#94A3B8' }}>
            Verified 26 Institute Clubs Platform
          </div>
        </div>
      </div>
    </footer>
  );
};
