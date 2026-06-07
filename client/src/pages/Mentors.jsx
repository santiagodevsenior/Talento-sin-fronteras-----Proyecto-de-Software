import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Avatar, Button, Spinner, Empty, Modal, Textarea } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const DISCIPLINES = ['Música', 'Artes Visuales', 'Teatro', 'Danza', 'Fotografía', 'Diseño', 'Escritura', 'Modelaje'];

export default function Mentors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/mentors', {
        params: { search: search || undefined, discipline: discipline || undefined },
      });
      setMentors(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [discipline]);

  const handleSearch = (e) => { e.preventDefault(); load(); };

  const sendRequest = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post('/mentorships/request', {
        mentorId: selected.id,
        message,
        discipline: selected.skills?.[0] || '',
      });
      setSelected(null);
      setMessage('');
      alert('¡Solicitud enviada exitosamente!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar solicitud');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '88px 24px 60px' }}>
      <div className="fade-up">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900, marginBottom: 10 }}>
          Encuentra tu{' '}
          <span style={{ background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            mentor
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 17, marginBottom: 36 }}>
          Conecta con profesionales que guiarán tu crecimiento artístico
        </p>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: '1 1 280px' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Buscar por nombre..."
              style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 14px', color: 'var(--text)' }}
            />
            <button type="submit"
              style={{ background: 'var(--gold)', color: '#0c0b0f', border: 'none', borderRadius: 10, padding: '9px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
              Buscar
            </button>
          </form>
        </div>

        {/* Discipline pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {['', ...DISCIPLINES].map((d) => (
            <button key={d} onClick={() => setDiscipline(d)}
              style={{ padding: '7px 16px', borderRadius: 99, border: `1.5px solid ${discipline === d ? 'var(--gold)' : 'var(--border)'}`, background: discipline === d ? 'rgba(201,168,76,0.12)' : 'var(--surface)', color: discipline === d ? 'var(--gold)' : 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>
              {d || 'Todos'}
            </button>
          ))}
        </div>

        {/* Mentor grid */}
        {loading ? <Spinner /> : mentors.length === 0 ? (
          <Empty icon="🎓" title="No hay mentores disponibles" description="Prueba cambiando los filtros de búsqueda." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {mentors.map((m) => (
              <div key={m.id} className="card-hover"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <Avatar src={m.avatar} name={m.name} size={52} />
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>{m.name}</h3>
                    <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, textTransform: 'capitalize' }}>{m.role}</span>
                  </div>
                </div>

                {m.bio && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {m.bio}
                  </p>
                )}

                {m.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {m.skills.slice(0, 4).map((s) => (
                      <span key={s} style={{ padding: '3px 9px', borderRadius: 6, background: 'var(--surface2)', fontSize: 12, color: 'var(--text-muted)' }}>{s}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/profile/${m.id}`)} style={{ flex: 1 }}>
                    Ver perfil
                  </Button>
                  {user && user.id !== m.id && (
                    <Button size="sm" onClick={() => setSelected(m)} style={{ flex: 1 }}>
                      🎓 Solicitar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setMessage(''); }} title={`Solicitar mentoría — ${selected?.name}`}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
          Preséntate y explica en qué área buscas orientación. Sé específico sobre tus objetivos.
        </p>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hola, soy estudiante de música y me gustaría orientación en composición..."
          rows={5}
          label="Tu mensaje de solicitud"
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button variant="secondary" onClick={() => { setSelected(null); setMessage(''); }} style={{ flex: 1 }}>Cancelar</Button>
          <Button loading={sending} onClick={sendRequest} disabled={!message.trim()} style={{ flex: 2 }}>
            Enviar solicitud ✨
          </Button>
        </div>
      </Modal>
    </div>
  );
}
