import React from 'react';
import { PixelIcon } from './PixelIcon';
import { resolveClubLogo } from '../data/clubs';

export const ClubArt = ({ club, size = 54, fill = false }) => {
  const src = resolveClubLogo(club);

  if (src) {
    return (
      <img
        src={src}
        alt={club?.name || 'Club'}
        className="pixel-card-logo"
        style={fill ? { width: '100%', height: '100%' } : { width: size, height: size }}
      />
    );
  }

  return <PixelIcon name={club?.slug || club?.category} size={size} />;
};
