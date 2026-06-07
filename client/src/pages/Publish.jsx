import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Button, Input, Textarea, Card } from '../components/ui';

const CATEGORIES = ['music','visual_arts','theater','dance','photography','design','writing','modeling','other'];
const CATEGORY_LABELS = { music:'Música', visual_arts:'Artes Visuales', theater:'Teatro', dance:'Danza', photography:'Fotografía', design:'Diseño', writing:'Escritura', modeling:'Modelaje', other:'Otro' };

export default function Publish() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', tags: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) { setErrors({ file: 'El archivo debe ser menor a 50 MB' }); return; }
    setFile(f);
    if (f.type.startsWith('image')) setPreview(URL.createObjectURL(f));
    else if (f.type.startsWith('video')) setPreview('video');
    else if (f.type === 'application/pdf') setPreview('pdf');
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 3) e.title = 'El título debe tener al menos 3 caracteres';
    if (!form.description.trim() || form.description.length < 10) e.description = 'La descripción debe tener al menos 10 caracteres';
    if (!form.category) e.category = 'Selecciona una categoría';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('media', file);
      const { data } = await api.post('/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/projects/${data.data.id}`);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Error al publicar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px 60px' }}>
      <div className="fade-up">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, marginBottom: 8 }}>
          Publica tu proyecto
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>Comparte tu trabajo con la comunidad</p>

        <Card>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {errors.submit && <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid var(--danger)', borderRadius: 8, padding: '10px 14px', color: 'var(--danger)', fontSize: 14 }}>{errors.submit}</div>}

            <Input label="Título del proyecto *" name="title" value={form.title} onChange={handle} placeholder="Dale un nombre memorable..." error={errors.title} />

            <Textarea label="Descripción *" name="description" value={form.description} onChange={handle} placeholder="Describe tu proceso creativo, materiales, inspiración..." rows={5} error={errors.description} />

            {/* Category */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Categoría *</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                    style={{ padding: '7px 16px', borderRadius: 99, border: `1.5px solid ${form.category === c ? 'var(--gold)' : 'var(--border)'}`, background: form.category === c ? 'rgba(201,168,76,0.12)' : 'transparent', color: form.category === c ? 'var(--gold)' : 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
              {errors.category && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{errors.category}</p>}
            </div>

            <Input label="Etiquetas (separadas por coma)" name="tags" value={form.tags} onChange={handle} placeholder="acuarela, abstracto, 2024" />

            {/* File upload */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Archivo multimedia (opcional)</p>
              <label style={{ display: 'block', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFile({ target: { files: e.dataTransfer.files } }); }}>
                {preview ? (
                  preview === 'video' ? <div style={{ fontSize: 48 }}>🎬<p style={{ fontSize: 14, color: 'var(--gold)', marginTop: 8 }}>{file?.name}</p></div>
                  : preview === 'pdf' ? <div style={{ fontSize: 48 }}>📄<p style={{ fontSize: 14, color: 'var(--gold)', marginTop: 8 }}>{file?.name}</p></div>
                  : <img src={preview} alt="preview" style={{ maxHeight: 200, margin: '0 auto', borderRadius: 8 }} />
                ) : (
                  <>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📎</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Arrastra o haz clic para subir</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>JPG, PNG, MP4, PDF · Máx. 50 MB</p>
                  </>
                )}
                <input type="file" accept="image/*,video/mp4,application/pdf" onChange={handleFile} style={{ display: 'none' }} />
              </label>
              {errors.file && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{errors.file}</p>}
            </div>

            <Button type="submit" loading={loading} size="lg" style={{ width: '100%' }}>
              🚀 Publicar proyecto
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
