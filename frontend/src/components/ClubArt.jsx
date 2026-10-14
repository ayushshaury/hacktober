import React from 'react';
import { PixelIcon } from './PixelIcon';
import { resolveClubLogo, getCategoryClass } from '../data/clubs';

export const ClubArt = ({ club, size = 54, fill = false }) => {
  const src = resolveClubLogo(club);
  const catClass = getCategoryClass(club?.category);

  // Category glow palette
  const glowMap = {
    tech: 'rgba(56, 189, 248, 0.25)',
    cultural: 'rgba(240, 113, 103, 0.25)',
    sports: 'rgba(74, 222, 128, 0.25)',
    literary: 'rgba(192, 132, 252, 0.25)',
    science: 'rgba(243, 208, 99, 0.25)',
    others: 'rgba(243, 208, 99, 0.18)'
  };
  const glowColor = glowMap[catClass] || 'rgba(243, 208, 99, 0.18)';

  if (src) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img
          src={src}
          alt={club?.name || 'Club'}
          className="pixel-card-logo"
          style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : { width: size, height: size, objectFit: 'contain' }}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: `radial-gradient(circle at center, ${glowColor} 0%, rgba(6, 10, 15, 0.9) 75%)`,
      transition: 'all 0.3s ease'
    }}>
      <PixelIcon name={club?.slug || club?.category} size={size} />
    </div>
  );
};
