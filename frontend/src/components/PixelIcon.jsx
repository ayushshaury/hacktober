import React from 'react';

/**
 * PixelIcon renders crisp, authentic 16-bit retro vector pixel-art icons
 * matching the exact illustrations in the reference image.
 */
export const PixelIcon = ({ name, size = 64, color, className = '' }) => {
  const iconKey = (name || '').toLowerCase();

  // Pixel BIT Sindri Main Clock Tower & Campus Emblem
  if (iconKey === 'bit-sindri' || iconKey === 'building' || iconKey === 'logo') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Sky / Base */}
        <rect x="13" y="2" width="6" height="3" fill="#F3D063" />
        <rect x="15" y="0" width="2" height="2" fill="#F3D063" />
        {/* Tower Body */}
        <rect x="11" y="5" width="10" height="11" fill="#C2A649" />
        <rect x="12" y="6" width="8" height="9" fill="#0D1620" />
        {/* Clock Face */}
        <circle cx="16" cy="10" r="3" fill="#F3D063" />
        <rect x="15.5" y="8.5" width="1" height="2" fill="#0D1620" />
        <rect x="15.5" y="9.5" width="2" height="1" fill="#0D1620" />
        {/* Main Building Wings */}
        <rect x="4" y="16" width="24" height="14" fill="#C2A649" />
        <rect x="2" y="19" width="28" height="11" fill="#8A7329" />
        {/* Windows */}
        <rect x="6" y="18" width="3" height="3" fill="#F3D063" />
        <rect x="11" y="18" width="3" height="3" fill="#F3D063" />
        <rect x="18" y="18" width="3" height="3" fill="#F3D063" />
        <rect x="23" y="18" width="3" height="3" fill="#F3D063" />
        <rect x="6" y="23" width="3" height="4" fill="#F3D063" />
        <rect x="11" y="23" width="3" height="4" fill="#F3D063" />
        <rect x="18" y="23" width="3" height="4" fill="#F3D063" />
        <rect x="23" y="23" width="3" height="4" fill="#F3D063" />
        {/* Central Entrance */}
        <rect x="14" y="23" width="4" height="7" fill="#090E13" />
      </svg>
    );
  }

  // Pixel Laptop with </ > (Coding / Tech)
  if (iconKey.includes('code') || iconKey.includes('hack') || iconKey.includes('hncc') || iconKey === 'tech') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Laptop Screen Bezel */}
        <rect x="10" y="8" width="28" height="20" fill="#203644" stroke="#38BDF8" strokeWidth="1.5" />
        <rect x="12" y="10" width="24" height="16" fill="#0A1118" />
        {/* </ > Pixel Glyphs */}
        <path d="M16 18 L19 15 V17 L17 18 L19 19 V21 L16 18 Z" fill="#38BDF8" />
        <rect x="23" y="13" width="2" height="10" fill="#38BDF8" transform="rotate(18 24 18)" />
        <path d="M32 18 L29 15 V17 L31 18 L29 19 V21 L32 18 Z" fill="#38BDF8" />
        {/* Laptop Base */}
        <rect x="6" y="28" width="36" height="4" rx="0" fill="#2A4354" />
        <rect x="4" y="32" width="40" height="2" fill="#1B2D38" />
        <rect x="20" y="29" width="8" height="2" fill="#38BDF8" />
      </svg>
    );
  }

  // Pixel Robot (Robotics)
  if (iconKey.includes('robot') || iconKey.includes('tech') || iconKey.includes('iot')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Antenna */}
        <circle cx="24" cy="7" r="2.5" fill="#4ADE80" />
        <rect x="23" y="9" width="2" height="4" fill="#203644" />
        {/* Ears */}
        <rect x="9" y="19" width="3" height="6" fill="#4ADE80" />
        <rect x="36" y="19" width="3" height="6" fill="#4ADE80" />
        {/* Head */}
        <rect x="12" y="13" width="24" height="18" fill="#1C303E" stroke="#4ADE80" strokeWidth="1.5" />
        {/* Eyes */}
        <rect x="16" y="18" width="5" height="4" fill="#4ADE80" />
        <rect x="27" y="18" width="5" height="4" fill="#4ADE80" />
        {/* Mouth / Grid */}
        <rect x="17" y="26" width="14" height="2" fill="#4ADE80" />
        <rect x="20" y="25" width="2" height="4" fill="#1C303E" />
        <rect x="26" y="25" width="2" height="4" fill="#1C303E" />
        {/* Body Base */}
        <rect x="16" y="33" width="16" height="8" fill="#162733" stroke="#243C4D" strokeWidth="1" />
        <rect x="20" y="36" width="8" height="2" fill="#4ADE80" />
      </svg>
    );
  }

  // Pixel Retro Camera (Photography)
  if (iconKey.includes('photo') || iconKey.includes('camera') || iconKey.includes('lens')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Camera Top Details & Flash */}
        <rect x="13" y="11" width="8" height="4" fill="#F07167" />
        <rect x="28" y="12" width="6" height="3" fill="#F3D063" />
        {/* Camera Body */}
        <rect x="8" y="15" width="32" height="20" fill="#221C26" stroke="#F07167" strokeWidth="1.5" />
        <rect x="10" y="17" width="28" height="4" fill="#F07167" opacity="0.8" />
        {/* Lens Outer Ring */}
        <circle cx="24" cy="26" r="7" fill="#120E16" stroke="#F07167" strokeWidth="1.5" />
        <circle cx="24" cy="26" r="4.5" fill="#38BDF8" opacity="0.7" />
        <circle cx="22" cy="24" r="1.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // Pixel Electric Guitar (Music Society)
  if (iconKey.includes('music') || iconKey.includes('guitar') || iconKey.includes('band')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Headstock */}
        <rect x="34" y="6" width="6" height="8" fill="#F07167" />
        <rect x="33" y="7" width="2" height="2" fill="#F3D063" />
        <rect x="33" y="11" width="2" height="2" fill="#F3D063" />
        {/* Neck */}
        <rect x="24" y="13" width="12" height="4" fill="#C2A649" transform="rotate(-35 30 15)" />
        {/* Guitar Body */}
        <path d="M12 24 C10 27 10 32 13 36 C16 40 22 40 25 36 C28 32 26 27 23 25 C20 23 14 21 12 24 Z" fill="#F07167" stroke="#FFA69E" strokeWidth="1.5" />
        {/* Pickguard & Pickups */}
        <circle cx="18" cy="30" r="3" fill="#1C1420" />
        <rect x="16" y="27" width="4" height="1.5" fill="#F3D063" />
        <rect x="16" y="31" width="4" height="1.5" fill="#F3D063" />
      </svg>
    );
  }

  // Pixel Saturn Planet (Astronomy Club / Science)
  if (iconKey.includes('astro') || iconKey.includes('science') || iconKey.includes('space')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Stars */}
        <rect x="9" y="12" width="2" height="2" fill="#F3D063" />
        <rect x="38" y="10" width="2" height="2" fill="#C084FC" />
        <rect x="36" y="35" width="2" height="2" fill="#38BDF8" />
        <rect x="8" y="32" width="1.5" height="1.5" fill="#FFFFFF" />
        {/* Planet Sphere */}
        <circle cx="24" cy="24" r="10" fill="#3B1C5A" stroke="#C084FC" strokeWidth="1.5" />
        <path d="M16 22 Q24 26 32 22" stroke="#A855F7" strokeWidth="1.5" fill="none" />
        {/* Saturn Rings */}
        <ellipse cx="24" cy="24" rx="18" ry="5.5" stroke="#E9D5FF" strokeWidth="1.8" fill="none" transform="rotate(-22 24 24)" />
      </svg>
    );
  }

  // Pixel Theater Drama Masks (Drama Club / Cultural)
  if (iconKey.includes('drama') || iconKey.includes('theatre') || iconKey.includes('cultural')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Comedy Mask (Left, Purple) */}
        <rect x="8" y="14" width="16" height="20" rx="3" fill="#4C1D95" stroke="#C084FC" strokeWidth="1.5" />
        {/* Eyes */}
        <rect x="11" y="19" width="3" height="3" fill="#F3D063" />
        <rect x="18" y="19" width="3" height="3" fill="#F3D063" />
        {/* Smile */}
        <path d="M11 27 Q16 32 21 27" stroke="#F3D063" strokeWidth="2" fill="none" />

        {/* Tragedy Mask (Right, Coral) */}
        <rect x="24" y="16" width="16" height="20" rx="3" fill="#7F1D1D" stroke="#F07167" strokeWidth="1.5" />
        {/* Eyes */}
        <rect x="27" y="21" width="3" height="3" fill="#FCD34D" />
        <rect x="34" y="21" width="3" height="3" fill="#FCD34D" />
        {/* Frown */}
        <path d="M27 31 Q32 26 37 31" stroke="#FCD34D" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  // Pixel Financial Growth Chart (Finance & Investment)
  if (iconKey.includes('fin') || iconKey.includes('invest') || iconKey.includes('money')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Chart Frame */}
        <rect x="8" y="34" width="32" height="2" fill="#203644" />
        <rect x="8" y="10" width="2" height="26" fill="#203644" />
        {/* Bars */}
        <rect x="13" y="26" width="4" height="8" fill="#C2A649" />
        <rect x="20" y="20" width="4" height="14" fill="#D4B54E" />
        <rect x="27" y="15" width="4" height="19" fill="#F3D063" />
        {/* Rising Arrow */}
        <path d="M12 24 L21 16 L29 13 L36 9" stroke="#F3D063" strokeWidth="2" fill="none" strokeDasharray="1 0" />
        <path d="M32 9 H36 V13" stroke="#F3D063" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  // Pixel Vintage Microphone (Debate / Literary)
  if (iconKey.includes('debate') || iconKey.includes('literary') || iconKey.includes('speak') || iconKey.includes('mic')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Mic Capsule */}
        <rect x="19" y="8" width="10" height="16" rx="4" fill="#7C2D12" stroke="#FB923C" strokeWidth="1.5" />
        <line x1="19" y1="13" x2="29" y2="13" stroke="#FDBA74" strokeWidth="1" />
        <line x1="19" y1="17" x2="29" y2="17" stroke="#FDBA74" strokeWidth="1" />
        <line x1="24" y1="9" x2="24" y2="23" stroke="#FDBA74" strokeWidth="1" />
        {/* U-Shape Cradle */}
        <path d="M16 16 V22 C16 26.4 19.6 30 24 30 C28.4 30 32 26.4 32 22 V16" stroke="#FB923C" strokeWidth="1.8" fill="none" />
        {/* Stand & Base */}
        <rect x="23" y="30" width="2" height="6" fill="#FB923C" />
        <rect x="16" y="36" width="16" height="3" fill="#FB923C" rx="1" />
      </svg>
    );
  }

  // Pixel Sports / Trophy / Gaming
  if (iconKey.includes('sport') || iconKey.includes('game') || iconKey.includes('esport')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Gamepad */}
        <rect x="8" y="16" width="32" height="18" rx="4" fill="#1E293B" stroke="#F3D063" strokeWidth="1.5" />
        {/* D-Pad */}
        <rect x="14" y="21" width="3" height="8" fill="#F3D063" />
        <rect x="11.5" y="23.5" width="8" height="3" fill="#F3D063" />
        {/* Action Buttons */}
        <circle cx="31" cy="23" r="1.8" fill="#F07167" />
        <circle cx="35" cy="27" r="1.8" fill="#38BDF8" />
        {/* Center Select/Start */}
        <rect x="22" y="25" width="4" height="1.5" fill="#94A3B8" />
      </svg>
    );
  }

  // Pixel Racing Car (SAE India / Automotive)
  if (iconKey.includes('sae') || iconKey.includes('auto') || iconKey.includes('car') || iconKey.includes('baja')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Car Body */}
        <rect x="8" y="22" width="32" height="10" fill="#E11D48" />
        <rect x="14" y="16" width="16" height="6" fill="#F43F5E" />
        <rect x="18" y="18" width="6" height="4" fill="#38BDF8" />
        <rect x="28" y="20" width="8" height="2" fill="#F3D063" />
        {/* Rear Wing */}
        <rect x="6" y="15" width="4" height="2" fill="#F3D063" />
        <rect x="7" y="17" width="2" height="5" fill="#94A3B8" />
        {/* Wheels */}
        <rect x="10" y="28" width="8" height="8" rx="2" fill="#0F172A" stroke="#F3D063" strokeWidth="1" />
        <rect x="30" y="28" width="8" height="8" rx="2" fill="#0F172A" stroke="#F3D063" strokeWidth="1" />
        <circle cx="14" cy="32" r="1.5" fill="#F3D063" />
        <circle cx="34" cy="32" r="1.5" fill="#F3D063" />
      </svg>
    );
  }

  // Pixel Microchip / Circuit (IETE / IEEE / ECE / EES)
  if (iconKey.includes('iete') || iconKey.includes('ieee') || iconKey.includes('ece') || iconKey.includes('circuit') || iconKey.includes('chip') || iconKey.includes('electr')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Chip Body */}
        <rect x="14" y="14" width="20" height="20" fill="#0F172A" stroke="#22D3EE" strokeWidth="1.5" />
        <rect x="18" y="18" width="12" height="12" fill="#164E63" stroke="#F3D063" strokeWidth="1" />
        <circle cx="24" cy="24" r="2.5" fill="#F3D063" />
        {/* Pins Top & Bottom */}
        <rect x="18" y="9" width="2" height="5" fill="#22D3EE" />
        <rect x="23" y="9" width="2" height="5" fill="#22D3EE" />
        <rect x="28" y="9" width="2" height="5" fill="#22D3EE" />
        <rect x="18" y="34" width="2" height="5" fill="#22D3EE" />
        <rect x="23" y="34" width="2" height="5" fill="#22D3EE" />
        <rect x="28" y="34" width="2" height="5" fill="#22D3EE" />
        {/* Pins Left & Right */}
        <rect x="9" y="18" width="5" height="2" fill="#22D3EE" />
        <rect x="9" y="23" width="5" height="2" fill="#22D3EE" />
        <rect x="9" y="28" width="5" height="2" fill="#22D3EE" />
        <rect x="34" y="18" width="5" height="2" fill="#22D3EE" />
        <rect x="34" y="23" width="5" height="2" fill="#22D3EE" />
        <rect x="34" y="28" width="5" height="2" fill="#22D3EE" />
      </svg>
    );
  }

  // Pixel Chemical Flask (Quimica / Chemical)
  if (iconKey.includes('quim') || iconKey.includes('chem')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Lip & Neck */}
        <rect x="20" y="8" width="8" height="2" fill="#38BDF8" />
        <rect x="22" y="10" width="4" height="10" fill="#0E2433" stroke="#38BDF8" strokeWidth="1" />
        {/* Flask Triangular Body */}
        <path d="M22 20 L11 36 C10 38 12 40 14 40 H34 C36 40 38 38 37 36 L26 20 Z" fill="#0C1B2A" stroke="#38BDF8" strokeWidth="1.5" />
        {/* Bubbling Chemical Liquid */}
        <path d="M14 36 L17 30 Q24 28 31 30 L34 36 Z" fill="#4ADE80" opacity="0.85" />
        <circle cx="21" cy="32" r="1.5" fill="#FFFFFF" />
        <circle cx="27" cy="27" r="1.2" fill="#4ADE80" />
        <circle cx="24" cy="22" r="1" fill="#4ADE80" />
      </svg>
    );
  }

  // Pixel Eco Leaf / Plant (Eco Club)
  if (iconKey.includes('eco') || iconKey.includes('green') || iconKey.includes('plant') || iconKey.includes('nature')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Stem */}
        <path d="M24 38 Q24 28 20 20" stroke="#15803D" strokeWidth="2" fill="none" />
        {/* Right Leaf */}
        <path d="M24 28 Q34 26 34 16 Q24 18 24 28 Z" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5" />
        {/* Left Leaf */}
        <path d="M22 22 Q12 18 14 10 Q24 12 22 22 Z" fill="#4ADE80" stroke="#22C55E" strokeWidth="1.5" />
        {/* Soil Base */}
        <rect x="16" y="38" width="16" height="4" fill="#78350F" rx="1" />
      </svg>
    );
  }

  // Pixel Artist Palette (Painting Wing / Design)
  if (iconKey.includes('paint') || iconKey.includes('art') || iconKey.includes('design')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Palette Board */}
        <path d="M12 24 C10 16 20 8 30 10 C38 12 40 22 36 30 C33 36 24 38 18 36 C14 34 10 30 12 24 Z" fill="#33241C" stroke="#F3D063" strokeWidth="1.5" />
        {/* Paint Daubs */}
        <circle cx="20" cy="16" r="2.5" fill="#EF4444" />
        <circle cx="28" cy="16" r="2.5" fill="#F3D063" />
        <circle cx="34" cy="24" r="2.5" fill="#3B82F6" />
        <circle cx="28" cy="30" r="2.5" fill="#10B981" />
        {/* Thumb Hole */}
        <circle cx="18" cy="27" r="3" fill="#0D1620" stroke="#F3D063" strokeWidth="1" />
      </svg>
    );
  }

  // Pixel Open Book & Editorial Quill (Sarjana / Literary)
  if (iconKey.includes('sarjana') || iconKey.includes('mag') || iconKey.includes('journal') || iconKey.includes('book') || iconKey.includes('prayaas')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Open Book Left & Right Pages */}
        <polygon points="10,16 23,19 23,36 10,33" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />
        <polygon points="38,16 25,19 25,36 38,33" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />
        {/* Book Spine */}
        <rect x="23" y="19" width="2" height="17" fill="#78350F" />
        {/* Text lines */}
        <line x1="13" y1="22" x2="20" y2="23" stroke="#92400E" strokeWidth="1" />
        <line x1="13" y1="26" x2="20" y2="27" stroke="#92400E" strokeWidth="1" />
        <line x1="13" y1="30" x2="19" y2="31" stroke="#92400E" strokeWidth="1" />
        <line x1="28" y1="23" x2="35" y2="22" stroke="#92400E" strokeWidth="1" />
        <line x1="28" y1="27" x2="35" y2="26" stroke="#92400E" strokeWidth="1" />
        <line x1="28" y1="31" x2="34" y2="30" stroke="#92400E" strokeWidth="1" />
      </svg>
    );
  }

  // Pixel Community / Social Heart & Hand (Rotaract / LEO / GRS / Social)
  if (iconKey.includes('rotaract') || iconKey.includes('leo') || iconKey.includes('gandhi') || iconKey.includes('social')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Heart */}
        <path d="M24 18 C22 14 16 12 13 16 C9 21 15 28 24 35 C33 28 39 21 35 16 C32 12 26 14 24 18 Z" fill="#F43F5E" stroke="#FDA4AF" strokeWidth="1.5" />
        {/* Golden Wings / Hands */}
        <rect x="6" y="24" width="8" height="3" fill="#F3D063" />
        <rect x="8" y="27" width="8" height="3" fill="#F3D063" />
        <rect x="34" y="24" width="8" height="3" fill="#F3D063" />
        <rect x="32" y="27" width="8" height="3" fill="#F3D063" />
      </svg>
    );
  }

  // Pixel Industrial Gears & Mechanical (MES / PIE / Civil / Mining)
  if (iconKey.includes('mech') || iconKey.includes('product') || iconKey.includes('civil') || iconKey.includes('sme') || iconKey.includes('mine') || iconKey.includes('dhatvika') || iconKey.includes('iste') || iconKey.includes('iic')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
        {/* Large Gear */}
        <circle cx="21" cy="21" r="10" fill="#1E293B" stroke="#F3D063" strokeWidth="1.5" />
        <circle cx="21" cy="21" r="4" fill="#0D1620" stroke="#F3D063" strokeWidth="1.2" />
        {/* Gear Teeth */}
        <rect x="19" y="8" width="4" height="4" fill="#F3D063" />
        <rect x="19" y="30" width="4" height="4" fill="#F3D063" />
        <rect x="8" y="19" width="4" height="4" fill="#F3D063" />
        <rect x="30" y="19" width="4" height="4" fill="#F3D063" />
        {/* Small Gear */}
        <circle cx="33" cy="33" r="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
        <circle cx="33" cy="33" r="2.5" fill="#0D1620" />
      </svg>
    );
  }

  // Default Fallback Pixel Badge
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="10" width="28" height="28" fill="#162733" stroke="#F3D063" strokeWidth="1.5" />
      <rect x="16" y="16" width="16" height="16" fill="#0D1620" />
      <rect x="20" y="20" width="8" height="8" fill="#F3D063" />
    </svg>
  );
};

