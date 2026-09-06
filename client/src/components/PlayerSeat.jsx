import React from 'react';
import Card from './Card';

export default function PlayerSeat({ player, relativeSeatIndex, isCurrentTurn, isDealer, emojiBurst }) {
  if (!player) {
    return (
      <div className={`player-seat seat-${relativeSeatIndex}`} style={{ opacity: 0.3 }}>
        <div className="player-box" style={{ borderStyle: 'dashed' }}>
          <div className="player-avatar" style={{ background: '#334155' }}>?</div>
          <div className="player-name">Frei</div>
        </div>
      </div>
    );
  }

  const isFolded = player.isFolded;
  const isSpectator = player.isSpectator;

  return (
    <div className={`player-seat seat-${relativeSeatIndex}`}>
      {/* Emoji Burst overlay if active */}
      {emojiBurst && (
        <div className="emoji-burst">
          {emojiBurst.emoji}
        </div>
      )}

      {/* Hole Cards */}
      {!isSpectator && player.cards && player.cards.length > 0 && (
        <div className="seat-cards">
          {player.cards.map((c, i) => (
            <Card key={i} card={c} />
          ))}
        </div>
      )}

      {/* Main Box */}
      <div className={`player-box ${isCurrentTurn ? 'turn-active' : ''} ${isFolded ? 'folded' : ''} ${player.isDisconnected ? 'disconnected' : ''}`}>
        {isDealer && <div className="badge-dealer">D</div>}
        
        <div className="player-avatar">
          {player.name.charAt(0).toUpperCase()}
        </div>

        <div className="player-name">{player.name}</div>
        
        <div className="player-chips">
          {isSpectator ? 'Zuschauer' : `${player.chips} 🪙`}
        </div>

        {player.lastAction && (
          <div className="action-bubble">
            {player.lastAction}
          </div>
        )}
      </div>
    </div>
  );
}
