import { useEffect, useRef, useState } from 'react';
import './AIChat.css';

const quickPrompts = ['查詢案件進度', '如何線上申報？', '常見問題'];

function AIChatModal({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 260);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  const choosePrompt = (prompt) => {
    setMessage(prompt);
    inputRef.current?.focus();
  };

  const sendMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    // API 串接前保留輸入內容，避免使用者誤送時遺失文字。
    setMessage('');
  };

  return (
    <div
      className={`ai-chat-layer ${isOpen ? 'is-open' : ''}`}
      aria-hidden={!isOpen}
    >
      <button 
        className="ai-chat-backdrop" 
        type="button" 
        onClick={onClose} 
        tabIndex={isOpen ? 0 : -1} 
        aria-label="關閉 AI 助手" 
    />

      <section id="ai-chat-modal" className="ai-chat-modal" role="dialog" aria-modal="true" aria-labelledby="ai-chat-title">
        <header className="ai-chat-header">
          <div>
            <span className="ai-status-dot" aria-hidden="true" />
            <p>數位服務小幫手</p>
            <h2 id="ai-chat-title">AI 助手</h2>
          </div>
          <div className="ai-header-actions">
            <button type="button" onClick={onClose} aria-label="最小化 AI 助手" title="最小化">
              <span aria-hidden="true">−</span>
            </button>
            <button type="button" onClick={onClose} aria-label="關閉 AI 助手" title="關閉">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </header>

        <div className="ai-chat-body">
          <div className="ai-welcome-message">
            <span className="ai-message-mark" aria-hidden="true">AI</span>
            <div>
              <p>您好！我是數位服務 AI 助手。</p>
              <p>我可以協助您查詢案件進度、了解線上申辦流程，或回答常見問題。</p>
            </div>
          </div>
          <div className="ai-quick-prompts" aria-label="快捷提問">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => choosePrompt(prompt)}>{prompt}</button>
            ))}
          </div>
        </div>

        <form className="ai-input-footer" onSubmit={sendMessage}>
          <label className="sr-only" htmlFor="ai-message-input">輸入訊息</label>
          <input
            ref={inputRef}
            id="ai-message-input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="輸入您的問題..."
            disabled={!isOpen}
          />
          <button type="submit" disabled={!message.trim()} aria-label="發送訊息">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m4 4 16 8-16 8 3-8-3-8Z" strokeLinejoin="round" /></svg>
            <span>發送</span>
          </button>
        </form>
      </section>
    </div>
  );
}

export default AIChatModal;
