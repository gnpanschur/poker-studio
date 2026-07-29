const { compareEvaluated } = require('./evaluator');

/**
 * Calculates main pot and side pots for all-in scenarios and awards chips to winners.
 * 
 * @param {Array} players - List of player objects: { id, name, totalHandBet, isFolded, evalResult, seatIndex }
 * @param {number} dealerSeatIndex - Current dealer seat index for remainder chip distribution
 * @returns {Object} { pots: Array, results: Array }
 */
function calculateAndAwardPots(players, dealerSeatIndex) {
  // Filter players who put chips in the pot
  const betters = players.filter(p => p.totalHandBet > 0);
  if (betters.length === 0) {
    return { pots: [], results: [] };
  }

  // Get sorted unique bet levels
  const levels = [...new Set(betters.map(p => p.totalHandBet))].sort((a, b) => a - b);

  const pots = [];
  let previousLevel = 0;

  for (const level of levels) {
    const potAmount = betters.reduce((sum, p) => {
      const capCurrent = Math.min(p.totalHandBet, level);
      const capPrev = Math.min(p.totalHandBet, previousLevel);
      return sum + (capCurrent - capPrev);
    }, 0);

    if (potAmount > 0) {
      // Eligible players for this pot layer are non-folded players who bet at least `level`
      const eligiblePlayers = players.filter(p => !p.isFolded && p.totalHandBet >= level);
      
      pots.push({
        amount: potAmount,
        eligiblePlayerIds: eligiblePlayers.map(p => p.id)
      });
    }

    previousLevel = level;
  }

  // Merge pots with identical eligible player sets
  const mergedPots = [];
  for (const pot of pots) {
    if (mergedPots.length > 0) {
      const lastPot = mergedPots[mergedPots.length - 1];
      const sameEligible = lastPot.eligiblePlayerIds.length === pot.eligiblePlayerIds.length &&
        lastPot.eligiblePlayerIds.every(id => pot.eligiblePlayerIds.includes(id));

      if (sameEligible) {
        lastPot.amount += pot.amount;
        continue;
      }
    }
    mergedPots.push(pot);
  }

  // Award pots to winners
  const playerPayouts = {};
  players.forEach(p => { playerPayouts[p.id] = 0; });

  const potDetails = [];

  for (let i = 0; i < mergedPots.length; i++) {
    const pot = mergedPots[i];
    const eligible = players.filter(p => pot.eligiblePlayerIds.includes(p.id));

    if (eligible.length === 0) continue;

    if (eligible.length === 1) {
      // Single eligible player gets the pot (e.g., everyone else folded)
      const winner = eligible[0];
      playerPayouts[winner.id] += pot.amount;
      potDetails.push({
        name: i === 0 ? 'Haupt-Pot' : `Neben-Pot ${i}`,
        amount: pot.amount,
        winners: [{ id: winner.id, name: winner.name, amount: pot.amount, desc: 'Einziger verbliebener Spieler' }]
      });
      continue;
    }

    // Find best hand among eligible players
    let bestEval = null;
    let winners = [];

    for (const player of eligible) {
      if (!player.evalResult) continue;
      if (!bestEval) {
        bestEval = player.evalResult;
        winners = [player];
      } else {
        const cmp = compareEvaluated(player.evalResult, bestEval);
        if (cmp > 0) {
          bestEval = player.evalResult;
          winners = [player];
        } else if (cmp === 0) {
          winners.push(player);
        }
      }
    }

    // Distribute pot among winners
    const share = Math.floor(pot.amount / winners.length);
    let remainder = pot.amount % winners.length;

    // Sort winners clockwise starting after dealer seat index for remainder distribution
    winners.sort((a, b) => {
      const distA = (a.seatIndex - dealerSeatIndex + 6) % 6;
      const distB = (b.seatIndex - dealerSeatIndex + 6) % 6;
      return distA - distB;
    });

    const potWinnersSummary = [];
    for (const winner of winners) {
      let winAmount = share;
      if (remainder > 0) {
        winAmount += 1;
        remainder -= 1;
      }
      playerPayouts[winner.id] += winAmount;
      potWinnersSummary.push({
        id: winner.id,
        name: winner.name,
        amount: winAmount,
        desc: winner.evalResult ? winner.evalResult.desc : ''
      });
    }

    potDetails.push({
      name: i === 0 ? 'Haupt-Pot' : `Neben-Pot ${i}`,
      amount: pot.amount,
      winners: potWinnersSummary
    });
  }

  return {
    pots: mergedPots,
    payouts: playerPayouts,
    details: potDetails
  };
}

module.exports = {
  calculateAndAwardPots
};
