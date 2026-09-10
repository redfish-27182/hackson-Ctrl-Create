import './AIChat.css';

function AIButton({ onClick, isOpen }) {
  return (
    <button
      className={`ai-fab ${isOpen ? 'is-open' : ''}`}
      type="button"
      onClick={onClick}
      aria-label={isOpen ? '收合 AI 助手' : '開啟 AI 助手'}
      aria-expanded={isOpen}
      aria-controls="ai-chat-modal"
    >
      <span className="ai-fab-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3.5a6.5 6.5 0 0 0-6.5 6.5v2.4A3.4 3.4 0 0 0 8.9 15.8H10l2 2.7 2-2.7h1.1a3.4 3.4 0 0 0 3.4-3.4V10A6.5 6.5 0 0 0 12 3.5Z" />
          <path d="M9.3 10.2h.01M14.7 10.2h.01" strokeLinecap="round" strokeWidth="2.4" />
        </svg>
      </span>
      <span>AI 助手</span>
    </button>
  );
}

export default AIButton;
