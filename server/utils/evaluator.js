// Texas Hold'em 7-Card Hand Evaluator

const HAND_RANKS = {
  ROYAL_FLUSH: 9,
  STRAIGHT_FLUSH: 8,
  FOUR_OF_A_KIND: 7,
  FULL_HOUSE: 6,
  FLUSH: 5,
  STRAIGHT: 4,
  THREE_OF_A_KIND: 3,
  TWO_PAIR: 2,
  ONE_PAIR: 1,
  HIGH_CARD: 0
};

const HAND_NAMES_DE = {
  9: 'Royal Flush',
  8: 'Straight Flush',
  7: 'Vierling (Four of a Kind)',
  6: 'Full House',
  5: 'Flush',
  4: 'Straße (Straight)',
  3: 'Drilling (Three of a Kind)',
  2: 'Zwei Paare (Two Pair)',
  1: 'Ein Paar (One Pair)',
  0: 'Höchste Karte (High Card)'
};

// Helper: Get all 5-card combinations out of N cards (N >= 5)
function getCombinations(cards, k = 5) {
  const result = [];
  function helper(start, combo) {
    if (combo.length === k) {
      result.push(combo);
      return;
    }
    for (let i = start; i < cards.length; i++) {
      helper(i + 1, [...combo, cards[i]]);
    }
  }
  helper(0, []);
  return result;
}

// Evaluate exact 5 cards
function evaluate5CardHand(cards) {
  // Sort cards descending by value
  const sorted = [...cards].sort((a, b) => b.value - a.value);
  
  const isFlush = sorted.every(c => c.suit === sorted[0].suit);

  // Check straight
  let isStraight = false;
  let straightHigh = 0;

  // Normal straight check
  const values = sorted.map(c => c.value);
  const isNormalStraight = (
    values[0] - values[1] === 1 &&
    values[1] - values[2] === 1 &&
    values[2] - values[3] === 1 &&
    values[3] - values[4] === 1
  );

  // Ace-low straight check (A, 5, 4, 3, 2) => values [14, 5, 4, 3, 2]
  const isAceLowStraight = (
    values[0] === 14 &&
    values[1] === 5 &&
    values[2] === 4 &&
    values[3] === 3 &&
    values[4] === 2
  );

  if (isNormalStraight) {
    isStraight = true;
    straightHigh = values[0];
  } else if (isAceLowStraight) {
    isStraight = true;
    straightHigh = 5;
  }

  // Count value occurrences
  const valueCounts = {};
  for (const c of sorted) {
    valueCounts[c.value] = (valueCounts[c.value] || 0) + 1;
  }

  // Group by count: [[value, count], ...]
  const groups = Object.entries(valueCounts)
    .map(([val, count]) => [Number(val), count])
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]; // sort by frequency desc
      return b[0] - a[0]; // then by card value desc
    });

  // Evaluate categories
  if (isFlush && isStraight) {
    if (straightHigh === 14) {
      return {
        rank: HAND_RANKS.ROYAL_FLUSH,
        tieBreakers: [14],
        desc: HAND_NAMES_DE[HAND_RANKS.ROYAL_FLUSH]
      };
    }
    return {
      rank: HAND_RANKS.STRAIGHT_FLUSH,
      tieBreakers: [straightHigh],
      desc: `${HAND_NAMES_DE[HAND_RANKS.STRAIGHT_FLUSH]} (${straightHigh} hoch)`
    };
  }

  if (groups[0][1] === 4) {
    const quadVal = groups[0][0];
    const kicker = groups[1][0];
    return {
      rank: HAND_RANKS.FOUR_OF_A_KIND,
      tieBreakers: [quadVal, kicker],
      desc: `${HAND_NAMES_DE[HAND_RANKS.FOUR_OF_A_KIND]} (${quadVal}er)`
    };
  }

  if (groups[0][1] === 3 && groups[1][1] === 2) {
    const tripVal = groups[0][0];
    const pairVal = groups[1][0];
    return {
      rank: HAND_RANKS.FULL_HOUSE,
      tieBreakers: [tripVal, pairVal],
      desc: `${HAND_NAMES_DE[HAND_RANKS.FULL_HOUSE]} (${tripVal}er über ${pairVal}er)`
    };
  }

  if (isFlush) {
    return {
      rank: HAND_RANKS.FLUSH,
      tieBreakers: values,
      desc: `${HAND_NAMES_DE[HAND_RANKS.FLUSH]} (${values[0]} hoch)`
    };
  }

  if (isStraight) {
    return {
      rank: HAND_RANKS.STRAIGHT,
      tieBreakers: [straightHigh],
      desc: `${HAND_NAMES_DE[HAND_RANKS.STRAIGHT]} (${straightHigh} hoch)`
    };
  }

  if (groups[0][1] === 3) {
    const tripVal = groups[0][0];
    const kickers = [groups[1][0], groups[2][0]];
    return {
      rank: HAND_RANKS.THREE_OF_A_KIND,
      tieBreakers: [tripVal, ...kickers],
      desc: `${HAND_NAMES_DE[HAND_RANKS.THREE_OF_A_KIND]} (${tripVal}er)`
    };
  }

  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const highPair = groups[0][0];
    const lowPair = groups[1][0];
    const kicker = groups[2][0];
    return {
      rank: HAND_RANKS.TWO_PAIR,
      tieBreakers: [highPair, lowPair, kicker],
      desc: `${HAND_NAMES_DE[HAND_RANKS.TWO_PAIR]} (${highPair}er und ${lowPair}er)`
    };
  }

  if (groups[0][1] === 2) {
    const pairVal = groups[0][0];
    const kickers = [groups[1][0], groups[2][0], groups[3][0]];
    return {
      rank: HAND_RANKS.ONE_PAIR,
      tieBreakers: [pairVal, ...kickers],
      desc: `${HAND_NAMES_DE[HAND_RANKS.ONE_PAIR]} (${pairVal}er)`
    };
  }

  return {
    rank: HAND_RANKS.HIGH_CARD,
    tieBreakers: values,
    desc: `${HAND_NAMES_DE[HAND_RANKS.HIGH_CARD]} (${values[0]})`
  };
}

// Compare two evaluated 5-card hands. Returns >0 if a > b, <0 if a < b, 0 if equal.
function compareEvaluated(a, b) {
  if (a.rank !== b.rank) {
    return a.rank - b.rank;
  }
  for (let i = 0; i < a.tieBreakers.length; i++) {
    if (a.tieBreakers[i] !== b.tieBreakers[i]) {
      return a.tieBreakers[i] - b.tieBreakers[i];
    }
  }
  return 0;
}

// Evaluate 7 cards (hole cards + community cards)
function evaluate7Cards(holeCards, communityCards) {
  const allCards = [...holeCards, ...communityCards];
  if (allCards.length < 5) {
    return { rank: 0, tieBreakers: [], desc: 'Unvollständig', cards: allCards };
  }

  const combos = getCombinations(allCards, 5);
  let bestHand = null;

  for (const combo of combos) {
    const evalResult = evaluate5CardHand(combo);
    evalResult.cards = combo;
    if (!bestHand || compareEvaluated(evalResult, bestHand) > 0) {
      bestHand = evalResult;
    }
  }

  return bestHand;
}

module.exports = {
  HAND_RANKS,
  HAND_NAMES_DE,
  evaluate7Cards,
  compareEvaluated
};
