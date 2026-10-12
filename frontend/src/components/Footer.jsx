import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PixelIcon } from './PixelIcon';

export const Footer = () => {
  return (
    <footer style={{ 
      marginTop: 'auto', 
      borderTop: '1px solid var(--border-gold-dim)', 
      backgroundColor: '#070c10',
      padding: '40px 0 24px 0',
      fontFamily: 'var(--font-mono)'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '28px', height: '28px', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0c141c' }}>
                <PixelIcon name="building" size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-cream)' }}>
                BIT SINDRI CLUBS PORTAL
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.6', maxWidth: '480px' }}>
              Centralized retro platform for 28 verified student clubs, events management, induction portals, and AI-powered recommendations at Birsa Institute of Technology, Sindri.
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px', color: 'var(--color-gold)', letterSpacing: '0.04em' }}>
              NAVIGATION
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li><Link to="/clubs" style={{ color: 'var(--text-muted)' }}>&gt; EXPLORE CLUBS</Link></li>
              <li><Link to="/events" style={{ color: 'var(--text-muted)' }}>&gt; CAMPUS EVENTS</Link></li>
              <li><Link to="/recommendations" style={{ color: 'var(--color-gold)' }}>&gt; AI CLUB FINDER</Link></li>
              <li><Link to="/login" style={{ color: 'var(--text-muted)' }}>&gt; ADMIN PORTAL</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px', color: 'var(--color-gold)', letterSpacing: '0.04em' }}>
              OFFICIAL LINKS
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li>
                <a href="https://www.bitsindri.ac.in/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                  BIT Sindri Official <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.hnccbits.com/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                  HnCC Portal <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div style={{ 
          borderTop: '1px solid var(--border-subtle)', 
          paddingTop: '20px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-dim)'
        }}>
          <div>
            © {new Date().getFullYear()} BIT SINDRI CLUBS PORTAL • BUILT FOR STUDENTS
          </div>
          <div style={{ color: 'var(--border-gold-dim)' }}>
            [ 28 VERIFIED CLUBS • 100% INSTITUTE SECURED ]
          </div>
        </div>
      </div>
    </footer>
  );
};
