import React, { useState, useEffect } from 'react';
import { Play, Users, ShieldCheck, Trophy, Sparkles, BookOpen, Maximize, Minimize } from 'lucide-react';
import GuideModal from './GuideModal';

export default function Lobby({ onCreateRoom, onJoinRoom, errorMsg, setErrorMsg }) {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('menu'); // 'menu' | 'join'
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    // Check if URL has ?room=CODE parameter
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      setRoomCode(roomParam.toUpperCase());
      setMode('join');
    }
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('Bitte gib einen Spitznamen ein!');
      return;
    }
    onCreateRoom(nickname.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('Bitte gib deinen Spitznamen ein!');
      return;
    }
    if (!roomCode.trim()) {
      setErrorMsg('Bitte gib den Raumcode ein!');
      return;
    }
    onJoinRoom(roomCode.trim(), nickname.trim());
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '32px 28px' }}>
        {/* Top Header Controls (Guide & Fullscreen) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <BookOpen size={15} /> Spielanleitung
          </button>

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
        </div>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '4px',
            textShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
          }}>
            ♠♥♦♣
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Poker Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Sit & Go Texas Hold'em für private Runden
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Input Nickname */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Dein Spitzname
          </label>
          <input
            type="text"
            placeholder="z. B. PokerAce99"
            maxLength={14}
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600
            }}
          />
        </div>

        {/* Action Options */}
        {mode === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleCreate}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                fontWeight: 800,
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Sparkles size={20} /> Neuer Tisch erstellen
            </button>

            <button
              onClick={() => setMode('join')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <Users size={20} /> Raum beitreten
            </button>

            <button
              onClick={() => setIsGuideOpen(true)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#fbbf24',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                marginTop: '4px'
              }}
            >
              <BookOpen size={18} /> Spielanleitung & Regeln
            </button>
          </div>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Raumcode eingeben
              </label>
              <input
                type="text"
                placeholder="z. B. PKRX"
                maxLength={4}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#fbbf24',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  textAlign: 'center'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setMode('menu')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  fontWeight: 700
                }}
              >
                Zurück
              </button>

              <button
                type="submit"
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Play size={18} /> Beitreten
              </button>
            </div>
          </form>
        )}

        {/* Quick Testing Instructions */}
        <div style={{
          marginTop: '28px',
          padding: '12px 14px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '12px',
          fontSize: '0.82rem',
          color: '#fbbf24',
          lineHeight: 1.4
        }}>
          💡 <strong>Tipp für 2 Spieler auf 1 PC:</strong><br />
          Erstelle in Tab 1 einen Raum. Öffne dann ein <strong>2. Tab (oder ein 2. Fenster)</strong>, klicke auf &quot;Raum beitreten&quot; und gib den Raumcode ein.
        </div>
      </div>
    </div>
  );
}
