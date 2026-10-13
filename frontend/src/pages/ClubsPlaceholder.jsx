import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

export const ClubsPlaceholder = () => {
  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }}>
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '16px' }}>
          <Compass size={28} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Club Directory</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 20px auto' }}>
          Foundation Phase 1 active. Verified club directory dataset (28 clubs: HnCC, Model Club, IETE, ISTE, IEEE, SAE, MES, ACE, SME, EES, ECE, PIE, Quimica, Dhatvika, Sarjana, IIC (Institution Innovation Council), Arts Club, Eco Club, GRS, LEOs, LitSoc, Photo Club, Painting Wing, Prayaas, Rotaract, Sports Club, NSS, Robotics Club) will be populated in Phase 2.
        </p>
        <span style={{ fontSize: '0.82rem', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', fontWeight: 600 }}>
          Phase 1 Foundation Operational
        </span>
      </div>
    </div>
  );
};
