import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';
import api from '../../utils/api';

const S = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(12,11,15,0.85)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: 64,
  },
  logo: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--gold)', letterSpacing: '-0.3px', textDecoration: 'none' },
  links: { display: 'flex', gap: 8, alignItems: 'center' },
  link: { color: 'var(--text-muted)', padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, transition: 'all 0.2s' },
  activeLink: { color: 'var(--text)', background: 'var(--surface2)' },
  notifDot: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--gold)', borderRadius: '50%' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications/unread-count').then((r) => setUnread(r.data.count)).catch(() => {});
    const t = setInterval(() => {
      api.get('/notifications/unread-count').then((r) => setUnread(r.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, [user]);

  const isActive = (path) => location.pathname === path;
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={S.nav}>
      <Link to="/" style={S.logo}>Talento Sin Frontera</Link>

      <div style={S.links}>
        <Link to="/explore" style={{ ...S.link, ...(isActive('/explore') ? S.activeLink : {}) }}>Explorar</Link>
        {user && <Link to="/mentors" style={{ ...S.link, ...(isActive('/mentors') ? S.activeLink : {}) }}>Mentores</Link>}
        {user && (
          <Link to="/publish" style={{
            background: 'linear-gradient(to right, var(--gold), var(--gold-light))',
            color: '#0c0b0f', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
          }}>+ Publicar</Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
              <span style={{ fontSize: 20 }}>🔔</span>
              {unread > 0 && <span style={S.notifDot} />}
            </div>
            <div style={{ position: 'relative' }} onMouseLeave={() => setMenuOpen(false)}>
              <div style={{ cursor: 'pointer' }} onMouseEnter={() => setMenuOpen(true)}>
                <Avatar src={user.avatar} name={user.name} size={36} />
              </div>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, minWidth: 180, overflow: 'hidden', boxShadow: 'var(--shadow)',
                }}>
                  {[
                    { label: '👤 Mi Perfil', path: `/profile/${user.id}` },
                    { label: '📁 Mis Proyectos', path: `/profile/${user.id}` },
                    ...(user.isAvailableAsMentor ? [{ label: '🎓 Panel Mentor', path: '/mentor/dashboard' }] : []),
                    { label: '⚙️ Configuración', path: '/settings' },
                  ].map((item) => (
                    <Link key={item.path} to={item.path} style={{ display: 'block', padding: '10px 16px', fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--border)' }} onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', fontSize: 14, color: 'var(--danger)', textAlign: 'left', cursor: 'pointer' }}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" style={{ ...S.link, color: 'var(--text)' }}>Entrar</Link>
            <Link to="/register" style={{ background: 'linear-gradient(to right, var(--gold), var(--gold-light))', color: '#0c0b0f', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>Únete</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
