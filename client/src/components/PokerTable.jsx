import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Copy, Play, Clock, Trophy, BookOpen, Maximize, Minimize, X } from 'lucide-react';
import PlayerSeat from './PlayerSeat';
import ActionControls from './ActionControls';
import GuideModal from './GuideModal';
import Card from './Card';

export default function PokerTable({ roomState, onStartGame, onSendAction, onSendChat, onSendEmoji, onLeaveRoom, activeEmojiBursts }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync native fullscreen changes & handle ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNative = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isNative);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      setIsFullscreen(true);
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      setIsFullscreen(false);
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  if (!roomState || !roomState.gameState) return null;

  const { roomCode, isHost, myPlayerId, gameState, chatMessages } = roomState;
  const { players, communityCards, pot, currentTurnSeatIndex, dealerSeatIndex, state, showdownResult, winner, blindInfo, lastActionAnnouncement } = gameState;

  // Find current player using server-provided myPlayerId
  const myPlayer = players.find(p => p.id === myPlayerId) || players[0];
  const mySeatIndex = myPlayer ? myPlayer.seatIndex : 0;

  // Check if it is currently the local player's turn
  const isMyTurn = state !== 'WAITING' &&
                   state !== 'SHOWDOWN' &&
                   state !== 'ENDED' &&
                   currentTurnSeatIndex === mySeatIndex &&
                   myPlayer && !myPlayer.isFolded && !myPlayer.isSpectator;

  // Celebrate with confetti if tournament ends
  useEffect(() => {
    if (state === 'ENDED' && winner) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [state, winner]);

  // Transform player seats so myPlayer is always at bottom (relativeSeatIndex = 0)
  const getRelativeSeat = (seatIndex) => {
    return (seatIndex - mySeatIndex + 6) % 6;
  };

  const seatsArray = Array(6).fill(null);
  players.forEach(p => {
    const relIndex = getRelativeSeat(p.seatIndex);
    seatsArray[relIndex] = p;
  });

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert(`Raumcode ${roomCode} in die Zwischenablage kopiert!`);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`app-container ${isFullscreen ? 'fullscreen-mode' : ''} ${isMyTurn ? 'is-my-turn' : ''}`}>
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Top Header Bar */}
      <div className="top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="room-badge" onClick={copyRoomCode} style={{ cursor: 'pointer' }}>
            RAUM: {roomCode} <Copy size={13} style={{ marginLeft: '4px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Blue Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Vollbild beenden' : 'Vollbild aktivieren'}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              border: '1px solid rgba(59, 130, 246, 0.6)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            <span>{isFullscreen ? 'Beenden' : 'Vollbild'}</span>
          </button>

          <button
            onClick={() => setIsGuideOpen(true)}
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700
            }}
          >
            <BookOpen size={15} /> Anleitung
          </button>
        </div>
      </div>

      {/* Action Controls Bar - Positioned under Top Header */}
      <ActionControls
        gameState={gameState}
        myPlayer={myPlayer}
        onSendAction={onSendAction}
      />

      {/* Main Table Felt Wrapper */}
      <div className="poker-table-wrapper">
        <div className="poker-felt">
          
          {/* Action Announcement Toast (Positioned at bottom) */}
          {lastActionAnnouncement && state !== 'ENDED' && (
            <div className="action-announcement-toast">
              {lastActionAnnouncement}
            </div>
          )}

          {/* Table Center: Pot & Community Cards */}
          <div className="table-center">
            {state === 'SHOWDOWN' && showdownResult ? (
              <div className="showdown-badge">
                {(() => {
                  const winnerItems = [];
                  showdownResult.details?.forEach(detail => {
                    detail.winners?.forEach(w => {
                      winnerItems.push(w);
                    });
                  });
                  return (
                    <>
                      <div className="showdown-badge-line1">
                        <span className="showdown-badge-title">🎉</span>
                        {winnerItems.map((w, idx) => (
                          <span key={idx} className="showdown-winner-item">
                            {idx > 0 && <span className="showdown-divider">•</span>}
                            <strong className="showdown-winner-name">{w.name}</strong> gewinnt{' '}
                            <span className="showdown-winner-amount">{w.amount} 🪙</span>
                          </span>
                        ))}
                      </div>
                      {winnerItems.some(w => w.desc) && (
                        <div className="showdown-badge-line2">
                          {winnerItems.map((w, idx) => w.desc ? (
                            <span key={idx} className="showdown-winner-desc">
                              {idx > 0 && ' • '}({w.desc})
                            </span>
                          ) : null)}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              pot > 0 && (
                <div className="pot-badge">
                  POT: {pot} 🪙
                </div>
              )
            )}

            <div className="community-cards">
              {communityCards && communityCards.length > 0 ? (
                communityCards.map((c, i) => (
                  <Card key={i} card={c} />
                ))
              ) : (
                <div style={{
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontSize: '0.9rem',
                  fontStyle: 'italic'
                }}>
                  {state === 'WAITING' ? 'Warte auf Spielstart...' : 'Warte auf Flop...'}
                </div>
              )}
            </div>

            {/* Host Start Game Button in WAITING state */}
            {state === 'WAITING' && isHost && (
              <button
                onClick={onStartGame}
                disabled={players.length < 2}
                style={{
                  padding: '12px 28px',
                  borderRadius: '30px',
                  background: players.length >= 2 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: players.length >= 2 ? '0 0 25px rgba(16, 185, 129, 0.4)' : 'none',
                  cursor: players.length >= 2 ? 'pointer' : 'not-allowed'
                }}
              >
                <Play size={18} /> Spiel Starten ({players.length}/6 Spieler)
              </button>
            )}
          </div>

          {/* 6 Player Seats */}
          {seatsArray.map((player, relIndex) => {
            const actualSeatIndex = (relIndex + mySeatIndex) % 6;
            const isTurn = currentTurnSeatIndex === actualSeatIndex;
            const isDealerBtn = dealerSeatIndex === actualSeatIndex;
            const emojiBurst = activeEmojiBursts.find(b => b.seatIndex === actualSeatIndex);

            return (
              <PlayerSeat
                key={relIndex}
                player={player}
                relativeSeatIndex={relIndex}
                isCurrentTurn={isTurn}
                isDealer={isDealerBtn}
                emojiBurst={emojiBurst}
              />
            );
          })}

          {/* Tournament Champion Banner */}
          {state === 'ENDED' && winner && (
            <div className="showdown-banner" style={{ background: 'linear-gradient(135deg, #1e1b4b, #0f172a)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Trophy size={28} color="#f59e0b" />
                <h2 style={{ color: '#f59e0b', fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>
                  TURNIER SIEGER: 👑 {winner.name} 👑
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px', marginBottom: 0 }}>
                Hat alle Chips gewonnen!
              </p>

              {isHost ? (
                <button
                  onClick={onStartGame}
                  style={{
                    marginTop: '16px',
                    padding: '12px 28px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Play size={18} /> Neues Spiel?
                </button>
              ) : (
                <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  Warte auf Raumleiter für ein neues Spiel...
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
