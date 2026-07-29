const Room = require('../models/Room');

// In-Memory store for active rooms
const rooms = new Map();

function generateRoomCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function initSockets(io) {
  io.on('connection', (socket) => {

    // Create Room
    socket.on('create_room', ({ nickname }, callback) => {
      if (!nickname || nickname.trim() === '') {
        return callback({ success: false, error: 'Bitte einen Spitznamen eingeben' });
      }

      const code = generateRoomCode();
      const room = new Room(code, socket.id, nickname.trim());
      room.io = io;
      rooms.set(code, room);

      socket.join(code);

      const hostPlayer = room.players[0];
      callback({
        success: true,
        roomCode: code,
        sessionToken: hostPlayer.sessionToken,
        playerId: hostPlayer.id
      });

      room.broadcastState();
    });

    // Join Room
    socket.on('join_room', ({ roomCode, nickname }, callback) => {
      const code = roomCode ? roomCode.toUpperCase().trim() : '';
      const room = rooms.get(code);

      if (!room) {
        return callback({ success: false, error: 'Raum nicht gefunden' });
      }
      if (!nickname || nickname.trim() === '') {
        return callback({ success: false, error: 'Bitte einen Spitznamen eingeben' });
      }

      const result = room.addPlayer(socket.id, nickname.trim());
      if (!result.success) {
        return callback(result);
      }

      socket.join(code);

      callback({
        success: true,
        roomCode: code,
        sessionToken: result.sessionToken,
        playerId: result.player.id
      });

      room.addChatMessage('System', `${nickname} hat den Raum betreten.`);
      room.broadcastState();
    });

    // Reconnect Session
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

    // Start Game
    socket.on('start_game', ({ roomCode, sessionToken }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) return callback({ success: false, error: 'Raum nicht gefunden' });

      const result = room.startGame(sessionToken);
      if (callback) callback(result);
    });

    // Player Action (Fold, Check, Call, Raise, All-In)
    socket.on('player_action', ({ roomCode, actionType, amount }, callback) => {
      const room = rooms.get(roomCode);
      if (!room) return callback({ success: false, error: 'Raum nicht gefunden' });

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

    // Handle Disconnect
    socket.on('disconnect', () => {
      rooms.forEach((room) => {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          room.disconnectPlayer(socket.id);
          // If all players left and room is empty, clean up after 10 mins
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
