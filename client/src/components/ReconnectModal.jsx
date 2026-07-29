import React from 'react';
import { WifiOff } from 'lucide-react';

export default function ReconnectModal({ isConnected }) {
  if (isConnected) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999
    }}>
      <div className="glass-panel" style={{
        padding: '30px',
        textAlign: 'center',
        maxWidth: '360px',
        border: '1px solid rgba(239, 68, 68, 0.4)'
      }}>
        <WifiOff size={40} color="#ef4444" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Verbindung unterbrochen</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Versuche neu zu verbinden... Bitte kurz gedulden.
        </p>
      </div>
    </div>
  );
}
