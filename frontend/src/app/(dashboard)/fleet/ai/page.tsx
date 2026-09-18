"use client";

import React, { useState, useRef, useEffect } from 'react';

const API_BASE = 'http://localhost:8000/api/v1';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const SUGGESTIONS = [
  'Show me all vehicles expiring this month',
  'Which assets are currently in maintenance?',
  'List all vehicles without a valid insurance',
  'How many heavy vehicles do we have?',
  'Which vehicle has the highest mileage?',
];

export default function FleetAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your Fleet AI Assistant. I can help you find vehicle information, check document statuses, identify expiries, and generate management summaries — just ask in plain language.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || loading) return;

    const userMsg: Message = { role: 'user', content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_BASE}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      let reply = '';
      if (res.ok) {
        const data = await res.json();
        reply = data.response ?? data.answer ?? data.result ?? JSON.stringify(data);
      } else {
        reply = `Sorry, the AI service returned an error (${res.status}). Please try again or rephrase your question.`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '⚠️ Could not reach the AI service. Please check your connection and try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', animation: 'fadeInSlide 0.5s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#fff,#94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.4rem' }}>
          🤖 AI Assistance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Natural-language search for vehicles, documents, expiries and management summaries.
        </p>
      </div>

      {/* Suggestion chips */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={loading}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              background: 'rgba(14,165,233,0.08)', color: 'var(--accent-solid)', border: '1px solid rgba(14,165,233,0.2)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(14,165,233,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(14,165,233,0.08)'; }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div style={{
        flex: 1, overflowY: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
        marginBottom: '1.25rem', scrollbarWidth: 'thin',
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: '0.75rem', alignItems: 'flex-end' }}>
            {/* Avatar */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
              background: m.role === 'user' ? 'rgba(14,165,233,0.2)' : 'rgba(99,102,241,0.2)',
              border: m.role === 'user' ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(99,102,241,0.3)',
            }}>
              {m.role === 'user' ? '👤' : '🤖'}
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: '75%' }}>
              <div style={{
                padding: '0.85rem 1.15rem', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user' ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.05)',
                border: m.role === 'user' ? '1px solid rgba(14,165,233,0.25)' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)', fontSize: '0.93rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', textAlign: m.role === 'user' ? 'right' : 'left', paddingInline: '0.25rem' }}>
                {formatTime(m.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🤖</div>
            <div style={{ padding: '0.85rem 1.25rem', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                {[0, 0.15, 0.3].map((d, i) => (
                  <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-solid)', animation: `pulse 1s ${d}s infinite ease-in-out` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder="Ask anything about your fleet..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          disabled={loading}
          style={{
            flex: 1, padding: '0.9rem 1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: '14px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            padding: '0.9rem 1.5rem', borderRadius: '14px', background: 'var(--accent-solid)', color: '#fff',
            border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontWeight: 700,
            fontSize: '0.95rem', opacity: loading || !input.trim() ? 0.5 : 1, transition: 'opacity 0.2s',
          }}
        >
          Send ↑
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.6); opacity: 0.4; }
          50% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
