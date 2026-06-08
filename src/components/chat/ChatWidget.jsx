import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import api from '../../api/client';
import chatbotLogo from '../../assets/Ai chatbot logo.png';
import './ChatWidget.css';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [attention, setAttention] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm your MeramotHub assistant. Describe your problem and I'll help you find the right service provider." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowTooltip(false);
    }
  }, [messages, open]);

  // Periodic attention seeker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!open) {
        setAttention(true);
        setTimeout(() => setAttention(false), 1000);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setSending(true);
    try {
      const res = await api.chatBot(text);
      const reply = res?.reply || res?.message || res?.response || "I can help you find services. Try describing your problem!";
      setMessages(m => [...m, { role: 'bot', text: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!open && (
        <div className="chat-trigger-wrapper">
          {showTooltip && (
            <div className="chat-tooltip">
              Need help? Ask me!
            </div>
          )}
          <button 
            className={`chat-trigger ${attention ? 'attention' : ''}`} 
            onClick={() => setOpen(true)} 
            aria-label="Open chatbot"
          >
            <div className="chat-status-indicator" />
            <img src={chatbotLogo} alt="AI Chatbot" className="chat-trigger-icon" />
          </button>
        </div>
      )}

      {open && (
        <div className="chat-overlay" onClick={() => setOpen(false)}>
          <div className="chat-modal" onClick={e => e.stopPropagation()}>
            <div className="chat-modal-header">
              <div className="chat-modal-title">
                <MessageCircle size={20} />
                <span>AI Chatbot</span>
              </div>
              <button className="chat-modal-close" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="chat-modal-body">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  <div className="chat-msg-avatar">
                    {msg.role === 'bot' ? '🤖' : '👤'}
                  </div>
                  <div className="chat-msg-bubble">{msg.text}</div>
                </div>
              ))}
              {sending && (
                <div className="chat-msg bot">
                  <div className="chat-msg-avatar">🤖</div>
                  <div className="chat-msg-bubble typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form className="chat-modal-footer" onSubmit={handleSend}>
              <input
                className="chat-input"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button className="chat-send" type="submit" disabled={sending}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
