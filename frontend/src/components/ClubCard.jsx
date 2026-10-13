import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClubArt } from './ClubArt';
import { getCategoryClass, getCategoryDisplayTag } from '../data/clubs';
import { Users, ChevronRight, Sparkles, Send, ShieldCheck } from 'lucide-react';

export const ClubCard = ({ club, index = 0 }) => {
  const { user } = useAuth();
  const isClubAdmin = user && (user.role === 'club_admin' || user.role === 'admin');
  const catClass = getCategoryClass(club.category);
  const tagText = getCategoryDisplayTag(club.category);
  const membersCount = club.member_count || (80 + ((club.id * 7) % 65));
  const isRecruiting = club.recruitment_open === 1;

  // Category Accent Border and Theme Colors
  const categoryThemeMap = {
    tech: { color: 'var(--color-cyan)', border: 'rgba(56, 189, 248, 0.45)', bg: 'rgba(56, 189, 248, 0.12)' },
    cultural: { color: 'var(--color-coral)', border: 'rgba(240, 113, 103, 0.45)', bg: 'rgba(240, 113, 103, 0.12)' },
    sports: { color: 'var(--color-mint)', border: 'rgba(74, 222, 128, 0.45)', bg: 'rgba(74, 222, 128, 0.12)' },
    literary: { color: 'var(--color-purple)', border: 'rgba(192, 132, 252, 0.45)', bg: 'rgba(192, 132, 252, 0.12)' },
    science: { color: 'var(--color-gold)', border: 'rgba(243, 208, 99, 0.45)', bg: 'rgba(243, 208, 99, 0.12)' },
    others: { color: 'var(--color-gold)', border: 'rgba(243, 208, 99, 0.45)', bg: 'rgba(243, 208, 99, 0.12)' }
  };
  const theme = categoryThemeMap[catClass] || categoryThemeMap.others;

  return (
    <div
      className="pixel-card pixel-corner-mark"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px',
        backgroundColor: '#0c141c',
        border: '1px solid var(--border-card)',
        transition: 'all 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
        animation: 'slideCardUp 0.35s ease forwards',
        animationDelay: `${(index % 12) * 0.04}s`,
        position: 'relative'
      }}
    >
      
      <div>
        {/* Top Media & Emblem Frame */}
        <div
          className="pixel-card-icon-frame pixel-corner-mark"
          style={{
            height: '150px',
            backgroundColor: '#070b10',
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${theme.border}`,
            marginBottom: '14px',
            boxShadow: 'inset 0 0 16px rgba(0, 0, 0, 0.8)'
          }}
        >
          <ClubArt club={club} size={70} fill={Boolean(club.logo_url)} />

          {/* Top Left: Category Badge */}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: theme.bg,
            color: theme.color,
            border: `1px solid ${theme.border}`,
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.68rem',
            padding: '2px 8px',
            backdropFilter: 'blur(4px)',
            zIndex: 3,
            letterSpacing: '0.04em'
          }}>
            {tagText}
          </div>

          {/* Top Right: Animated Recruitment Badge */}
          <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 3 }}>
            {isRecruiting ? (
              <span className="event-live-pill" style={{ fontSize: '0.64rem', padding: '2px 7px' }}>
                <span className="event-live-dot" /> RECRUITING
              </span>
            ) : (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.64rem',
                color: 'var(--text-muted)',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: '1px solid var(--border-subtle)',
                padding: '2px 6px'
              }}>
                CLOSED
              </span>
            )}
          </div>

          {/* Bottom Right: Club Code Pill */}
          <div style={{
            position: 'absolute',
            bottom: '6px',
            right: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.66rem',
            color: 'var(--color-gold)',
            backgroundColor: 'rgba(6, 10, 15, 0.85)',
            border: '1px solid var(--border-gold-dim)',
            padding: '1px 6px',
            zIndex: 3
          }}>
            {club.club_code || `BIT-${String(club.id).padStart(3, '0')}`}
          </div>
        </div>

        {/* Club Title */}
        <h3 style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '1.14rem',
          color: 'var(--text-cream)',
          marginBottom: '8px',
          lineHeight: 1.25,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.8rem'
        }}>
          <Link to={`/clubs/${club.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {club.name}
          </Link>
        </h3>

        {/* Short Description */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.4rem'
        }}>
          {club.short_description || club.description || 'Official student club of BIT Sindri dedicated to fostering technical and campus excellence.'}
        </p>
      </div>

      {/* Card Footer: Metadata and Action CTAs */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        
        {/* Members & Verified Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={13} style={{ color: 'var(--color-gold)' }} />
            <span>{membersCount} members</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-mint)' }}>
            <ShieldCheck size={13} />
            <span>Official</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            to={`/clubs/${club.slug}`}
            className="btn-pixel-gold"
            style={{
              flex: 1,
              padding: '7px 12px',
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
          >
            EXPLORE <ChevronRight size={14} />
          </Link>

          {isRecruiting && !isClubAdmin && (
            <Link
              to={`/clubs/${club.slug}/apply`}
              className="btn-pixel-outline"
              style={{
                padding: '7px 10px',
                fontSize: '0.76rem',
                color: 'var(--color-mint)',
                borderColor: 'rgba(74, 222, 128, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
              title="Apply for induction"
            >
              <Send size={12} /> APPLY
            </Link>
          )}
        </div>

      </div>

    </div>
  );
};
