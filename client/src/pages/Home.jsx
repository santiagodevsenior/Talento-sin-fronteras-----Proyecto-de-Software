import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🎨', title: 'Publica tus proyectos', desc: 'Comparte obras de arte, música, fotografía, diseño y más con toda la comunidad latinoamericana.' },
  { icon: '⭐', title: 'Recibe retroalimentación', desc: 'Obtén comentarios y calificaciones de profesionales verificados para mejorar tu trabajo.' },
  { icon: '🎓', title: 'Conecta con mentores', desc: 'Solicita mentoría personalizada de artistas y profesionales con experiencia en tu disciplina.' },
  { icon: '💬', title: 'Chat en tiempo real', desc: 'Comunícate directamente con mentores y colaboradores a través de mensajería instantánea.' },
];

const DISCIPLINES = [
  { emoji: '🎵', label: 'Música' }, { emoji: '🎨', label: 'Artes Visuales' },
  { emoji: '🎭', label: 'Teatro' }, { emoji: '💃', label: 'Danza' },
  { emoji: '📷', label: 'Fotografía' }, { emoji: '✏️', label: 'Diseño' },
  { emoji: '✍️', label: 'Escritura' }, { emoji: '👗', label: 'Modelaje' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ paddingTop: 64 }}>
      {/* Hero */}
      <section style={{
        minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(168,85,247,0.08) 0%, transparent 60%)',
      }}>
        <div className="fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 99, padding: '6px 16px', fontSize: 13, color: 'var(--gold)', marginBottom: 28 }}>
            ✨ La plataforma del talento latinoamericano
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 7vw, 84px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, maxWidth: 900 }}>
            Tu talento merece{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 50%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ser visto
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Publica tus proyectos artísticos, recibe retroalimentación profesional y conecta con mentores que potenciarán tu crecimiento.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Link to="/explore" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', color: '#0c0b0f', padding: '14px 32px', borderRadius: 14, fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
                  Explorar proyectos →
                </Link>
                <Link to="/publish" style={{ border: '1.5px solid var(--border)', color: 'var(--text)', padding: '14px 32px', borderRadius: 14, fontWeight: 600, fontSize: 16, textDecoration: 'none', background: 'var(--surface)' }}>
                  + Publicar
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', color: '#0c0b0f', padding: '14px 32px', borderRadius: 14, fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
                  Empieza gratis →
                </Link>
                <Link to="/explore" style={{ border: '1.5px solid var(--border)', color: 'var(--text)', padding: '14px 32px', borderRadius: 14, fontWeight: 600, fontSize: 16, textDecoration: 'none', background: 'var(--surface)' }}>
                  Ver proyectos
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Floating discipline bubbles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 64, maxWidth: 560 }}>
          {DISCIPLINES.map((d) => (
            <Link key={d.label} to={`/explore?category=${d.label.toLowerCase().replace(' ', '_')}`}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
              {d.emoji} {d.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, textAlign: 'center', marginBottom: 56 }}>
          Todo lo que necesitas para{' '}
          <span style={{ color: 'var(--gold)' }}>crecer</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold-dim)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, marginBottom: 16 }}>
            ¿Listo para brillar?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 18, marginBottom: 36 }}>
            Únete a la comunidad de talentos latinoamericanos. Es gratis.
          </p>
          <Link to="/register"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', color: '#0c0b0f', padding: '16px 40px', borderRadius: 14, fontWeight: 800, fontSize: 18, textDecoration: 'none', display: 'inline-block' }}>
            Crear cuenta gratis 🎨
          </Link>
        </section>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--gold)', marginBottom: 8 }}>Talento Sin Frontera</p>
        <p>© 2026 Corporación Universitaria Iberoamericana · Proyecto de Software</p>
      </footer>
    </div>
  );
}
