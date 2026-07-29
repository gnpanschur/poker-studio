import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react';

const QUICK_EMOJIS = ['💩', '🔥', '😎', '🚀', '🎉', '👑', '👏', '💰'];

export default function ChatAndEmoji({ chatMessages, onSendChat, onSendEmoji }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMsg.trim()) {
      onSendChat(inputMsg.trim());
      setInputMsg('');
    }
  };

  return (
    <div className="chat-drawer" style={{ height: isOpen ? '360px' : '44px' }}>
      {/* Drawer Header Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: isOpen ? '14px 14px 0 0' : '14px',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.88rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={16} color="var(--accent-gold)" />
          <span>Tisch-Chat & Emojis</span>
        </div>
        {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {isOpen && (
        <div className="glass-panel" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0 0 14px 14px',
          borderTop: 'none',
          overflow: 'hidden'
        }}>
          {/* Messages list */}
          <div className="chat-messages-list">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="chat-msg">
                <span className="sender">{msg.sender}: </span>
                <span style={{ color: msg.sender === 'System' ? '#94a3b8' : '#e2e8f0' }}>{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Emoji Bar */}
          <div className="emoji-bar">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-btn"
                onClick={() => onSendEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            padding: '8px',
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}>
            <input
              type="text"
              placeholder="Nachricht schreiben..."
              maxLength={120}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
            <button
              type="submit"
              style={{
                marginLeft: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'var(--accent-gold)',
                color: '#000',
                fontWeight: 800
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
