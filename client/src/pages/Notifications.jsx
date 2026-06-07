import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Button, Spinner, Empty } from '../components/ui';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const TYPE_ICONS = {
  comment: '💬',
  mentorship_request: '🎓',
  mentorship_accepted: '✅',
  mentorship_rejected: '❌',
  message: '✉️',
  rating: '⭐',
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then((r) => setNotifs(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    await api.put('/notifications/read-all');
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await api.put(`/notifications/${n.id}/read`);
      setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
    }
    if (n.link) navigate(n.link);
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px 60px' }}>
      <div className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900 }}>Notificaciones</h1>
          {notifs.some((n) => !n.isRead) && (
            <Button variant="ghost" size="sm" onClick={markAll}>Marcar todas como leídas</Button>
          )}
        </div>

        {loading ? <Spinner /> : notifs.length === 0 ? (
          <Empty icon="🔔" title="Sin notificaciones" description="Aquí aparecerán tus comentarios, solicitudes y mensajes." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifs.map((n) => (
              <div key={n.id} onClick={() => handleClick(n)}
                style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 18px', borderRadius: 'var(--radius)', cursor: n.link ? 'pointer' : 'default', background: n.isRead ? 'transparent' : 'rgba(201,168,76,0.06)', border: `1px solid ${n.isRead ? 'transparent' : 'rgba(201,168,76,0.15)'}`, transition: 'background 0.2s', marginBottom: 4 }}
                onMouseEnter={(e) => { if (n.link) e.currentTarget.style.background = 'var(--surface)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(201,168,76,0.06)'; }}
              >
                <div style={{ fontSize: 22, flexShrink: 0, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', borderRadius: '50%' }}>
                  {TYPE_ICONS[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: n.isRead ? 400 : 600, color: 'var(--text)', lineHeight: 1.4 }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                  </div>
                </div>
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
