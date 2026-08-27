const Room = require('../models/Room');

// In-Memory store for active poker rooms
const rooms = new Map();

function initSockets(io, lobbyManager) {
  // Callback when host starts game from Lobby
  lobbyManager.onGameStart((lobbyRoom, hostSocketId) => {
    console.log(`[GameHandler] Starting Poker Game for room ${lobbyRoom.code}`);

    const hostPlayer = lobbyRoom.players.find(p => p.isHost) || lobbyRoom.players[0];
    if (!hostPlayer) return;

    // Create Poker Room model
    const pokerRoom = new Room(lobbyRoom.code, hostPlayer.id, hostPlayer.name);
    pokerRoom.io = io;
    rooms.set(lobbyRoom.code, pokerRoom);

    // Add other players to Poker Room
    lobbyRoom.players.forEach(p => {
      if (p.id !== hostPlayer.id) {
        pokerRoom.addPlayer(p.id, p.name);
      }
    });

    // Start Poker game engine & broadcast initial hand
    pokerRoom.startGame(pokerRoom.hostId);
  });

  io.on('connection', (socket) => {
    // Attach central LobbyManager socket listeners
    lobbyManager.attachSocketListeners(socket);

    // Reconnect Session (during active game)
    socket.on('reconnect_session', ({ roomCode, sessionToken }, callback) => {
      const code = roomCode ? roomCode.toUpperCase().trim() : '';
      const room = rooms.get(code);

      if (!room) {
        return callback({ success: false, error: 'Raum existiert nicht mehr' });
      }

      const result = room.reconnectPlayer(socket.id, sessionToken);
      if (!result.success) {
        return callback(result);
      }

      socket.join(code);

      callback({
        success: true,
        roomCode: code,
        sessionToken: result.player.sessionToken,
        playerId: result.player.id
      });

      room.addChatMessage('System', `${result.player.name} ist wieder verbunden.`);
      room.broadcastState();
    });

    // Player Action (Fold, Check, Call, Raise, All-In)
    socket.on('player_action', ({ roomCode, actionType, amount }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) return callback && callback({ success: false, error: 'Raum nicht gefunden' });

      const result = room.game.handlePlayerAction(socket.id, actionType, amount);
      if (result.success) {
        room.broadcastState();
      }
      if (callback) callback(result);
    });

    // Send Chat
    socket.on('send_chat', ({ roomCode, text }) => {
      const room = rooms.get(roomCode);
      if (!room || !text) return;

      const player = room.players.find(p => p.id === socket.id);
      const senderName = player ? player.name : 'Unbekannt';

      room.addChatMessage(senderName, text);
    });

    // Send Instant Emoji Reaction
    socket.on('send_emoji', ({ roomCode, emoji }) => {
      const room = rooms.get(roomCode);
      if (!room || !emoji) return;

      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        io.to(roomCode).emit('emoji_burst', {
          seatIndex: player.seatIndex,
          playerName: player.name,
          emoji
        });
      }
    });

    // Handle Disconnect during game
    socket.on('disconnect', () => {
      rooms.forEach((room) => {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          room.disconnectPlayer(socket.id);
          const activeConnected = room.players.filter(p => !p.isDisconnected);
          if (activeConnected.length === 0) {
            setTimeout(() => {
              const currentRoom = rooms.get(room.code);
              if (currentRoom && currentRoom.players.filter(p => !p.isDisconnected).length === 0) {
                currentRoom.blindTimer.stop();
                rooms.delete(room.code);
              }
            }, 600000);
          }
        }
      });
    });

  });
}

module.exports = { initSockets };
