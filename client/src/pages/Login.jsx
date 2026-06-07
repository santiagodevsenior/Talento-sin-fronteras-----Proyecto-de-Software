import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', background: 'radial-gradient(ellipse at 20% 80%, #1a1108 0%, var(--bg) 50%)' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Bienvenido de vuelta
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Inicia sesión para continuar</p>
        </div>

        <Card>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid var(--danger)', borderRadius: 8, padding: '10px 14px', color: 'var(--danger)', fontSize: 14 }}>
                {error}
              </div>
            )}
            <Input label="Correo electrónico" name="email" type="email" value={form.email} onChange={handle} placeholder="tu@correo.com" required icon="✉️" />
            <Input label="Contraseña" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required icon="🔒" />
            <div style={{ textAlign: 'right', marginTop: -12 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--text-muted)' }}>¿Olvidaste tu contraseña?</Link>
            </div>
            <Button type="submit" loading={loading} size="lg" style={{ width: '100%', marginTop: 4 }}>
              Iniciar sesión
            </Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>Regístrate gratis</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
