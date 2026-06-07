import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';

const ROLES = [
  { value: 'student', label: '🎓 Estudiante', desc: 'Aprendo y busco orientación' },
  { value: 'professional', label: '⭐ Profesional', desc: 'Comparto mi expertise' },
  { value: 'creator', label: '🎨 Creador', desc: 'Publico mi trabajo artístico' },
];

const INTERESTS = ['Música', 'Artes Visuales', 'Teatro', 'Danza', 'Fotografía', 'Diseño', 'Escritura', 'Modelaje'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', interests: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleInterest = (i) => setForm({ ...form, interests: form.interests.includes(i) ? form.interests.filter((x) => x !== i) : [...form.interests, i] });

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error al registrar');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', background: 'radial-gradient(ellipse at 80% 20%, #1a1108 0%, var(--bg) 50%)' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 900, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Únete al talento
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Paso {step} de 2</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            {[1,2].map((s) => (
              <div key={s} style={{ height: 4, width: 60, borderRadius: 2, background: s <= step ? 'var(--gold)' : 'var(--border)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>

        <Card>
          {error && <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid var(--danger)', borderRadius: 8, padding: '10px 14px', color: 'var(--danger)', fontSize: 14, marginBottom: 20 }}>{error}</div>}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Input label="Nombre completo" name="name" value={form.name} onChange={handle} placeholder="Tu nombre artístico o real" required />
              <Input label="Correo electrónico" name="email" type="email" value={form.email} onChange={handle} placeholder="tu@correo.com" required />
              <Input label="Contraseña" name="password" type="password" value={form.password} onChange={handle} placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número" required />
              <Button size="lg" style={{ width: '100%' }} onClick={() => { if (!form.name || !form.email || !form.password) { setError('Completa todos los campos'); return; } setError(''); setStep(2); }}>
                Continuar →
              </Button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>¿Cuál es tu rol?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ROLES.map((r) => (
                    <div key={r.value} onClick={() => setForm({ ...form, role: r.value })}
                      style={{ border: `2px solid ${form.role === r.value ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 12, padding: '12px 16px', cursor: 'pointer', background: form.role === r.value ? 'rgba(201,168,76,0.08)' : 'transparent', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{r.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>¿Qué disciplinas te interesan?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {INTERESTS.map((i) => (
                    <button key={i} type="button" onClick={() => toggleInterest(i)}
                      style={{ padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${form.interests.includes(i) ? 'var(--gold)' : 'var(--border)'}`, background: form.interests.includes(i) ? 'rgba(201,168,76,0.12)' : 'transparent', color: form.interests.includes(i) ? 'var(--gold)' : 'var(--text-muted)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Atrás</Button>
                <Button loading={loading} onClick={submit} disabled={!form.role} style={{ flex: 2 }}>Crear cuenta 🎨</Button>
              </div>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Inicia sesión</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
