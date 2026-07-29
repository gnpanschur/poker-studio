import React from 'react';
import { useSocket } from './hooks/useSocket';
import Lobby from './components/Lobby';
import PokerTable from './components/PokerTable';
import ReconnectModal from './components/ReconnectModal';
import './styles/index.css';
import './styles/Table.css';

export default function App() {
  const {
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
  } = useSocket();

  return (
    <>
      <ReconnectModal isConnected={isConnected} />

      {!roomState ? (
        <Lobby
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
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
