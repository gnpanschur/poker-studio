/**
 * Konfiguration für den Poker Studio Lobby-Server.
 */
const DEFAULT_LOBBY_CONFIG = {
  gameId: 'poker_studio',
  gameTitle: 'Poker Studio',
  roomCodeLength: 4,
  minPlayers: 2,
  maxPlayers: 6,
  requireReady: true,
  emptyRoomTimeoutMs: 60000, // 60 Sekunden bis ein leerer Raum gelöscht wird
  maxPlayerNameLength: 14
};

module.exports = DEFAULT_LOBBY_CONFIG;
