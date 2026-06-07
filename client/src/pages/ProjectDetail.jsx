import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Avatar, CategoryBadge, Stars, Button, Spinner, Textarea } from '../components/ui';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then((r) => setProject(r.data.data))
      .catch(() => navigate('/explore'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    await api.delete(`/projects/${id}`);
    navigate('/explore');
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return setCommentError('El comentario no puede estar vacío');
    if (rating === 0) return setCommentError('Selecciona una calificación');
    setSubmitting(true);
    setCommentError('');
    try {
      const { data } = await api.post(`/projects/${id}/comments`, { content: commentText, rating });
      setProject((p) => ({ ...p, comments: [data.data, ...p.comments] }));
      setCommentText('');
      setRating(0);
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Error al comentar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ paddingTop: 80 }}><Spinner /></div>;
  if (!project) return null;

  const { title, description, category, mediaUrl, mediaType, author, avgRating, ratingCount, viewCount, comments, createdAt, tags } = project;
  const isOwner = user?.id === author?.id;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '88px 24px 60px' }}>
      <div className="fade-up">
        {/* Media */}
        {mediaUrl && (
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 32, background: 'var(--surface)', aspectRatio: mediaType === 'video' ? '16/9' : undefined }}>
            {mediaType === 'video' ? (
              <video src={mediaUrl} controls style={{ width: '100%', borderRadius: 'var(--radius-lg)' }} />
            ) : mediaType === 'pdf' ? (
              <iframe src={mediaUrl} title={title} style={{ width: '100%', height: 500, border: 'none' }} />
            ) : (
              <img src={mediaUrl} alt={title} style={{ width: '100%', maxHeight: 520, objectFit: 'contain' }} />
            )}
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <CategoryBadge category={category} />
            {ratingCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--gold)' }}>★</span>
                {parseFloat(avgRating).toFixed(1)} ({ratingCount})
              </span>
            )}
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>👁 {viewCount}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>{title}</h1>

          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <Link to={`/profile/${author?.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <Avatar src={author?.avatar} name={author?.name} size={42} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{author?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es })}
                </div>
              </div>
            </Link>
            {isOwner && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${id}/edit`)}>✏️ Editar</Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>🗑️ Eliminar</Button>
              </div>
            )}
            {!isOwner && user && (
              <Button variant="secondary" size="sm" onClick={() => navigate(`/mentors?contact=${author?.id}`)}>
                💬 Contactar
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 28 }}>
          <p style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{description}</p>
          {tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {tags.map((t) => <span key={t} style={{ padding: '3px 10px', borderRadius: 99, background: 'var(--surface2)', color: 'var(--text-muted)', fontSize: 12 }}>#{t}</span>)}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', marginBottom: 28 }} />

        {/* Comments section */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 20 }}>
          Retroalimentación ({comments?.length || 0})
        </h2>

        {/* Add comment */}
        {user && !isOwner && (
          <form onSubmit={submitComment} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 28 }}>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Tu calificación</p>
              <Stars value={rating} interactive onChange={setRating} />
            </div>
            <Textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Comparte tu retroalimentación profesional..." rows={3} label="Comentario" />
            {commentError && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{commentError}</p>}
            <Button type="submit" loading={submitting} size="sm" style={{ marginTop: 12 }}>Publicar retroalimentación</Button>
          </form>
        )}
        {!user && (
          <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 28 }}>
            <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Inicia sesión</Link>{' '}para dejar tu retroalimentación
          </div>
        )}

        {/* Comment list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comments?.map((c) => (
            <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar src={c.author?.avatar} name={c.author?.name} size={34} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{c.author?.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <Stars value={c.rating} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
