import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

const QUICK_EMOJIS = ['💩', '🔥', '😎', '🚀', '🎉', '👑', '👏', '💰'];

export default function ChatAndEmoji({ chatMessages, onSendChat, onSendEmoji }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [pos, setPos] = useState({ x: null, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  
  const chatEndRef = useRef(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  // Initial position: Top Right under top-header (70px from top)
  useEffect(() => {
    const initX = Math.max(10, window.innerWidth - 316);
    setPos({ x: initX, y: 70 });

    const handleResize = () => {
      setPos(prev => ({
        x: Math.min(prev.x, Math.max(10, window.innerWidth - 316)),
        y: Math.min(prev.y, Math.max(10, window.innerHeight - 60))
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  // Pointer event handlers for smooth dragging (Mouse & Touch)
  const handlePointerDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.x !== null ? pos.x : (window.innerWidth - 316),
      posY: pos.y
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    let newX = dragStartRef.current.posX + deltaX;
    let newY = dragStartRef.current.posY + deltaY;

    // Keep within screen bounds
    newX = Math.max(10, Math.min(window.innerWidth - 310, newX));
    newY = Math.max(10, Math.min(window.innerHeight - 60, newY));

    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMsg.trim()) {
      onSendChat(inputMsg.trim());
      setInputMsg('');
    }
  };

  return (
    <div
      className="chat-drawer"
      style={{
        position: 'fixed',
        left: pos.x !== null ? `${pos.x}px` : 'auto',
        right: pos.x === null ? '16px' : 'auto',
        top: `${pos.y}px`,
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: isDragging ? '0 16px 36px rgba(0,0,0,0.7)' : '0 10px 25px rgba(0,0,0,0.4)',
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease, opacity 0.2s ease'
      }}
    >
      {/* Draggable Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: isOpen ? '14px 14px 0 0' : '14px',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.88rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(12px)',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GripVertical size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <MessageSquare size={16} color="var(--accent-gold)" />
          <span>Tisch-Chat & Emojis</span>
        </div>

        <button
          className="no-drag"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="glass-panel" style={{
          maxHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0 0 14px 14px',
          borderTop: 'none',
          overflow: 'hidden'
        }}>
          {/* Messages list (only last 3 entries) */}
          <div className="chat-messages-list" style={{ padding: '8px 12px', gap: '6px' }}>
            {chatMessages.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.78rem', fontStyle: 'italic', textAlign: 'center', padding: '6px 0' }}>
                Noch keine Nachrichten...
              </div>
            ) : (
              chatMessages.slice(-3).map((msg) => (
                <div key={msg.id} className="chat-msg">
                  <span className="sender">{msg.sender}: </span>
                  <span style={{ color: msg.sender === 'System' ? '#94a3b8' : '#e2e8f0' }}>{msg.text}</span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Emoji Bar */}
          <div className="emoji-bar">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-btn no-drag"
                onClick={() => onSendEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="no-drag" style={{
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
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer'
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
