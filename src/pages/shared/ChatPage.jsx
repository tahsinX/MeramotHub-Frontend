import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import toast from 'react-hot-toast';

const CATEGORY_LABELS = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  ac_mechanic: 'AC Mechanic',
  carpenter: 'Carpenter',
  painter: 'Painter',
};

export default function ChatPage() {
  const { user: currentUser, isCustomer, isProvider } = useAuth();
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const basePath = isCustomer ? '/customer' : isProvider ? '/provider' : '/customer';
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const init = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getConversations();
      const convs = Array.isArray(data) ? data : [];
      setConversations(convs);

      if (routeUserId) {
        const existing = convs.find((c) => c.user.id === routeUserId);
        if (existing) {
          setSelectedUser(existing.user);
          loadMessages(routeUserId);
        } else {
          const userInfo = await api.getChatUser(routeUserId);
          setSelectedUser(userInfo);
          setMessages([]);
        }
      }
    } catch {
      setConversations([]);
      if (routeUserId) {
        setSelectedUser({ id: routeUserId, full_name: 'User', phone_number: '', role: '' });
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  }, [routeUserId]);

  useEffect(() => {
    init();
  }, [init]);

  const loadMessages = async (userId) => {
    setLoadingMessages(true);
    try {
      const data = await api.getConversationMessages(userId);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedUser(conv.user);
    navigate(`${basePath}/messages/${conv.user.id}`, { replace: true });
    loadMessages(conv.user.id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending || !selectedUser) return;
    setSending(true);
    const msgText = text;
    setText('');
    try {
      const msg = await api.sendMessage(selectedUser.id, msgText);
      setMessages((prev) => [...prev, msg]);
      const data = await api.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      setText(msgText);
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: 0, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      {/* Sidebar */}
      <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={18} /> Messages
          </h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user.id}
                onClick={() => handleSelectConversation(conv)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: selectedUser?.id === conv.user.id ? 'var(--color-bg)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  backgroundColor: 'var(--color-blue)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {conv.user.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{conv.user.full_name}</span>
                    {conv.unread_count > 0 && (
                      <span style={{
                        backgroundColor: 'var(--color-blue)', color: '#fff',
                        borderRadius: '50%', width: 20, height: 20,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  {conv.user.skill_category && (
                    <span style={{
                      fontSize: '0.75rem', color: 'var(--color-blue)', fontWeight: 500,
                      display: 'block', marginTop: 1,
                    }}>
                      {CATEGORY_LABELS[conv.user.skill_category] || conv.user.skill_category}
                    </span>
                  )}
                  <span style={{
                    fontSize: '0.8rem', color: 'var(--color-text-secondary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    display: 'block', marginTop: 2,
                  }}>
                    {conv.last_message?.text || 'No messages yet'}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
        {!selectedUser ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-secondary)', fontSize: '0.95rem',
          }}>
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: 'var(--color-blue)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}>
                {selectedUser.full_name?.charAt(0)?.toUpperCase()}
              </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedUser.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {selectedUser.skill_category
                      ? CATEGORY_LABELS[selectedUser.skill_category] || selectedUser.skill_category
                      : selectedUser.role?.replace('_', ' ')}
                  </div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loadingMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                  <div className="spinner" />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', padding: '2rem 0' }}>
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === currentUser?.id;
                  return (
                    <div key={msg.id} style={{
                      display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                    }}>
                      <div style={{
                        maxWidth: '70%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isMine ? 'var(--color-blue)' : 'var(--color-bg)',
                        color: isMine ? '#fff' : 'var(--color-text-primary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                      }}>
                        {msg.text}
                        <div style={{
                          fontSize: '0.7rem', marginTop: 4,
                          color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)',
                          textAlign: 'right',
                        }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMine && msg.read && ' ✓✓'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{
              padding: '12px 20px', borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)', display: 'flex', gap: 8,
            }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
