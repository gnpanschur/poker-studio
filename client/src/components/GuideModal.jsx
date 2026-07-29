import React, { useState } from 'react';
import { BookOpen, X, Trophy, Coins, Flame, Layers } from 'lucide-react';

const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };

function MiniCard({ rank, suit }) {
  const isRed = suit === 'h' || suit === 'd';
  return (
    <div style={{
      width: '30px',
      height: '44px',
      background: '#ffffff',
      borderRadius: '5px',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '3px 4px',
      fontSize: '0.72rem',
      fontWeight: 800,
      color: isRed ? '#dc2626' : '#1e293b',
      userSelect: 'none',
      flexShrink: 0,
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <div style={{ lineHeight: 1 }}>{rank}</div>
      <div style={{ alignSelf: 'center', fontSize: '0.95rem', marginTop: '-4px' }}>
        {SUIT_SYMBOLS[suit] || suit}
      </div>
    </div>
  );
}

const HAND_RANKS = [
  {
    rank: 1,
    name: 'Royal Flush',
    badge: 'Unschlagbar',
    badgeColor: '#f59e0b',
    summary: '10, Bube, Dame, König, Ass in derselben Farbe.',
    description: 'Das stärkste und seltenste Blatt im Poker. Es besteht aus den 5 höchsten Karten (10, J, Q, K, A) in ein und derselben Farbe.',
    cards: [
      { rank: '10', suit: 's' },
      { rank: 'J', suit: 's' },
      { rank: 'Q', suit: 's' },
      { rank: 'K', suit: 's' },
      { rank: 'A', suit: 's' }
    ]
  },
  {
    rank: 2,
    name: 'Straight Flush',
    badge: 'Extrem Stark',
    badgeColor: '#f59e0b',
    summary: '5 aufeinanderfolgende Karten der gleichen Farbe.',
    description: 'Fünf fortlaufende Karten in derselben Farbe (z. B. 5-6-7-8-9 in Herz). Bei zwei Straight Flushes gewinnt die Straße mit der höheren Endkarte.',
    cards: [
      { rank: '9', suit: 'h' },
      { rank: '8', suit: 'h' },
      { rank: '7', suit: 'h' },
      { rank: '6', suit: 'h' },
      { rank: '5', suit: 'h' }
    ]
  },
  {
    rank: 3,
    name: 'Vierling (Four of a Kind)',
    badge: 'Sehr Stark',
    badgeColor: '#eab308',
    summary: '4 Karten desselben Werts (z. B. 4x Ass).',
    description: 'Vier Karten mit identischem Rang (z. B. vier Asse) + 1 Beikarte (Kicker). Bei Gleichstand gewinnt der höhere Vierling bzw. der höhere Kicker.',
    cards: [
      { rank: 'A', suit: 's' },
      { rank: 'A', suit: 'h' },
      { rank: 'A', suit: 'd' },
      { rank: 'A', suit: 'c' },
      { rank: 'K', suit: 's' }
    ]
  },
  {
    rank: 4,
    name: 'Full House',
    badge: 'Stark',
    badgeColor: '#10b981',
    summary: 'Drilling + ein Paar (z. B. 3x K + 2x 10).',
    description: 'Besteht aus drei Karten eines Rangs (Drilling) und zwei Karten eines anderen Rangs (Paar). Bei zwei Full Houses entscheidet der höhere Drilling.',
    cards: [
      { rank: 'K', suit: 's' },
      { rank: 'K', suit: 'h' },
      { rank: 'K', suit: 'd' },
      { rank: '10', suit: 's' },
      { rank: '10', suit: 'c' }
    ]
  },
  {
    rank: 5,
    name: 'Flush',
    badge: 'Solide',
    badgeColor: '#06b6d4',
    summary: '5 beliebige Karten derselben Farbe.',
    description: 'Fünf beliebige Karten der gleichen Farbe (z. B. alle Karo). Haben zwei Spieler einen Flush, entscheidet die höchste Einzelkarte.',
    cards: [
      { rank: 'A', suit: 'd' },
      { rank: 'J', suit: 'd' },
      { rank: '8', suit: 'd' },
      { rank: '6', suit: 'd' },
      { rank: '3', suit: 'd' }
    ]
  },
  {
    rank: 6,
    name: 'Straße (Straight)',
    badge: 'Mittel',
    badgeColor: '#3b82f6',
    summary: '5 aufeinanderfolgende Werte (Farben egal).',
    description: 'Fünf fortlaufende Kartenwerte beliebiger Farben. Das Ass kann als höchste Karte (10-J-Q-K-A) oder als niedrigste Karte (A-2-3-4-5) genutzt werden.',
    cards: [
      { rank: '10', suit: 'c' },
      { rank: '9', suit: 'd' },
      { rank: '8', suit: 's' },
      { rank: '7', suit: 'h' },
      { rank: '6', suit: 'd' }
    ]
  },
  {
    rank: 7,
    name: 'Drilling (Three of a Kind)',
    badge: 'Gut',
    badgeColor: '#8b5cf6',
    summary: '3 Karten desselben Werts + 2 Kicker.',
    description: 'Drei Karten mit gleichem Rang + zwei ungepaarte Beikarten. Der höhere Drilling gewinnt. Bei gleichem Drilling entscheiden die Kicker.',
    cards: [
      { rank: 'Q', suit: 's' },
      { rank: 'Q', suit: 'h' },
      { rank: 'Q', suit: 'd' },
      { rank: 'K', suit: 's' },
      { rank: '7', suit: 'c' }
    ]
  },
  {
    rank: 8,
    name: 'Zwei Paare (Two Pair)',
    badge: 'Standard',
    badgeColor: '#ec4899',
    summary: 'Zwei verschiedene Paare (z. B. 2x Q + 2x 8).',
    description: 'Zwei unterschiedliche Kartenpaare + 1 Kicker-Karte. Der Spieler mit dem höheren ersten Paar gewinnt, danach zählt das zweite Paar, dann der Kicker.',
    cards: [
      { rank: 'J', suit: 's' },
      { rank: 'J', suit: 'h' },
      { rank: '8', suit: 'd' },
      { rank: '8', suit: 'c' },
      { rank: 'A', suit: 's' }
    ]
  },
  {
    rank: 9,
    name: 'Ein Paar (One Pair)',
    badge: 'Basis',
    badgeColor: '#cbd5e1',
    summary: '2 Karten desselben Werts + 3 Kicker.',
    description: 'Zwei Karten desselben Rangs und drei ungepaarte Beikarten. Das höhere Paar gewinnt. Bei gleichem Paar entscheiden nacheinander die Kicker.',
    cards: [
      { rank: '10', suit: 's' },
      { rank: '10', suit: 'h' },
      { rank: 'A', suit: 'd' },
      { rank: 'K', suit: 'c' },
      { rank: '4', suit: 's' }
    ]
  },
  {
    rank: 10,
    name: 'Höchste Karte (High Card)',
    badge: 'Niedrig',
    badgeColor: '#64748b',
    summary: 'Keine Kombination - die höchste Karte zählt.',
    description: 'Wenn kein Spieler eine Kombination trifft, entscheidet die einzeln höchste Karte im Blatt (Ass ist am höchsten, gefolgt von K, Q, J, 10...).',
    cards: [
      { rank: 'A', suit: 's' },
      { rank: 'K', suit: 'd' },
      { rank: '9', suit: 'h' },
      { rank: '7', suit: 'c' },
      { rank: '3', suit: 's' }
    ]
  }
];

export default function GuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('hands'); // 'hands' | 'flow' | 'blinds' | 'actions'

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(11, 15, 25, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px 16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '640px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        background: '#0f172a'
      }}>
        {/* Modal Header - Fixed at top, no shrinking */}
        <div style={{
          flexShrink: 0,
          padding: '16px 20px',
          background: '#121a2b',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="var(--accent-gold)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Poker-Spielanleitung & Hand-Ränge
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#94a3b8',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs - Fixed below header, no shrinking */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          background: '#0b1329',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          zIndex: 9
        }}>
          <button
            onClick={() => setActiveTab('hands')}
            style={{
              flex: 1,
              minWidth: '110px',
              padding: '12px 8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: activeTab === 'hands' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'hands' ? 'var(--accent-gold)' : '#94a3b8',
              borderBottom: activeTab === 'hands' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            🏆 Hand-Ränge
          </button>

          <button
            onClick={() => setActiveTab('flow')}
            style={{
              flex: 1,
              minWidth: '110px',
              padding: '12px 8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: activeTab === 'flow' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'flow' ? 'var(--accent-gold)' : '#94a3b8',
              borderBottom: activeTab === 'flow' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            🃏 Hand-Ablauf
          </button>

          <button
            onClick={() => setActiveTab('blinds')}
            style={{
              flex: 1,
              minWidth: '100px',
              padding: '12px 8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: activeTab === 'blinds' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'blinds' ? 'var(--accent-gold)' : '#94a3b8',
              borderBottom: activeTab === 'blinds' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            🪙 Blinds & Pot
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            style={{
              flex: 1,
              minWidth: '90px',
              padding: '12px 8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: activeTab === 'actions' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'actions' ? 'var(--accent-gold)' : '#94a3b8',
              borderBottom: activeTab === 'actions' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            🎯 Aktionen
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          color: '#e2e8f0'
        }}>
          {/* TAB: HAND RANKS */}
          {activeTab === 'hands' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                fontSize: '0.84rem',
                color: '#cbd5e1'
              }}>
                <strong style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Trophy size={16} /> Das Texas Hold'em Prinzip:
                </strong>
                Deine beste Pokerhand besteht immer aus genau <strong>5 Karten</strong>, gebildet aus deinen 2 verdeckten Handkarten und den 5 Gemeinschaftskarten am Tisch.
              </div>

              {HAND_RANKS.map((item) => (
                <div key={item.rank} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* Card Header Line - Separated from text */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: 'rgba(245, 158, 11, 0.18)',
                        color: 'var(--accent-gold)',
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(245, 158, 11, 0.3)'
                      }}>
                        #{item.rank}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                        {item.name}
                      </h3>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: `${item.badgeColor}22`,
                      color: item.badgeColor,
                      border: `1px solid ${item.badgeColor}44`,
                      whiteSpace: 'nowrap'
                    }}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Cards Row & Text */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {/* 5 Mini Playing Cards */}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '2px' }}>
                      {item.cards.map((c, i) => (
                        <MiniCard key={i} rank={c.rank} suit={c.suit} />
                      ))}
                    </div>

                    {/* Description Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <p style={{ fontWeight: 700, color: '#f1f5f9', margin: 0, fontSize: '0.86rem', lineHeight: 1.35 }}>
                        {item.summary}
                      </p>
                      <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.81rem', lineHeight: 1.4 }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: HAND FLOW / ABLAUF */}
          {activeTab === 'flow' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                fontSize: '0.85rem'
              }}>
                <strong style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Layers size={16} /> Der Ablauf einer Poker-Runde
                </strong>
                Jede Pokerhand verläuft in bis zu 4 Setzrunden. Vor dem Dealen zahlt der Small & Big Blind die Pflichteinsätze.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>1. Pre-Flop (Die Handkarten)</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>2 verdeckte Karten</span>
                  </div>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>
                    Jeder Spieler erhält 2 nur für ihn sichtbare Handkarten (Hole Cards). Die erste Setzrunde beginnt beim Spieler links vom Big Blind.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>2. Der Flop (3 Tischkarten)</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>3 offene Karten</span>
                  </div>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>
                    Der Dealer legt 3 Gemeinschaftskarten offen in die Tischmitte. Es folgt die 2. Setzrunde.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#3b82f6', fontSize: '0.95rem' }}>3. Der Turn (4. Tischkarte)</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>+1 offene Karte</span>
                  </div>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>
                    Eine 4. Gemeinschaftskarte wird aufgedeckt. Es folgt die 3. Setzrunde.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#8b5cf6', fontSize: '0.95rem' }}>4. Der River (5. Tischkarte)</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>+1 offene Karte (Gesamt: 5)</span>
                  </div>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>
                    Die 5. und letzte Gemeinschaftskarte wird aufgedeckt. Es folgt die finale Setzrunde.
                  </p>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--accent-gold)', fontSize: '0.95rem' }}>🏆 Der Showdown</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Karten aufdecken</span>
                  </div>
                  <p style={{ margin: 0, color: '#f1f5f9', fontSize: '0.85rem' }}>
                    Alle verbliebenen Spieler decken ihre Karten auf. Das System bewertet automatisch die beste 5-Karten-Kombination aus allen 7 verfügbaren Karten. Der Gewinner erhält den gesamten Pot! Bei gleicher Handstärke wird der Pot geteilt (Split Pot).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BLINDS & POT */}
          {activeTab === 'blinds' && (
            <>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h4 style={{ color: 'var(--accent-gold)', marginBottom: '6px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 6px 0' }}>
                  <Coins size={18} /> Was sind Small & Big Blind?
                </h4>
                <p style={{ margin: 0 }}>
                  Die <strong>Blinds</strong> sind Pflichteinsätze, die vor jedem Geben von zwei festgelegten Spielern am Tisch eingezahlt werden müssen. 
                  Dadurch liegt in jeder Hand von Beginn an Spielgeld im <strong>Pot</strong>, um das gespielt wird.
                </p>
                <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#94a3b8', margin: '8px 0 0 0' }}>
                  <li><strong>Small Blind (SB):</strong> Der kleinere Pflichteinsatz (z. B. 10 Chips), gezahlt vom Spieler links neben dem Dealer (D).</li>
                  <li><strong>Big Blind (BB):</strong> Der doppelte Pflichteinsatz (z. B. 20 Chips), gezahlt vom Spieler links neben dem Small Blind.</li>
                </ul>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h4 style={{ color: '#10b981', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 6px 0' }}>
                  <Flame size={18} /> Warum erhöht sich der POT & die Blinds?
                </h4>
                <p style={{ margin: 0 }}>
                  Im <strong>Sit & Go Turnier-Format</strong> steigen die Blinds automatisch nach festgelegten Zeitintervallen (z. B. alle 3 Minuten von 10/20 auf 20/40, 30/60 usw.).
                </p>
                <p style={{ marginTop: '6px', margin: '6px 0 0 0' }}>
                  Jedes Mal, wenn Spieler mitgehen oder erhöhen, wandern die Chips in den <strong>Pot</strong> in der Tischmitte. Der Spieler mit dem besten Blatt am Showdown gewinnt den gesamten Pot!
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h4 style={{ color: '#3b82f6', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 6px 0' }}>
                  <Trophy size={18} /> Wie gewinnt man das Turnier?
                </h4>
                <p style={{ margin: 0 }}>
                  Jeder Spieler startet mit <strong>1.000 Start-Chips</strong>. Wer alle Chips verliert, ist ausgeschieden und wechselt in den Zuschauer-Modus (Spectator). 
                  Wer am Ende alle Chips aller Mitspieler gesammelt hat, gewinnt das Turnier!
                </p>
              </div>
            </>
          )}

          {/* TAB: ACTIONS */}
          {activeTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px 14px', borderRadius: '10px', borderLeft: '4px solid #ef4444' }}>
                <strong style={{ color: '#ef4444' }}>Passen (Fold):</strong> Du steigst aus der aktuellen Hand aus und legst deine Karten ab. Du verlierst deinen bisher gesetzten Einsatz, riskierst aber keine weiteren Chips.
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px 14px', borderRadius: '10px', borderLeft: '4px solid #3b82f6' }}>
                <strong style={{ color: '#3b82f6' }}>Check:</strong> Du spielst weiter, ohne zusätzliche Chips zu setzen (nur möglich, wenn vor dir in dieser Setzrunde noch niemand erhöht hat).
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px 14px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                <strong style={{ color: '#10b981' }}>Mitgehen (Call):</strong> Du zahlst genau den Chip-Betrag ein, den die Spieler vor dir gesetzt oder erhöht haben, um in der Runde zu bleiben.
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px 14px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
                <strong style={{ color: '#f59e0b' }}>Erhöhen (Raise):</strong> Du setzt mehr Chips als der aktuelle Höchsteinsatz, um den Druck auf andere Spieler zu erhöhen.
              </div>

              <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '12px 14px', borderRadius: '10px', borderLeft: '4px solid #ec4899' }}>
                <strong style={{ color: '#ec4899' }}>All-In:</strong> Du setzt deinen gesamten verbleibenden Chip-Stapel auf einmal!
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer - Fixed at bottom, no shrinking */}
        <div style={{
          flexShrink: 0,
          padding: '12px 20px',
          background: '#121a2b',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'right'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              background: 'var(--accent-gold)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Verstanden & Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
