import React from 'react';

const SUIT_MAP = {
  s: 'spades',
  h: 'hearts',
  d: 'diamonds',
  c: 'clubs',
  spades: 'spades',
  hearts: 'hearts',
  diamonds: 'diamonds',
  clubs: 'clubs'
};

const VALUE_MAP = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'jack', 12: 'queen', 13: 'king', 14: 'ace',
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
  'J': 'jack', 'Q': 'queen', 'K': 'king', 'A': 'ace',
  'j': 'jack', 'q': 'queen', 'k': 'king', 'a': 'ace',
  'jack': 'jack', 'queen': 'queen', 'king': 'king', 'ace': 'ace'
};

const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };

export function getCardSvgPath(card) {
  if (!card || card.hidden) return null;

  let suitName = card.suit ? SUIT_MAP[card.suit] : null;
  let valueName = card.value !== undefined ? VALUE_MAP[card.value] : null;

  if ((!suitName || !valueName) && card.code && card.code.length >= 2) {
    const suitChar = card.code.slice(-1).toLowerCase();
    const valStr = card.code.slice(0, -1);
    if (!suitName) suitName = SUIT_MAP[suitChar];
    if (!valueName) valueName = VALUE_MAP[valStr];
  }

  if (!suitName || !valueName) return null;

  const isFaceCard = ['jack', 'queen', 'king'].includes(valueName);
  const filename = isFaceCard
    ? `${valueName}_of_${suitName}2.svg`
    : `${valueName}_of_${suitName}.svg`;

  return `/svg/${filename}`;
}

export default function Card({ card, className = '' }) {
  if (!card) return null;

  if (card.hidden) {
    return (
      <div className={`playing-card card-back animate-deal ${className}`}>
        <div className="card-back-inner" />
      </div>
    );
  }

  const svgPath = getCardSvgPath(card);

  if (svgPath) {
    return (
      <div className={`playing-card svg-card animate-deal ${className}`}>
        <img
          src={svgPath}
          alt={card.name || `${card.value} of ${card.suit}`}
          className="card-svg-img"
          draggable={false}
        />
      </div>
    );
  }

  const isRed = card.suit === 'h' || card.suit === 'd';
  return (
    <div className={`playing-card ${isRed ? 'red' : 'black'} animate-deal ${className}`}>
      <div className="card-corner-top">
        <span>{card.name ? card.name.slice(0, -1) : card.value}</span>
      </div>
      <div className="card-suit-center">
        {SUIT_SYMBOLS[card.suit] || card.suit}
      </div>
    </div>
  );
}
