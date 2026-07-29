import React, { useState, useEffect } from 'react';

export default function ActionControls({ gameState, myPlayer, onSendAction }) {
  if (!gameState || !myPlayer || myPlayer.isSpectator || myPlayer.isFolded || myPlayer.chips === 0) {
    return null;
  }

  const isMyTurn = gameState.currentTurnSeatIndex === myPlayer.seatIndex;
  const currentHighBet = gameState.currentHighBet || 0;
  const myCurrentBet = myPlayer.currentBet || 0;
  const callAmount = currentHighBet - myCurrentBet;
  const canCheck = callAmount <= 0;

  const minRaise = Math.max(gameState.minRaise || 0, currentHighBet + gameState.blindInfo.bigBlind);
  const maxRaise = myPlayer.chips + myCurrentBet;

  const [raiseVal, setRaiseVal] = useState(minRaise);

  useEffect(() => {
    setRaiseVal(Math.min(minRaise, maxRaise));
  }, [minRaise, maxRaise, gameState.currentTurnSeatIndex]);

  const handleRaiseSubmit = () => {
    onSendAction('raise', raiseVal);
  };

  const setQuickBet = (multiplier) => {
    const pot = gameState.pot || 0;
    let target = Math.round(currentHighBet * multiplier);
    if (multiplier === 'pot') target = currentHighBet + pot;
    if (multiplier === 'allin') target = maxRaise;

    target = Math.max(minRaise, Math.min(target, maxRaise));
    setRaiseVal(target);
  };

  return (
    <div className="action-controls-bar">
      {/* Raise Slider & Quick Bets */}
      {isMyTurn && maxRaise > minRaise && (
        <div className="slider-row">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
            Erhöhen: {raiseVal} 🪙
          </span>

          <input
            type="range"
            min={minRaise}
            max={maxRaise}
            step={gameState.blindInfo.smallBlind}
            value={raiseVal}
            onChange={(e) => setRaiseVal(Number(e.target.value))}
            className="raise-slider"
          />

          <div className="quick-bet-buttons">
            <button className="quick-btn" onClick={() => setQuickBet(2)}>2x</button>
            <button className="quick-btn" onClick={() => setQuickBet(3)}>3x</button>
            <button className="quick-btn" onClick={() => setQuickBet('pot')}>POT</button>
            <button className="quick-btn" onClick={() => setQuickBet('allin')} style={{ color: 'var(--accent-gold)' }}>ALL-IN</button>
          </div>
        </div>
      )}

      {/* Main Buttons */}
      <div className="action-buttons-group">
        <button
          className="btn-action btn-fold"
          disabled={!isMyTurn}
          onClick={() => onSendAction('fold')}
        >
          Passen (Fold)
        </button>

        {canCheck ? (
          <button
            className="btn-action btn-check-call"
            disabled={!isMyTurn}
            onClick={() => onSendAction('check')}
          >
            Check
          </button>
        ) : (
          <button
            className="btn-action btn-check-call"
            disabled={!isMyTurn}
            onClick={() => onSendAction('call')}
          >
            Mitgehen (Call {callAmount} 🪙)
          </button>
        )}

        {maxRaise > currentHighBet && (
          <button
            className="btn-action btn-raise"
            disabled={!isMyTurn}
            onClick={handleRaiseSubmit}
          >
            {raiseVal >= maxRaise ? 'All-In!' : `Erhöhen auf ${raiseVal} 🪙`}
          </button>
        )}
      </div>
    </div>
  );
}
