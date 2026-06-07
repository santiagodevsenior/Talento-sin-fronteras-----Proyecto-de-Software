import { Link } from 'react-router-dom';
import { Avatar, CategoryBadge, Stars } from './ui';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProjectCard({ project }) {
  const { id, title, description, category, thumbnail, mediaUrl, mediaType, author, avgRating, ratingCount, viewCount, createdAt } = project;
  const media = thumbnail || mediaUrl;

  return (
    <Link to={`/projects/${id}`} style={{ textDecoration: 'none' }}>
      <article className="card-hover" style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer',
      }}>
        {/* Media */}
        <div style={{ position: 'relative', aspectRatio: '16/10', background: 'var(--surface2)', overflow: 'hidden' }}>
          {media ? (
            <img src={media} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
              {category === 'music' ? '🎵' : category === 'visual_arts' ? '🎨' : category === 'theater' ? '🎭' : '✨'}
            </div>
          )}
          {mediaType === 'video' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>▶</div>
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, left: 12 }}><CategoryBadge category={category} /></div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 18px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text)', lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {title}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {description}
          </p>

          {/* Author + stats */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar src={author?.avatar} name={author?.name} size={28} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{author?.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {ratingCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--gold)', fontSize: 13 }}>★</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{parseFloat(avgRating).toFixed(1)}</span>
                </div>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es })}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
