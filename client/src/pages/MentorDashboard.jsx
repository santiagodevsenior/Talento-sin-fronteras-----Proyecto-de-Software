import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Avatar, Button, Spinner, Empty } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_STYLES = {
  pending:   { bg: 'rgba(201,168,76,0.12)',  color: 'var(--gold)',    label: '⏳ Pendiente' },
  accepted:  { bg: 'rgba(76,175,122,0.12)',  color: '#4caf7a',       label: '✅ Aceptada' },
  rejected:  { bg: 'rgba(224,82,82,0.12)',   color: 'var(--danger)', label: '❌ Rechazada' },
  completed: { bg: 'rgba(100,100,255,0.12)', color: '#8888ff',       label: '🏁 Completada' },
};

export default function MentorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [responding, setResponding] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    api.get('/mentorships/dashboard')
      .then((r) => setMentorships(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const respond = async (id, status) => {
    setResponding(id);
    try {
      const { data } = await api.put(`/mentorships/${id}/respond`, { status, mentorResponse: response });
      setMentorships((prev) => prev.map((m) => m.id === id ? { ...m, ...data.data } : m));
      setResponse('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al responder');
    } finally {
      setResponding(null);
    }
  };

  const filtered = mentorships.filter((m) => filter === 'all' || m.status === filter);
  const counts = mentorships.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {});

  if (!user?.isAvailableAsMentor) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '88px 24px 60px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎓</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12 }}>Panel de Mentor</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Activa tu disponibilidad como mentor en tu perfil para empezar a recibir solicitudes.
        </p>
        <Button onClick={() => navigate(`/profile/${user.id}`)}>Ir a mi perfil</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '88px 24px 60px' }}>
      <div className="fade-up">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, marginBottom: 6 }}>
          Panel de Mentor
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
          Gestiona tus solicitudes y mentorías activas
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Pendientes', count: counts.pending || 0, color: 'var(--gold)' },
            { label: 'Activas', count: counts.accepted || 0, color: '#4caf7a' },
            { label: 'Rechazadas', count: counts.rejected || 0, color: 'var(--danger)' },
            { label: 'Total', count: mentorships.length, color: 'var(--accent)' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: 'var(--font-display)' }}>{s.count}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
          {['all', 'pending', 'accepted', 'rejected'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: filter === f ? 'var(--gold)' : 'transparent', color: filter === f ? '#0c0b0f' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>
              {{ all: 'Todas', pending: 'Pendientes', accepted: 'Aceptadas', rejected: 'Rechazadas' }[f]}
            </button>
          ))}
        </div>

        {/* Mentorship cards */}
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Empty icon="📬" title="No hay solicitudes" description="Cuando estudiantes te contacten, aparecerán aquí." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((m) => {
              const st = STATUS_STYLES[m.status];
              return (
                <div key={m.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <Avatar src={m.student?.avatar} name={m.student?.name} size={48} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{m.student?.name}</span>
                        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        {m.discipline && (
                          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                            {m.discipline}
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px' }}>
                        {m.message}
                      </p>
                      {m.mentorResponse && (
                        <p style={{ fontSize: 13, color: '#4caf7a', marginTop: 8 }}>
                          Tu respuesta: {m.mentorResponse}
                        </p>
                      )}
                    </div>
                  </div>

                  {m.status === 'pending' && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Mensaje de respuesta opcional..."
                        rows={2}
                        style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', resize: 'none', marginBottom: 10, fontFamily: 'var(--font-body)', fontSize: 14 }}
                      />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Button size="sm" onClick={() => respond(m.id, 'accepted')} loading={responding === m.id} style={{ flex: 1 }}>
                          ✅ Aceptar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => respond(m.id, 'rejected')} loading={responding === m.id} style={{ flex: 1 }}>
                          ❌ Rechazar
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/chat/${m.student?.id}`)} style={{ flex: 1 }}>
                          💬 Chat
                        </Button>
                      </div>
                    </div>
                  )}

                  {m.status === 'accepted' && (
                    <div style={{ marginTop: 12 }}>
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/chat/${m.student?.id}`)}>
                        💬 Abrir chat
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
