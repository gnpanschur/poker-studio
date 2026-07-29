import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [activeEmojiBursts, setActiveEmojiBursts] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const socketRef = useRef(null);

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

      // Attempt auto-reconnect using sessionStorage (tab-isolated)
      const savedToken = sessionStorage.getItem('poker_session_token');
      const savedRoomCode = sessionStorage.getItem('poker_room_code');

      if (savedToken && savedRoomCode) {
        newSocket.emit('reconnect_session', {
          roomCode: savedRoomCode,
          sessionToken: savedToken
        }, (res) => {
          if (!res.success) {
            // Invalid or expired session
            sessionStorage.removeItem('poker_session_token');
            sessionStorage.removeItem('poker_room_code');
          }
        });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('room_state', (state) => {
      setRoomState(state);
    });

    newSocket.on('emoji_burst', (data) => {
      const burstId = Date.now() + Math.random();
      setActiveEmojiBursts(prev => [...prev, { ...data, id: burstId }]);
      setTimeout(() => {
        setActiveEmojiBursts(prev => prev.filter(b => b.id !== burstId));
      }, 2500);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const createRoom = (nickname, callback) => {
    if (!socket) return;
    socket.emit('create_room', { nickname }, (res) => {
      if (res.success) {
        sessionStorage.setItem('poker_session_token', res.sessionToken);
        sessionStorage.setItem('poker_room_code', res.roomCode);
      } else {
        setErrorMsg(res.error);
      }
      if (callback) callback(res);
    });
  };

  const joinRoom = (roomCode, nickname, callback) => {
    if (!socket) return;
    socket.emit('join_room', { roomCode, nickname }, (res) => {
      if (res.success) {
        sessionStorage.setItem('poker_session_token', res.sessionToken);
        sessionStorage.setItem('poker_room_code', res.roomCode);
      } else {
        setErrorMsg(res.error);
      }
      if (callback) callback(res);
    });
  };

  const startGame = (callback) => {
    if (!socket || !roomState) return;
    const sessionToken = sessionStorage.getItem('poker_session_token');
    socket.emit('start_game', { roomCode: roomState.roomCode, sessionToken }, (res) => {
      if (!res.success) setErrorMsg(res.error);
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
    setRoomState(null);
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  };

  return {
    socket,
    isConnected,
    roomState,
    activeEmojiBursts,
    errorMsg,
    setErrorMsg,
    createRoom,
    joinRoom,
    startGame,
    sendAction,
    sendChat,
    sendEmoji,
    leaveRoom
  };
}
