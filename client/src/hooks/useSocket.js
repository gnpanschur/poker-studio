import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lobbyState, setLobbyState] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [activeEmojiBursts, setActiveEmojiBursts] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const socketRef = useRef(null);
  const currentRoomCodeRef = useRef(null);
  const currentPlayerNameRef = useRef(null);

  useEffect(() => {
    // Connect to current origin
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setErrorMsg(null);

      // Attempt auto-reconnect to active poker session if available
      const savedToken = sessionStorage.getItem('poker_session_token');
      const savedRoomCode = sessionStorage.getItem('poker_room_code');

      if (savedToken && savedRoomCode) {
        newSocket.emit('reconnect_session', {
          roomCode: savedRoomCode,
          sessionToken: savedToken
        }, (res) => {
          if (!res.success) {
            sessionStorage.removeItem('poker_session_token');
            sessionStorage.removeItem('poker_room_code');
          }
        });
      } else if (currentRoomCodeRef.current && currentPlayerNameRef.current) {
        // Rejoin lobby room on socket reconnect
        newSocket.emit('join_room', {
          roomCode: currentRoomCodeRef.current,
          playerName: currentPlayerNameRef.current
        });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Central Lobby State updates
    newSocket.on('lobby_state', (state) => {
      setLobbyState(state);
    });

    // Game started transition
    newSocket.on('game_started', (payload) => {
      if (payload && payload.state) {
        setLobbyState(payload.state);
      }
    });

    // Poker Game Engine state updates
    newSocket.on('room_state', (state) => {
      if (state.mySessionToken && state.roomCode) {
        sessionStorage.setItem('poker_session_token', state.mySessionToken);
        sessionStorage.setItem('poker_room_code', state.roomCode);
      }
      setRoomState(state);
    });

    newSocket.on('emoji_burst', (data) => {
      const burstId = Date.now() + Math.random();
      setActiveEmojiBursts(prev => [...prev, { ...data, id: burstId }]);
      setTimeout(() => {
        setActiveEmojiBursts(prev => prev.filter(b => b.id !== burstId));
      }, 2500);
    });

    // Auto-Sync when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!newSocket.connected) {
          newSocket.connect();
        } else if (currentRoomCodeRef.current && currentPlayerNameRef.current && !roomState) {
          newSocket.emit('join_room', {
            roomCode: currentRoomCodeRef.current,
            playerName: currentPlayerNameRef.current
          });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      newSocket.disconnect();
    };
  }, []);

  const createRoom = (playerName, callback) => {
    if (!socket) return;
    currentPlayerNameRef.current = playerName;
    socket.emit('create_room', { playerName, roomConfig: {} }, (res) => {
      if (res && res.success) {
        currentRoomCodeRef.current = res.roomCode;
        if (res.state) setLobbyState(res.state);
      } else {
        setErrorMsg(res?.message || res?.error || 'Raum konnte nicht erstellt werden');
      }
      if (callback) callback(res);
    });
  };

  const joinRoom = (roomCode, playerName, callback) => {
    if (!socket) return;
    const code = roomCode.toUpperCase().trim();
    currentRoomCodeRef.current = code;
    currentPlayerNameRef.current = playerName;

    socket.emit('join_room', { roomCode: code, playerName }, (res) => {
      if (res && res.success) {
        if (res.state) setLobbyState(res.state);
      } else {
        setErrorMsg(res?.message || res?.error || 'Beitritt fehlgeschlagen');
      }
      if (callback) callback(res);
    });
  };

  const toggleReady = () => {
    if (!socket) return;
    socket.emit('toggle_ready');
  };

  const startGame = (callback) => {
    if (!socket) return;
    socket.emit('start_game', (res) => {
      if (res && !res.success) {
        setErrorMsg(res.message || res.error);
      }
      if (callback) callback(res);
    });
  };

  const sendAction = (actionType, amount = 0, callback) => {
    if (!socket || !roomState) return;
    socket.emit('player_action', { roomCode: roomState.roomCode, actionType, amount }, (res) => {
      if (res && !res.success) setErrorMsg(res.error);
      if (callback) callback(res);
    });
  };

  const sendChat = (text) => {
    if (!socket || !roomState) return;
    socket.emit('send_chat', { roomCode: roomState.roomCode, text });
  };

  const sendEmoji = (emoji) => {
    if (!socket || !roomState) return;
    socket.emit('send_emoji', { roomCode: roomState.roomCode, emoji });
  };

  const leaveRoom = () => {
    sessionStorage.removeItem('poker_session_token');
    sessionStorage.removeItem('poker_room_code');
    if (socket) {
      socket.emit('leave_room');
    }
    setLobbyState(null);
    setRoomState(null);
    currentRoomCodeRef.current = null;
    currentPlayerNameRef.current = null;
  };

  return {
    socket,
    isConnected,
    lobbyState,
    roomState,
    activeEmojiBursts,
    errorMsg,
    setErrorMsg,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    sendAction,
    sendChat,
    sendEmoji,
    leaveRoom
  };
}
