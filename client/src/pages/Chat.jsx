import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import { Avatar, Spinner } from '../components/ui';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Chat() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers, sendMessage: socketSend } = useSocket();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/users/${userId}/profile`),
      api.get(`/messages/${userId}`),
    ]).then(([profileRes, msgRes]) => {
      setPartner(profileRes.data.data);
      setMessages(msgRes.data.data);
    }).catch(() => navigate('/explore'))
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.senderId === userId || msg.receiverId === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    const typingHandler = ({ userId: uid, isTyping: it }) => {
      if (uid === userId) setIsTyping(it);
    };
    socket.on('receive_message', handler);
    socket.on('message_sent', handler);
    socket.on('user_typing', typingHandler);
    return () => {
      socket.off('receive_message', handler);
      socket.off('message_sent', handler);
      socket.off('user_typing', typingHandler);
    };
  }, [socket, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketSend(userId, text.trim());
    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket?.emit('typing', { receiverId: userId, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit('typing', { receiverId: userId, isTyping: false });
    }, 1500);
  };

  const isOnline = onlineUsers.includes(userId);

  if (loading) return <div style={{ paddingTop: 80 }}><Spinner /></div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 64, background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>←</button>
        <div style={{ position: 'relative' }}>
          <Avatar src={partner?.avatar} name={partner?.name} size={40} />
          {isOnline && (
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, background: '#4caf7a', borderRadius: '50%', border: '2px solid var(--surface)' }} />
          )}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{partner?.name}</div>
          <div style={{ fontSize: 12, color: isOnline ? '#4caf7a' : 'var(--text-muted)' }}>
            {isTyping ? '✍️ escribiendo...' : isOnline ? 'En línea' : 'Desconectado'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60, fontSize: 14 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            Inicia la conversación con {partner?.name}
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMine = msg.senderId === user?.id;
          const showTime = idx === 0 || new Date(msg.createdAt) - new Date(messages[idx - 1]?.createdAt) > 5 * 60000;
          return (
            <div key={msg.id || idx}>
              {showTime && (
                <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', margin: '8px 0' }}>
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: es })}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                {!isMine && <Avatar src={partner?.avatar} name={partner?.name} size={28} />}
                <div style={{
                  maxWidth: '68%', padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMine ? 'linear-gradient(135deg, var(--gold), var(--gold-light))' : 'var(--surface)',
                  color: isMine ? '#0c0b0f' : 'var(--text)',
                  border: isMine ? 'none' : '1px solid var(--border)',
                  fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={{ padding: '14px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0 }}>
        <input
          value={text}
          onChange={handleTyping}
          placeholder="Escribe un mensaje..."
          style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 24, padding: '10px 18px', color: 'var(--text)', fontSize: 14 }}
        />
        <button type="submit" disabled={!text.trim()}
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: text.trim() ? 1 : 0.4, transition: 'opacity 0.2s' }}>
          ↑
        </button>
      </form>
    </div>
  );
}
