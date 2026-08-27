/**
 * Clientseitige Konfiguration für Poker Studio.
 */
export const GAME_LOBBY_CONFIG = {
  // Name & Branding des Spiels
  gameTitle: 'POKER STUDIO',
  logoLetters: [
    { text: 'P', color: 'red' },
    { text: 'O', color: 'yellow' },
    { text: 'K', color: 'green' },
    { text: 'E', color: 'blue' },
    { text: 'R', color: 'red' }
  ],
  subtitle: "Sit & Go Texas Hold'em für private Runden",

  // Lobby-Parameter
  minPlayers: 2,
  maxPlayers: 6,
  
  // Storage Key für den Spielernamen
  storageKeyName: 'poker_player_name',

  // Feature Flags
  enableWhatsAppShare: true,
  enableCopyCode: true,
  enableReadySystem: true
};

if (typeof window !== 'undefined') {
  window.GAME_LOBBY_CONFIG = GAME_LOBBY_CONFIG;
}
