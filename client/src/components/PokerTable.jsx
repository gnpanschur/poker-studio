import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Copy, LogOut, Play, Clock, Trophy, BookOpen, Maximize, Minimize } from 'lucide-react';
import PlayerSeat from './PlayerSeat';
import ActionControls from './ActionControls';
import GuideModal from './GuideModal';

const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };

function Card({ card }) {
  if (!card) return null;
  const isRed = card.suit === 'h' || card.suit === 'd';
  return (
    <div className={`playing-card ${isRed ? 'red' : 'black'} animate-deal`}>
      <div className="card-corner-top">
        <span>{card.name ? card.name.slice(0, -1) : card.value}</span>
      </div>
      <div className="card-suit-center">
        {SUIT_SYMBOLS[card.suit] || card.suit}
      </div>
    </div>
  );
}

export default function PokerTable({ roomState, onStartGame, onSendAction, onSendChat, onSendEmoji, onLeaveRoom, activeEmojiBursts }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
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
    <div className="app-container">
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Top Header Bar */}
      <div className="top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brand-title">
            <span>♠</span> Poker Studio
          </div>
          <div className="room-badge" onClick={copyRoomCode} style={{ cursor: 'pointer' }}>
            RAUM: {roomCode} <Copy size={13} style={{ marginLeft: '4px' }} />
          </div>
        </div>

        {/* Blind Timer Widget */}
        {blindInfo && (
          <div className="blind-timer-widget">
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Blinds: </span>
              <strong style={{ color: '#fff' }}>{blindInfo.smallBlind}/{blindInfo.bigBlind} 🪙</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} color="var(--accent-gold)" />
              <span className="timer-count">{formatTime(blindInfo.remainingSeconds)}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              (Nächste: {blindInfo.nextSmallBlind}/{blindInfo.nextBigBlind})
            </div>
          </div>
        )}

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

          <button
            onClick={onLeaveRoom}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600
            }}
          >
            <LogOut size={16} /> Verlassen
          </button>
        </div>
      </div>

      {/* Main Table Felt Wrapper */}
      <div className="poker-table-wrapper">
        <div className="poker-felt">
          
          {/* Action Announcement Toast on top of felt */}
          {lastActionAnnouncement && state !== 'SHOWDOWN' && state !== 'ENDED' && (
            <div className="action-announcement-toast animate-deal">
              {lastActionAnnouncement}
            </div>
          )}

          {/* Table Center: Pot & Community Cards */}
          <div className="table-center">
            {pot > 0 && (
              <div className="pot-badge">
                POT: {pot} 🪙
              </div>
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

          {/* Showdown / Winner Overlay */}
          {state === 'SHOWDOWN' && showdownResult && (
            <div className="showdown-banner">
              <h3 style={{ color: 'var(--accent-gold)', marginBottom: '8px', fontSize: '1.3rem' }}>
                🎉 Showdown Ergebnisse
              </h3>
              {showdownResult.details.map((detail, idx) => (
                <div key={idx} style={{ fontSize: '0.95rem', margin: '4px 0' }}>
                  {detail.winners.map(w => (
                    <div key={w.id} style={{ color: '#fff' }}>
                      <strong>{w.name}</strong> gewinnt {w.amount} 🪙 ({w.desc})
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Tournament Champion Banner */}
          {state === 'ENDED' && winner && (
            <div className="showdown-banner" style={{ background: 'linear-gradient(135deg, #1e1b4b, #0f172a)' }}>
              <Trophy size={48} color="#f59e0b" style={{ margin: '0 auto 10px' }} />
              <h2 style={{ color: '#f59e0b', fontSize: '1.6rem', fontWeight: 900 }}>
                TURNIER SIEGER!
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800, marginTop: '6px' }}>
                👑 {winner.name} 👑
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Hat alle Chips gewonnen!
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Action Controls Bar */}
      <ActionControls
        gameState={gameState}
        myPlayer={myPlayer}
        onSendAction={onSendAction}
      />
    </div>
  );
}
