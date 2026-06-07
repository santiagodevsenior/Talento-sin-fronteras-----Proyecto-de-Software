import React from 'react';

// ── Button ──────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl border-0 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] text-[#0c0b0f] hover:opacity-90 shadow-md',
    secondary: 'bg-[#1e1c24] text-[#f0ede8] border border-[#2e2c38] hover:border-[#c9a84c]',
    ghost: 'bg-transparent text-[#c9a84c] hover:bg-[#1e1c24]',
    danger: 'bg-[#e05252] text-white hover:opacity-90',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-base' };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }} /> : children}
    </button>
  );
};

// ── Input ───────────────────────────────────────────────────
export const Input = ({ label, error, icon, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>{label}</label>}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>}
      <input style={{ paddingLeft: icon ? 38 : 14, borderColor: error ? 'var(--danger)' : undefined }} {...props} />
    </div>
    {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
  </div>
);

// ── Textarea ────────────────────────────────────────────────
export const Textarea = ({ label, error, rows = 4, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</label>}
    <textarea rows={rows} style={{ resize: 'vertical', borderColor: error ? 'var(--danger)' : undefined }} {...props} />
    {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
  </div>
);

// ── Card ────────────────────────────────────────────────────
export const Card = ({ children, className = '', style = {} }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', ...style }} className={className}>
    {children}
  </div>
);

// ── Avatar ──────────────────────────────────────────────────
export const Avatar = ({ src, name, size = 40, className = '' }) => {
  const initials = name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  return src ? (
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} className={className} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--gold-dim)',
      color: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-display)',
    }} className={className}>{initials}</div>
  );
};

// ── Spinner ─────────────────────────────────────────────────
export const Spinner = ({ size = 36 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
    <div className="spinner" style={{ width: size, height: size }} />
  </div>
);

// ── Stars display ───────────────────────────────────────────
export const Stars = ({ value, max = 5, interactive = false, onChange }) => (
  <div className="stars">
    {Array.from({ length: max }).map((_, i) => (
      <span
        key={i}
        className={`star ${i < value ? 'filled' : ''}`}
        onClick={() => interactive && onChange && onChange(i + 1)}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >★</span>
    ))}
  </div>
);

// ── Category Badge ──────────────────────────────────────────
const CATEGORY_LABELS = {
  music: '🎵 Música', visual_arts: '🎨 Artes Visuales', theater: '🎭 Teatro',
  dance: '💃 Danza', photography: '📷 Fotografía', design: '✏️ Diseño',
  writing: '✍️ Escritura', modeling: '👗 Modelaje', other: '✨ Otro',
};

export const CategoryBadge = ({ category }) => (
  <span className="badge">{CATEGORY_LABELS[category] || category}</span>
);

// ── Empty state ─────────────────────────────────────────────
export const Empty = ({ icon = '🎨', title, description }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>{title}</h3>
    {description && <p style={{ fontSize: 14 }}>{description}</p>}
  </div>
);

// ── Modal ───────────────────────────────────────────────────
export const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer' }}>×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
