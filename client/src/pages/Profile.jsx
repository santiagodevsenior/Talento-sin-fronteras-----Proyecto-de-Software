import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Avatar, Button, Spinner, Empty, Modal, Input, Textarea } from '../components/ui';
import ProjectCard from '../components/ProjectCard';

const ROLE_LABELS = { student: 'Estudiante', professional: 'Profesional', creator: 'Creador', admin: 'Admin' };

export default function Profile() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [mentorMsg, setMentorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const isOwn = user?.id === id;

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}/profile`),
      api.get(`/projects/user/${id}`),
    ]).then(([profileRes, projRes]) => {
      setProfile(profileRes.data.data);
      setProjects(projRes.data.data);
      setEditForm({
        name: profileRes.data.data.name,
        bio: profileRes.data.data.bio || '',
        isAvailableAsMentor: profileRes.data.data.isAvailableAsMentor,
      });
    }).catch(() => navigate('/explore'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
      const { data } = await api.put('/users/me', fd);
      setProfile((p) => ({ ...p, ...data.data }));
      updateUser(data.data);
      setEditOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const requestMentorship = async () => {
    if (!mentorMsg.trim()) return;
    try {
      await api.post('/mentorships/request', { mentorId: id, message: mentorMsg, discipline: profile.skills?.[0] || '' });
      setMentorOpen(false);
      alert('¡Solicitud enviada! El mentor responderá pronto.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar solicitud');
    }
  };

  if (loading) return <div style={{ paddingTop: 80 }}><Spinner /></div>;
  if (!profile) return null;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '88px 24px 60px' }}>
      <div className="fade-up">
        {/* Profile header */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(90deg, var(--gold-dim), #1a1108)', opacity: 0.6 }} />
          <div style={{ position: 'relative', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <Avatar src={profile.avatar} name={profile.name} size={90} />
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900 }}>{profile.name}</h1>
              <span style={{ background: 'var(--gold-dim)', color: 'var(--gold-light)', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                {ROLE_LABELS[profile.role]}
              </span>
              {profile.isAvailableAsMentor && (
                <span style={{ marginLeft: 8, background: 'rgba(76,175,122,0.15)', color: '#4caf7a', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                  🎓 Disponible como mentor
                </span>
              )}
              {profile.bio && <p style={{ color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>{profile.bio}</p>}
              {profile.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {profile.skills.map((s) => <span key={s} style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--surface2)', fontSize: 12, color: 'var(--text-muted)' }}>{s}</span>)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {isOwn ? (
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>✏️ Editar perfil</Button>
              ) : profile.isAvailableAsMentor && user ? (
                <Button size="sm" onClick={() => setMentorOpen(true)}>🎓 Solicitar mentoría</Button>
              ) : user ? (
                <Button variant="secondary" size="sm" onClick={() => navigate(`/chat/${id}`)}>💬 Chat</Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Projects */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 20 }}>
          Proyectos ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <Empty title="Sin proyectos aún" description={isOwn ? 'Publica tu primer proyecto y empieza a recibir retroalimentación.' : 'Este usuario no ha publicado proyectos.'} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar perfil">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input label="Nombre" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Textarea label="Bio" value={editForm.bio || ''} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Cuéntanos sobre ti y tu trabajo..." rows={3} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={!!editForm.isAvailableAsMentor} onChange={(e) => setEditForm({ ...editForm, isAvailableAsMentor: e.target.checked })} style={{ width: 'auto' }} />
            Disponible como mentor
          </label>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setEditOpen(false)} style={{ flex: 1 }}>Cancelar</Button>
            <Button loading={saving} onClick={saveProfile} style={{ flex: 2 }}>Guardar cambios</Button>
          </div>
        </div>
      </Modal>

      {/* Mentorship request modal */}
      <Modal open={mentorOpen} onClose={() => setMentorOpen(false)} title={`Solicitar mentoría a ${profile.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Escribe un mensaje de presentación para que el mentor pueda conocer tu situación y objetivos.</p>
          <Textarea value={mentorMsg} onChange={(e) => setMentorMsg(e.target.value)} placeholder="Hola, me gustaría recibir tu guía en... Mi nivel actual es..." rows={5} label="Tu mensaje" />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={() => setMentorOpen(false)} style={{ flex: 1 }}>Cancelar</Button>
            <Button onClick={requestMentorship} disabled={!mentorMsg.trim()} style={{ flex: 2 }}>Enviar solicitud 🎓</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
