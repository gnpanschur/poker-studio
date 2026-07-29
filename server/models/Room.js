const { v4: uuidv4 } = require('uuid');
const { BlindTimer } = require('../utils/timer');
const GameEngine = require('./Game');

class Room {
  constructor(code, hostSocketId, hostName, blindIntervalMinutes = 3) {
    this.code = code;
    this.hostId = null; // sessionToken of host
    this.players = []; // Array of player objects
    this.chatMessages = [];
    this.io = null;

    // Create Blind Timer
    this.blindTimer = new BlindTimer(blindIntervalMinutes, (newBlinds) => {
      if (this.io) {
        this.io.to(this.code).emit('blind_increase', {
          smallBlind: newBlinds.small,
          bigBlind: newBlinds.big
        });
        this.broadcastState();
      }
    });

    // Create Game Engine
    this.game = new GameEngine(this);

    // Add host player
    this.addPlayer(hostSocketId, hostName, true);
  }

  addPlayer(socketId, name, isHost = false) {
    if (this.players.length >= 6) {
      return { success: false, error: 'Raum ist voll (max. 6 Spieler)' };
    }

    // Find first available seat index 0..5
    const takenSeats = this.players.map(p => p.seatIndex);
    let seatIndex = 0;
    for (let i = 0; i < 6; i++) {
      if (!takenSeats.includes(i)) {
        seatIndex = i;
        break;
      }
    }

    const sessionToken = uuidv4();
    const isGameInProgress = this.game.state !== 'WAITING' && this.game.state !== 'ENDED';

    const newPlayer = {
      id: socketId,
      sessionToken: sessionToken,
      name: name,
      seatIndex: seatIndex,
      chips: isGameInProgress ? 0 : 1000,
      currentBet: 0,
      totalHandBet: 0,
      cards: [],
      isFolded: isGameInProgress,
      isAllIn: false,
      isSpectator: isGameInProgress,
      isDisconnected: false,
      lastAction: isGameInProgress ? 'Zuschauer' : null,
      evalResult: null
    };

    if (isHost || !this.hostId) {
      this.hostId = sessionToken;
    }

    this.players.push(newPlayer);
    return { success: true, player: newPlayer, sessionToken };
  }

  reconnectPlayer(socketId, sessionToken) {
    const player = this.players.find(p => p.sessionToken === sessionToken);
    if (!player) {
      return { success: false, error: 'Session nicht gefunden' };
    }

    player.id = socketId;
    player.isDisconnected = false;
    return { success: true, player };
  }

  disconnectPlayer(socketId) {
    const player = this.players.find(p => p.id === socketId);
    if (player) {
      player.isDisconnected = true;
      if (this.game.state === 'WAITING') {
        this.players = this.players.filter(p => p.id !== socketId);
        if (this.hostId === player.sessionToken && this.players.length > 0) {
          this.hostId = this.players[0].sessionToken;
        }
      } else {
        if (this.game.currentTurnSeatIndex === player.seatIndex) {
          this.game.handlePlayerAction(player.id, 'fold');
        }
      }
    }
    this.broadcastState();
  }

  startGame(requestingSessionToken) {
    if (this.hostId !== requestingSessionToken) {
      return { success: false, error: 'Nur der Raumleiter kann das Spiel starten' };
    }
    if (this.players.length < 2) {
      return { success: false, error: 'Mindestens 2 Spieler erforderlich' };
    }

    this.blindTimer.start();
    const started = this.game.startNewHand();
    if (!started) {
      return { success: false, error: 'Nicht genügend Spieler mit Chips' };
    }

    this.broadcastState();
    return { success: true };
  }

  addChatMessage(senderName, text) {
    const msg = {
      id: uuidv4(),
      sender: senderName,
      text: text.trim().substring(0, 150),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.chatMessages.push(msg);
    if (this.chatMessages.length > 50) {
      this.chatMessages.shift();
    }
    if (this.io) {
      this.io.to(this.code).emit('chat_message', msg);
    }
  }

  broadcastState() {
    if (!this.io) return;

    this.players.forEach(player => {
      const stateForPlayer = {
        roomCode: this.code,
        isHost: player.sessionToken === this.hostId,
        myPlayerId: player.id,
        mySessionToken: player.sessionToken,
        gameState: this.game.getStateForPlayer(player.id),
        chatMessages: this.chatMessages
      };
      this.io.to(player.id).emit('room_state', stateForPlayer);
    });
  }
}

module.exports = Room;
