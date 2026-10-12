const CLUB_LOGOS = {
  hncc: '/clubs/hncc.jpeg',
  'literary-society': '/clubs/literary-society.jpeg',
  'photographic-club': '/clubs/photographic-club.jpeg',
  'robotics-club': '/clubs/robotics-club.jpeg',
  'sports-club': '/clubs/sports-club.jpeg',
  nss: '/clubs/nss.jpeg'
};

export function resolveClubLogo(club) {
  if (!club) return null;
  if (club.logo_url) return club.logo_url;
  return CLUB_LOGOS[club.slug] || null;
}

export function getCategoryClass(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('tech') || c.includes('code') || c.includes('robot')) return 'tech';
  if (c.includes('cultur') || c.includes('music') || c.includes('drama')) return 'cultural';
  if (c.includes('science') || c.includes('astro')) return 'science';
  if (c.includes('lit') || c.includes('debate')) return 'literary';
  if (c.includes('sport')) return 'sports';
  return 'others';
}

export function getCategoryDisplayTag(cat) {
  const c = (cat || '').toUpperCase();
  if (c.includes('TECH') || c.includes('CODE') || c.includes('ROBOT')) return 'TECH';
  if (c.includes('CULTUR') || c.includes('MUSIC') || c.includes('DRAMA')) return 'CULTURAL';
  if (c.includes('SCIENCE') || c.includes('ASTRO')) return 'SCIENCE';
  if (c.includes('LIT') || c.includes('DEBATE')) return 'LITERARY';
  if (c.includes('SPORT')) return 'SPORTS';
  if (c.includes('SOCIAL') || c.includes('SERVICE') || c.includes('NSS')) return 'SOCIAL';
  return 'OTHERS';
}
