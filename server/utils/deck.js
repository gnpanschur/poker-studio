const SUITS = ['s', 'h', 'd', 'c']; // Spades, Hearts, Diamonds, Clubs
const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11=J, 12=Q, 13=K, 14=A

const VALUE_NAMES = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

const SUIT_SYMBOLS = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣'
};

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({
        suit,
        value,
        name: `${VALUE_NAMES[value]}${SUIT_SYMBOLS[suit]}`,
        code: `${VALUE_NAMES[value]}${suit}`
      });
    }
  }
  return shuffle(deck);
}

function shuffle(array) {
  const deck = [...array];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

module.exports = {
  createDeck,
  shuffle,
  SUITS,
  VALUES,
  VALUE_NAMES,
  SUIT_SYMBOLS
};
