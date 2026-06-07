import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import api from '../utils/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: user.email });
      setMsg('Te enviamos un correo para restablecer tu contraseña.');
    } catch {
      setMsg('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '88px 24px 60px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, marginBottom: 32 }}>
        Configuración
      </h1>

      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>
          Información de cuenta
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
          <strong>Nombre:</strong> {user?.name}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
          <strong>Email:</strong> {user?.email}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          <strong>Rol:</strong> {user?.role}
        </p>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>
          Cambiar contraseña
        </h2>
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Te enviaremos un enlace a <strong>{user?.email}</strong> para restablecer tu contraseña.
          </p>
          {msg && (
            <div style={{ background: 'rgba(76,175,122,0.1)', border: '1px solid #4caf7a', borderRadius: 8, padding: '10px 14px', color: '#4caf7a', fontSize: 14 }}>
              {msg}
            </div>
          )}
          <Button type="submit" loading={loading} variant="secondary">
            Enviar enlace de restablecimiento
          </Button>
        </form>
      </Card>

      <Card>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16, color: 'var(--danger)' }}>
          Cerrar sesión
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
          Cerrar sesión en este dispositivo.
        </p>
        <Button variant="danger" onClick={logout}>
          🚪 Cerrar sesión
        </Button>
      </Card>
    </div>
  );
}