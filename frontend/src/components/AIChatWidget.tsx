"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './AIChatWidget.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your Adroit AI Assistant. I can help you search for records, check compliances, and automate workflows. Try asking me "Show visas expiring in 60 days".' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: `⚠️ Unable to reach the AI Engine (${msg}). Please try again shortly.` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        className={`${styles.chatFab} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(true)}
      >
        ✨
      </button>

      <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <span className={styles.headerTitle}>Adroit AI</span>
            <span className={styles.headerSubtitle}>Real-time NLP Assistant</span>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className={styles.chatBody} ref={chatBodyRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.wrapperUser : styles.wrapperAi}`}>
              {msg.role === 'ai' && <div className={styles.avatarAi}>✨</div>}
              <div className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAi}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={`${styles.messageWrapper} ${styles.wrapperAi}`}>
              <div className={styles.avatarAi}>✨</div>
              <div className={`${styles.message} ${styles.messageAi} ${styles.typingIndicator}`}>
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.suggestionChips}>
          <button onClick={() => setInput("Show visas expiring in 60 days")}>Visas expiring in 60d</button>
          <button onClick={() => setInput("Find VH-0108 insurance")}>Find VH-0108</button>
        </div>

        <div className={styles.chatFooter}>
          <input 
            type="text" 
            placeholder="Ask AI anything..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={isTyping || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </>
  );
}
