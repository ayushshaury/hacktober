import React from 'react';
import { Link } from 'react-router-dom';
import { ClubArt } from './ClubArt';
import { getCategoryClass, getCategoryDisplayTag } from '../data/clubs';

export const ClubCard = ({ club }) => {
  const catClass = getCategoryClass(club.category);
  const tagText = getCategoryDisplayTag(club.category);
  const membersCount = club.member_count || (80 + ((club.id * 7) % 65));

  return (
    <Link
      to={`/clubs/${club.slug}`}
      className="pixel-card"
      style={{ textDecoration: 'none' }}
    >
      <div className="pixel-card-icon-frame pixel-corner-mark">
        <ClubArt club={club} size={72} fill />

        {club.recruitment_open === 1 && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'var(--color-gold)',
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.64rem',
            fontWeight: 800,
            padding: '2px 6px',
            letterSpacing: '0.04em',
            boxShadow: '1px 1px 0px #8a7329',
            zIndex: 3
          }}>
            OPEN
          </div>
        )}
      </div>

      <h3 style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '1.08rem',
        color: 'var(--text-cream)',
        marginBottom: '8px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '2.7rem',
        lineHeight: 1.25
      }}>
        {club.name}
      </h3>

      <div style={{ marginBottom: '16px' }}>
        <span className={`badge-pixel ${catClass}`}>
          {tagText}
        </span>
      </div>

      <div style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '10px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <span>{membersCount} members</span>
        <span style={{ color: 'var(--color-gold)', fontSize: '1rem', fontWeight: 700 }}>→</span>
      </div>
    </Link>
  );
};
