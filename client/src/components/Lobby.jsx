import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Maximize, Minimize, Share2, Copy } from 'lucide-react';
import GuideModal from './GuideModal';
import { GAME_LOBBY_CONFIG } from '../config/lobbyConfig';
import '../styles/lobby.css';

export default function Lobby({
  onCreateRoom,
  onJoinRoom,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
  lobbyState,
  socketId,
  errorMsg,
  setErrorMsg
}) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUrlJoin, setIsUrlJoin] = useState(false);

  // Fullscreen toggle state handling
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

  // Load saved name & check URL room parameter (?room=CODE or ?code=CODE)
  const getSavedPlayerName = () => {
    return localStorage.getItem(GAME_LOBBY_CONFIG.storageKeyName) ||
           localStorage.getItem('lobby_player_name') ||
           localStorage.getItem('player_name') ||
           sessionStorage.getItem(GAME_LOBBY_CONFIG.storageKeyName) || '';
  };

  // Load saved name & check URL room parameter (?room=CODE or ?code=CODE)
  useEffect(() => {
    const savedName = getSavedPlayerName();
    if (savedName) setPlayerName(savedName);

    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room') || urlParams.get('code');
    if (roomParam) {
      const code = roomParam.trim().toUpperCase();
      setRoomCode(code);
      setIsUrlJoin(true);

      // Automatisches Beitreten wenn vorhergehender Name bereits gespeichert ist
      if (savedName && code.length === 4) {
        const timer = setTimeout(() => {
          onJoinRoom(code, savedName);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const savePlayerName = (name) => {
    if (!name) return;
    localStorage.setItem(GAME_LOBBY_CONFIG.storageKeyName, name);
    localStorage.setItem('lobby_player_name', name);
    localStorage.setItem('player_name', name);
    sessionStorage.setItem(GAME_LOBBY_CONFIG.storageKeyName, name);
  };

  const getEffectivePlayerName = () => {
    const trimmed = playerName.trim();
    if (trimmed) return trimmed;
    return getSavedPlayerName().trim();
  };

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

  const handleCreateRoom = (e) => {
    if (e) e.preventDefault();
    const name = getEffectivePlayerName();
    if (!name) {
      setErrorMsg('Bitte gib einen Spielernamen ein!');
      return;
    }
    savePlayerName(name);
    onCreateRoom(name);
  };

  const handleJoinRoom = (e) => {
    if (e) e.preventDefault();
    const name = getEffectivePlayerName();
    const code = roomCode.trim().toUpperCase();
    if (!name) {
      setErrorMsg('Bitte gib einen Spielernamen ein!');
      return;
    }
    if (!code || code.length !== 4) {
      setErrorMsg('Bitte gib einen gültigen 4-stelligen Raumcode ein!');
      return;
    }
    savePlayerName(name);

    onJoinRoom(code, name);
  };

  const handleCopyCode = () => {
    if (!lobbyState?.code) return;
    navigator.clipboard.writeText(lobbyState.code).then(() => {
      alert(`Raumcode ${lobbyState.code} in die Zwischenablage kopiert!`);
    });
  };

  const handleShareWhatsApp = () => {
    if (!lobbyState?.code) return;
    const joinUrl = `${window.location.origin}${window.location.pathname}?room=${lobbyState.code}`;
    const shareText = `Tritt meiner Poker-Runde bei:\n${joinUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const isHost = lobbyState?.players?.find(p => p.id === socketId)?.isHost || false;
  const me = lobbyState?.players?.find(p => p.id === socketId);

  return (
    <div className="lobby-container">
      {/* Background Glow */}
      <div className="bg-glow"></div>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Top Header Controls (Guide & Fullscreen) */}
      <div style={{
        width: '100%',
        maxWidth: '540px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        zIndex: 2
      }}>
        <button
          onClick={() => setIsGuideOpen(true)}
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#fbbf24',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <BookOpen size={16} /> Spielanleitung
        </button>

        <button
          onClick={toggleFullscreen}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          <span>{isFullscreen ? 'Beenden' : 'Vollbild'}</span>
        </button>
      </div>

      {/* ================= LOGIN SCREEN (WENN DIESER CLIENT NOCH IN KEINEM LOBBY-RAUM IST) ================= */}
      {!lobbyState ? (
        <section style={{ display: 'flex', width: '100%', justifyContent: 'center', zIndex: 2 }}>
          <div className="card-glass login-box">
            {/* Logo Title with Floating Letter Animations */}
            <div className="logo-title">
              {GAME_LOBBY_CONFIG.logoLetters.map((l, index) => (
                <span key={index} className="letter">{l.text}</span>
              ))}
            </div>
            <p className="subtitle">{GAME_LOBBY_CONFIG.subtitle}</p>

            <div className="form-group">
              <label htmlFor="player-name-input">Dein Spielername</label>
              <input
                type="text"
                id="player-name-input"
                className="lobby-input"
                placeholder="z. B. PokerAce"
                maxLength={14}
                value={playerName}
                onChange={(e) => {
                  const val = e.target.value;
                  setPlayerName(val);
                  if (val.trim()) {
                    savePlayerName(val.trim());
                  }
                  if (errorMsg) setErrorMsg(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (isUrlJoin || roomCode.trim()) {
                      handleJoinRoom();
                    } else {
                      handleCreateRoom();
                    }
                  }
                }}
              />
            </div>

            <div className="action-buttons">
              {!isUrlJoin && (
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="btn btn-primary btn-glow"
                  style={{ width: '100%' }}
                >
                  <span className="icon">✨</span> Raum Erstellen
                </button>
              )}

              {!isUrlJoin && (
                <div className="divider"><span>ODER</span></div>
              )}

              <div className="join-group">
                <input
                  type="text"
                  className="lobby-input"
                  placeholder="CODE"
                  maxLength={4}
                  value={roomCode}
                  readOnly={isUrlJoin}
                  style={isUrlJoin ? { background: 'rgba(255, 255, 255, 0.1)', cursor: 'not-allowed' } : {}}
                  onChange={(e) => {
                    setRoomCode(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase());
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleJoinRoom();
                  }}
                />
                <button
                  type="button"
                  onClick={handleJoinRoom}
                  className={`btn btn-success ${isUrlJoin ? 'btn-glow' : ''}`}
                >
                  {isUrlJoin ? `Raum ${roomCode} Beitreten 🚀` : 'Beitreten'}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="error-message">{errorMsg}</div>
            )}
          </div>
        </section>
      ) : (
        /* ================= LOBBY SCREEN (RAUM ERSTELLT ODER BEIGETRETEN) ================= */
        <section style={{ display: 'flex', width: '100%', justifyContent: 'center', zIndex: 2 }}>
          <div className="card-glass lobby-box">
            <header className="lobby-header">
              <h2>SPIEL-LOBBY</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  onClick={handleShareWhatsApp}
                  className="btn-icon btn-whatsapp"
                  title="Raumcode per WhatsApp teilen"
                >
                  <Share2 size={18} />
                </button>
                <div
                  className="room-code-badge"
                  onClick={handleCopyCode}
                  title="Klicken zum Kopieren"
                >
                  <span>RAUMCODE:</span>
                  <strong>{lobbyState.code}</strong>
                  <button className="btn-icon" style={{ width: '26px', height: '26px', fontSize: '0.85rem' }}>
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </header>

            <div className="players-section">
              <h3>Spieler im Raum ({lobbyState.players?.length || 0}/{GAME_LOBBY_CONFIG.maxPlayers})</h3>
              <ul className="players-grid">
                {lobbyState.players?.map((p) => {
                  const isPlayerHost = p.isHost;
                  return (
                    <li key={p.id} className="player-card">
                      <div className="player-info">
                        <div className="avatar-circle">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <strong style={{ color: p.id === socketId ? '#18dcff' : '#fff' }}>
                          {p.name} {p.id === socketId ? ' (Du)' : ''}
                        </strong>
                      </div>
                      <div>
                        {isPlayerHost ? (
                          <span className="badge badge-host">HOST</span>
                        ) : p.isReady ? (
                          <span className="badge badge-ready">BEREIT</span>
                        ) : (
                          <span className="badge badge-waiting">WARTET</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="lobby-footer">
              {!isHost ? (
                <button
                  onClick={onToggleReady}
                  className={`btn ${me?.isReady ? 'btn-success' : 'btn-secondary'}`}
                >
                  {me?.isReady ? 'Bereit ✓' : 'Nicht bereit'}
                </button>
              ) : (
                <button
                  onClick={onStartGame}
                  disabled={!lobbyState.canStart}
                  className="btn btn-success btn-glow"
                  style={{
                    opacity: lobbyState.canStart ? 1 : 0.6,
                    cursor: lobbyState.canStart ? 'pointer' : 'not-allowed'
                  }}
                  title={lobbyState.canStart ? 'Spiel starten' : (lobbyState.startReason || '')}
                >
                  <Play size={18} /> Spiel Starten 🚀
                </button>
              )}

              <button onClick={onLeaveRoom} className="btn btn-danger">
                Verlassen
              </button>
            </div>

            {errorMsg && (
              <div className="error-message">{errorMsg}</div>
            )}
          </div>
        </section>
      )}

      {/* Rotate Device Overlay for Mobile Landscape */}
      <div className="rotate-overlay">
        <div className="card-glass rotate-box">
          <div className="rotate-icon">📱↻</div>
          <h3>Bitte Hochformat nutzen</h3>
          <p>Dieses Spiel ist für das <strong>Portrait-Layout</strong> (Hochformat) optimiert. Bitte drehe dein Gerät vertikal.</p>
        </div>
      </div>
    </div>
  );
}
