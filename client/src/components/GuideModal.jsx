import React, { useState } from 'react';
import { BookOpen, X, Trophy, Coins, Flame, ArrowUpRight, HelpCircle } from 'lucide-react';

export default function GuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('blinds'); // 'blinds' | 'actions' | 'hands'

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(18, 26, 43, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="var(--accent-gold)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              Spielanleitung & Poker-Regeln
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
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => setActiveTab('blinds')}
            style={{
              flex: 1,
              padding: '12px 8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: activeTab === 'blinds' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'blinds' ? 'var(--accent-gold)' : '#94a3b8',
              borderBottom: activeTab === 'blinds' ? '2px solid var(--accent-gold)' : '2px solid transparent'
            }}
          >
            🪙 Blinds & Pot
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            style={{
              flex: 1,
              padding: '12px 8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: activeTab === 'actions' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'actions' ? 'var(--accent-gold)' : '#94a3b8',
              borderBottom: activeTab === 'actions' ? '2px solid var(--accent-gold)' : '2px solid transparent'
            }}
          >
            🎯 Aktionen
          </button>

          <button
            onClick={() => setActiveTab('hands')}
            style={{
              flex: 1,
              padding: '12px 8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: activeTab === 'hands' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'hands' ? 'var(--accent-gold)' : '#94a3b8',
              borderBottom: activeTab === 'hands' ? '2px solid var(--accent-gold)' : '2px solid transparent'
            }}
          >
            🏆 Hand-Ränge
          </button>
        </div>

        {/* Tab Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          color: '#e2e8f0'
        }}>
          {activeTab === 'blinds' && (
            <>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h4 style={{ color: 'var(--accent-gold)', marginBottom: '6px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coins size={18} /> Was sind Small & Big Blind?
                </h4>
                <p>
                  Die <strong>Blinds</strong> sind Pflichteinsätze, die vor jedem Geben von zwei festgelegten Spielern am Tisch eingezahlt werden müssen. 
                  Dadurch liegt in jeder Hand von Beginn an Spielgeld im <strong>Pot</strong>, um das gespielt wird.
                </p>
                <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#94a3b8' }}>
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
                <h4 style={{ color: '#10b981', marginBottom: '6px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={18} /> Warum erhöht sich der POT & die Blinds?
                </h4>
                <p>
                  Im <strong>Sit & Go Turnier-Format</strong> steigen die Blinds automatisch nach festgelegten Zeitintervallen (z. B. alle 3 Minuten von 10/20 auf 20/40, 30/60 usw.).
                </p>
                <p style={{ marginTop: '6px' }}>
                  Jedes Mal, wenn Spieler mitgehen oder erhöhen, wandern die Chips in den <strong>Pot</strong> in der Tischmitte. Der Spieler mit dem besten Blatt am Showdown (oder der letzte verbliebene Spieler) gewinnt den gesamten Pot!
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h4 style={{ color: '#3b82f6', marginBottom: '6px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trophy size={18} /> Wie gewinnt man das Turnier?
                </h4>
                <p>
                  Jeder Spieler startet mit <strong>1.000 Start-Chips</strong>. Wer alle Chips verliert, ist ausgeschieden und wechselt in den Zuschauer-Modus (Spectator). 
                  Wer am Ende alle Chips aller Mitspieler gesammelt hat, gewinnt das Turnier!
                </p>
              </div>
            </>
          )}

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

          {activeTab === 'hands' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Die Stärke deiner Hand wird aus deinen 2 verdeckten Handkarten + den 5 Gemeinschaftskarten am Tisch gebildet:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>1. Royal Flush</span>
                  <span style={{ color: '#94a3b8' }}>10, J, Q, K, A derselben Farbe</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#f59e0b' }}>2. Straight Flush</span>
                  <span style={{ color: '#94a3b8' }}>5 aufeinanderfolgende Karten gleicher Farbe</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#eab308' }}>3. Vierling (Four of a Kind)</span>
                  <span style={{ color: '#94a3b8' }}>4 Karten desselben Werts (z. B. 4x Ass)</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#10b981' }}>4. Full House</span>
                  <span style={{ color: '#94a3b8' }}>Drilling + ein Paar (z. B. 3x K + 2x 10)</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#06b6d4' }}>5. Flush</span>
                  <span style={{ color: '#94a3b8' }}>5 beliebige Karten derselben Farbe</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#3b82f6' }}>6. Straße (Straight)</span>
                  <span style={{ color: '#94a3b8' }}>5 aufeinanderfolgende Werte (Farben egal)</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#8b5cf6' }}>7. Drilling (Three of a Kind)</span>
                  <span style={{ color: '#94a3b8' }}>3 Karten desselben Werts</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#ec4899' }}>8. Zwei Paare (Two Pair)</span>
                  <span style={{ color: '#94a3b8' }}>Zwei verschiedene Paare (z. B. 2x Q + 2x 8)</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#cbd5e1' }}>9. Ein Paar (One Pair)</span>
                  <span style={{ color: '#94a3b8' }}>2 Karten desselben Werts</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#64748b' }}>10. Höchste Karte (High Card)</span>
                  <span style={{ color: '#94a3b8' }}>Die höchste Karte entscheidet</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          background: 'rgba(18, 26, 43, 0.95)',
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
              fontSize: '0.9rem'
            }}
          >
            Verstanden & Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
