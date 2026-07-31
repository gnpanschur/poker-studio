const { createDeck } = require('../utils/deck');
const { evaluate7Cards } = require('../utils/evaluator');
const { calculateAndAwardPots } = require('../utils/potCalculator');

class GameEngine {
  constructor(room) {
    this.room = room;
    this.state = 'WAITING'; // WAITING, PREFLOP, FLOP, TURN, RIVER, SHOWDOWN, ENDED
    this.deck = [];
    this.communityCards = [];
    this.pot = 0;
    this.dealerSeatIndex = 0;
    this.currentTurnSeatIndex = -1;
    this.currentHighBet = 0;
    this.minRaise = 0;
    this.lastActionPlayerId = null;
    this.lastActionAnnouncement = null;
    this.showdownResult = null;
    this.winner = null; // Overall tournament winner
    this.handCount = 0;
    this.autoNextHandTimer = null;
  }

  // Get active playing non-spectator players with chips > 0 (or still in hand)
  getPlayingPlayers() {
    return this.room.players.filter(p => !p.isSpectator);
  }

  // Get players currently in the hand (not folded)
  getActiveInHandPlayers() {
    return this.getPlayingPlayers().filter(p => !p.isFolded);
  }

  // Get next active seat index clockwise
  getNextActiveSeatIndex(startIndex) {
    const players = this.room.players;
    if (players.length === 0) return -1;
    
    for (let i = 1; i <= 6; i++) {
      const seatIndex = (startIndex + i) % 6;
      const player = players.find(p => p.seatIndex === seatIndex);
      if (player && !player.isSpectator && !player.isFolded && !player.isAllIn) {
        return seatIndex;
      }
    }
    return -1;
  }

  checkMinBetEliminations() {
    const blinds = this.room.blindTimer.getCurrentBlinds();
    const minBet = blinds.big;

    this.room.players.forEach(p => {
      if (!p.isSpectator && p.chips < minBet) {
        p.isSpectator = true;
        p.lastAction = 'Mindesteinsatz nicht vorhanden';
        const msg = `${p.name} ist Zuschauer, Mindesteinsatz nicht vorhanden.`;
        this.lastActionAnnouncement = msg;
        this.room.addChatMessage('System', msg);
      }
    });
  }

  resetForNewTournament() {
    if (this.autoNextHandTimer) {
      clearTimeout(this.autoNextHandTimer);
      this.autoNextHandTimer = null;
    }
    this.state = 'WAITING';
    this.winner = null;
    this.showdownResult = null;
    this.lastActionAnnouncement = null;
    this.handCount = 0;
    this.communityCards = [];
    this.pot = 0;
    this.dealerSeatIndex = 0;
  }

  // Start new game hand
  startNewHand() {
    if (this.autoNextHandTimer) {
      clearTimeout(this.autoNextHandTimer);
      this.autoNextHandTimer = null;
    }

    this.checkMinBetEliminations();

    const playingPlayers = this.getPlayingPlayers();
    if (playingPlayers.length < 2) {
      this.state = 'WAITING';
      return false;
    }

    this.handCount++;
    this.deck = createDeck();
    this.communityCards = [];
    this.pot = 0;
    this.showdownResult = null;
    this.lastActionAnnouncement = null;

    // Reset player state for new hand
    this.room.players.forEach(p => {
      p.currentBet = 0;
      p.totalHandBet = 0;
      p.cards = [];
      p.isFolded = p.isSpectator || p.chips <= 0;
      p.isAllIn = false;
      p.lastAction = null;
      p.evalResult = null;
      p.hasActedInStreet = false;
    });

    // Advance dealer button
    let nextDealer = (this.dealerSeatIndex + 1) % 6;
    while (!this.room.players.some(p => p.seatIndex === nextDealer && !p.isSpectator && p.chips > 0)) {
      nextDealer = (nextDealer + 1) % 6;
    }
    this.dealerSeatIndex = nextDealer;

    // Deal 2 hole cards to each playing player
    this.getPlayingPlayers().forEach(player => {
      if (player.chips > 0) {
        player.cards = [this.deck.pop(), this.deck.pop()];
      }
    });

    // Determine Small Blind & Big Blind seats
    const blinds = this.room.blindTimer.getCurrentBlinds();
    const activeSeats = this.getPlayingPlayers().filter(p => p.chips > 0).map(p => p.seatIndex);

    let sbSeat, bbSeat;
    if (activeSeats.length === 2) {
      // Heads up: Dealer is SB, other is BB
      sbSeat = this.dealerSeatIndex;
      bbSeat = activeSeats.find(s => s !== sbSeat);
    } else {
      sbSeat = this.getNextSeatWithChips(this.dealerSeatIndex);
      bbSeat = this.getNextSeatWithChips(sbSeat);
    }

    // Post Blinds
    this.postBlind(sbSeat, blinds.small, 'Small Blind');
    this.postBlind(bbSeat, blinds.big, 'Big Blind');

    this.currentHighBet = blinds.big;
    this.minRaise = blinds.big * 2;

    // Pre-flop turn starts after Big Blind
    this.state = 'PREFLOP';
    this.currentTurnSeatIndex = this.getNextActiveSeatIndex(bbSeat);
    if (this.currentTurnSeatIndex === -1) {
      this.checkRoundCompletion();
    }

    return true;
  }

  getNextSeatWithChips(fromSeat) {
    for (let i = 1; i <= 6; i++) {
      const seat = (fromSeat + i) % 6;
      const player = this.room.players.find(p => p.seatIndex === seat);
      if (player && !player.isSpectator && player.chips > 0) {
        return seat;
      }
    }
    return fromSeat;
  }

  postBlind(seatIndex, amount, label) {
    const player = this.room.players.find(p => p.seatIndex === seatIndex);
    if (!player) return;

    const actualBet = Math.min(player.chips, amount);
    player.chips -= actualBet;
    player.currentBet = actualBet;
    player.totalHandBet = actualBet;
    player.lastAction = `${label} (${actualBet})`;
    if (player.chips === 0) {
      player.isAllIn = true;
    }
    this.pot += actualBet;
  }

  // Handle player actions: fold, check, call, raise, all-in
  handlePlayerAction(playerId, actionType, raiseAmount = 0) {
    const player = this.room.players.find(p => p.id === playerId);
    if (!player || player.seatIndex !== this.currentTurnSeatIndex || this.state === 'WAITING' || this.state === 'SHOWDOWN') {
      return { success: false, error: 'Nicht an der Reihe' };
    }

    player.hasActedInStreet = true;

    switch (actionType) {
      case 'fold':
        player.isFolded = true;
        player.lastAction = 'hat gepasst';
        this.lastActionAnnouncement = `❌ ${player.name} hat gepasst`;
        this.room.addChatMessage('System', `❌ ${player.name} hat gepasst.`);
        break;

      case 'check':
        if (player.currentBet < this.currentHighBet) {
          return { success: false, error: 'Check nicht möglich. Einsatz erforderlich.' };
        }
        player.lastAction = 'Check';
        this.lastActionAnnouncement = `👉 ${player.name} hat gecheckt`;
        this.room.addChatMessage('System', `👉 ${player.name} hat gecheckt.`);
        break;

      case 'call': {
        const callAmount = this.currentHighBet - player.currentBet;
        const actualCall = Math.min(player.chips, callAmount);
        player.chips -= actualCall;
        player.currentBet += actualCall;
        player.totalHandBet += actualCall;
        this.pot += actualCall;
        if (player.chips === 0) {
          player.isAllIn = true;
          player.lastAction = `All-In (${player.totalHandBet})`;
          this.lastActionAnnouncement = `💥 ${player.name} ist All-In gegangen (${player.totalHandBet} 🪙)`;
          this.room.addChatMessage('System', `💥 ${player.name} ist All-In gegangen (${player.totalHandBet} 🪙)!`);
        } else {
          player.lastAction = `Call (${actualCall})`;
          this.lastActionAnnouncement = `📞 ${player.name} ist mitgegangen (${actualCall} 🪙)`;
          this.room.addChatMessage('System', `📞 ${player.name} ist mitgegangen (${actualCall} 🪙).`);
        }
        break;
      }

      case 'raise': {
        const totalTargetBet = Math.max(raiseAmount, this.minRaise);
        const additionalChipsNeeded = totalTargetBet - player.currentBet;

        if (additionalChipsNeeded >= player.chips) {
          const allInAmount = player.chips;
          player.currentBet += allInAmount;
          player.totalHandBet += allInAmount;
          this.pot += allInAmount;
          player.chips = 0;
          player.isAllIn = true;

          if (player.currentBet > this.currentHighBet) {
            const raiseDiff = player.currentBet - this.currentHighBet;
            this.currentHighBet = player.currentBet;
            this.minRaise = this.currentHighBet + Math.max(raiseDiff, this.room.blindTimer.getCurrentBlinds().big);
          }
          player.lastAction = `All-In (${player.currentBet})`;
          this.lastActionAnnouncement = `💥 ${player.name} ist All-In gegangen (${player.currentBet} 🪙)`;
          this.room.addChatMessage('System', `💥 ${player.name} ist All-In gegangen (${player.currentBet} 🪙)!`);
        } else {
          player.chips -= additionalChipsNeeded;
          const raiseDiff = totalTargetBet - this.currentHighBet;
          this.currentHighBet = totalTargetBet;
          this.minRaise = totalTargetBet + Math.max(raiseDiff, this.room.blindTimer.getCurrentBlinds().big);
          player.currentBet = totalTargetBet;
          player.totalHandBet += additionalChipsNeeded;
          this.pot += additionalChipsNeeded;
          player.lastAction = `Raise (${totalTargetBet})`;
          this.lastActionAnnouncement = `🚀 ${player.name} hat auf ${totalTargetBet} 🪙 erhöht`;
          this.room.addChatMessage('System', `🚀 ${player.name} hat auf ${totalTargetBet} 🪙 erhöht.`);
        }
        break;
      }

      default:
        return { success: false, error: 'Ungültige Aktion' };
    }

    this.lastActionPlayerId = playerId;
    this.checkRoundCompletion();
    return { success: true };
  }

  checkRoundCompletion() {
    const activePlayers = this.getActiveInHandPlayers();

    // Case 1: Only 1 player left who hasn't folded -> instant winner
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      winner.chips += this.pot;
      this.showdownResult = {
        pots: [],
        payouts: { [winner.id]: this.pot },
        details: [{
          name: 'Haupt-Pot',
          amount: this.pot,
          winners: [{ id: winner.id, name: winner.name, amount: this.pot, desc: 'Alle anderen Spieler haben gepasst' }]
        }]
      };
      this.finishHand();
      return;
    }

    // Check if betting round in current street is complete
    const playersToAct = activePlayers.filter(p => !p.isAllIn);
    const allHaveMatchedBet = activePlayers.every(p => p.isAllIn || p.currentBet === this.currentHighBet);
    const allHaveActed = activePlayers.every(p => p.isAllIn || p.hasActedInStreet);

    if (playersToAct.length <= 1 && allHaveMatchedBet) {
      this.advanceStreetUntilShowdown();
      return;
    }

    if (allHaveMatchedBet && allHaveActed) {
      this.nextStreet();
      return;
    }

    // Move turn to next active player
    this.currentTurnSeatIndex = this.getNextActiveSeatIndex(this.currentTurnSeatIndex);
    if (this.currentTurnSeatIndex === -1) {
      this.nextStreet();
    }
  }

  nextStreet() {
    // Reset current street bets
    this.room.players.forEach(p => {
      p.currentBet = 0;
      p.hasActedInStreet = false;
    });
    this.currentHighBet = 0;
    this.minRaise = this.room.blindTimer.getCurrentBlinds().big;

    switch (this.state) {
      case 'PREFLOP':
        this.state = 'FLOP';
        this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
        break;

      case 'FLOP':
        this.state = 'TURN';
        this.communityCards.push(this.deck.pop());
        break;

      case 'TURN':
        this.state = 'RIVER';
        this.communityCards.push(this.deck.pop());
        break;

      case 'RIVER':
        this.evaluateShowdown();
        return;
    }

    // Turn after dealer button
    this.currentTurnSeatIndex = this.getNextActiveSeatIndex(this.dealerSeatIndex);
    if (this.currentTurnSeatIndex === -1) {
      this.advanceStreetUntilShowdown();
    }
  }

  advanceStreetUntilShowdown() {
    while (this.communityCards.length < 5) {
      this.communityCards.push(this.deck.pop());
    }
    this.evaluateShowdown();
  }

  evaluateShowdown() {
    this.state = 'SHOWDOWN';
    this.currentTurnSeatIndex = -1;

    // Evaluate hands for non-folded players
    this.getActiveInHandPlayers().forEach(p => {
      p.evalResult = evaluate7Cards(p.cards, this.communityCards);
    });

    const result = calculateAndAwardPots(this.room.players, this.dealerSeatIndex);
    this.showdownResult = result;

    // Apply payouts to player chip counts
    Object.entries(result.payouts).forEach(([playerId, amount]) => {
      const player = this.room.players.find(p => p.id === playerId);
      if (player) {
        player.chips += amount;
      }
    });

    this.finishHand();
  }

  finishHand() {
    this.state = 'SHOWDOWN';

    // Process eliminations for players without minimum bet
    this.checkMinBetEliminations();

    // Check if tournament has ended (only 1 player with chips remaining)
    const survivors = this.getPlayingPlayers();
    if (survivors.length === 1) {
      this.autoNextHandTimer = setTimeout(() => {
        this.state = 'ENDED';
        this.winner = survivors[0];
        if (this.room.io) {
          this.room.broadcastState();
        }
      }, 6000);
      return;
    }

    // Auto start next hand after 10 seconds
    this.autoNextHandTimer = setTimeout(() => {
      this.startNewHand();
      if (this.room.io) {
        this.room.broadcastState();
      }
    }, 10000);
  }

  getStateForPlayer(playerId) {
    return {
      state: this.state,
      communityCards: this.communityCards,
      pot: this.pot,
      dealerSeatIndex: this.dealerSeatIndex,
      currentTurnSeatIndex: this.currentTurnSeatIndex,
      currentHighBet: this.currentHighBet,
      minRaise: this.minRaise,
      handCount: this.handCount,
      lastActionAnnouncement: this.lastActionAnnouncement,
      showdownResult: this.showdownResult,
      winner: this.winner,
      blindInfo: this.room.blindTimer.getState(),
      players: this.room.players.map(p => ({
        id: p.id,
        name: p.name,
        seatIndex: p.seatIndex,
        chips: p.chips,
        currentBet: p.currentBet,
        totalHandBet: p.totalHandBet,
        isFolded: p.isFolded,
        isAllIn: p.isAllIn,
        isSpectator: p.isSpectator,
        isDisconnected: p.isDisconnected,
        lastAction: p.lastAction,
        cards: (p.id === playerId || (this.state === 'SHOWDOWN' && !p.isFolded)) ? p.cards : (p.cards.length > 0 ? [{ hidden: true }, { hidden: true }] : []),
        evalResult: (this.state === 'SHOWDOWN' && !p.isFolded) ? p.evalResult : null
      }))
    };
  }
}

module.exports = GameEngine;
