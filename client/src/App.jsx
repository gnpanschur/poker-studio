import React from 'react';
import { useSocket } from './hooks/useSocket';
import { useWakeLock } from './hooks/useWakeLock';
import Lobby from './components/Lobby';
import PokerTable from './components/PokerTable';
import ReconnectModal from './components/ReconnectModal';
import './styles/index.css';
import './styles/Table.css';
import './styles/lobby.css';

export default function App() {
  // Prevent mobile standby during poker sessions
  useWakeLock(true);

  const {
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
  } = useSocket();

  // Switch to Poker Table view when active game state is present
  const isInGame = !!(roomState && roomState.gameState && roomState.gameState.state !== 'WAITING');

  return (
    <>
      <ReconnectModal isConnected={isConnected} />

      {!isInGame ? (
        <Lobby
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          onToggleReady={toggleReady}
          onStartGame={startGame}
          onLeaveRoom={leaveRoom}
          lobbyState={lobbyState}
          socketId={socket?.id}
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
        />
      ) : (
        <PokerTable
          roomState={roomState}
          onStartGame={startGame}
          onSendAction={sendAction}
          onSendChat={sendChat}
          onSendEmoji={sendEmoji}
          onLeaveRoom={leaveRoom}
          activeEmojiBursts={activeEmojiBursts}
        />
      )}
    </>
  );
}
