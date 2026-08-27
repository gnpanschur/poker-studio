const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const LobbyManager = require('./lobby/LobbyManager');
const { initSockets } = require('./sockets/gameHandler');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize LobbyManager
const lobbyManager = new LobbyManager(io, {
  gameId: 'poker_studio',
  gameTitle: 'Poker Studio',
  minPlayers: 2,
  maxPlayers: 6
});

// Initialize socket handlers
initSockets(io, lobbyManager);

// Serve static frontend build files in production (Render.com deployment)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/socket.io')) return;
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Poker WebApp Backend Running (Client build pending).');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`♠♥♦♣ Texas Hold'em Poker Server gestartet auf Port ${PORT}`);
});
