import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import { Spinner, Empty } from '../components/ui';

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'music', label: '🎵 Música' },
  { value: 'visual_arts', label: '🎨 Artes Visuales' },
  { value: 'theater', label: '🎭 Teatro' },
  { value: 'dance', label: '💃 Danza' },
  { value: 'photography', label: '📷 Fotografía' },
  { value: 'design', label: '✏️ Diseño' },
  { value: 'writing', label: '✍️ Escritura' },
  { value: 'modeling', label: '👗 Modelaje' },
];

export default function Explore() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const load = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const p = reset ? 1 : page;
      const { data } = await api.get('/projects', { params: { page: p, limit: 20, category, sort, search: search || undefined } });
      setProjects((prev) => reset ? data.data : [...prev, ...data.data]);
      setMeta(data.meta);
      if (reset) setPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, category, sort, search]);

  useEffect(() => { load(true); }, [category, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(true);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 24px 60px' }}>
      {/* Hero header */}
      <div className="fade-up" style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}>
          Descubre el{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            talento
          </span>{' '}
          sin límites
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 18 }}>
          Proyectos artísticos de creadores de toda Latinoamérica
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28, alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: '1 1 300px' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Buscar proyectos..."
            style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 14px', color: 'var(--text)' }}
          />
          <button type="submit" style={{ background: 'var(--gold)', color: '#0c0b0f', border: 'none', borderRadius: 10, padding: '9px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Buscar
          </button>
        </form>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px', color: 'var(--text)', width: 'auto' }}>
          <option value="recent">Más recientes</option>
          <option value="top">Mejor valorados</option>
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            style={{ padding: '7px 16px', borderRadius: 99, border: `1.5px solid ${category === c.value ? 'var(--gold)' : 'var(--border)'}`, background: category === c.value ? 'rgba(201,168,76,0.12)' : 'var(--surface)', color: category === c.value ? 'var(--gold)' : 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading && projects.length === 0 ? (
        <Spinner />
      ) : projects.length === 0 ? (
        <Empty title="No hay proyectos aún" description="Sé el primero en compartir tu talento." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
          {meta && page < meta.pages && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button onClick={() => { setPage(page + 1); load(); }} disabled={loading}
                style={{ padding: '12px 32px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {loading ? '...' : 'Cargar más proyectos'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
