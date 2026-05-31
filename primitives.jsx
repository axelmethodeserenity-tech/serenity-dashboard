/* ===== Serenity Dashboard — primitives ===== */

// Crash-safe Lucide icon: span owns opaque innerHTML so React never reconciles the swapped <svg>
function Icon({ name, className, style }) {
  return (
    <span className={'lic ' + (className || '')} style={style}
      dangerouslySetInnerHTML={{ __html: `<i data-lucide="${name}"></i>` }} />
  );
}

function Badge({ kind = 'gain', children }) {
  const dot = { gain: 'var(--accent)', leak: 'var(--leak)', danger: 'var(--danger)' }[kind];
  return (
    <span className={'badge b-' + kind}>
      <span className="b-dot" style={{ background: dot }} />{children}
    </span>
  );
}

function SectionHead({ eyebrow, title, sub, right }) {
  return (
    <div>
      {eyebrow && <span className="eyebrow" style={{ display: 'block', marginBottom: 11 }}>{eyebrow}</span>}
      <h2 className="sec-title" style={{ marginBottom: sub ? 12 : 0 }}>{title}</h2>
      {sub && <p className="sec-sub">{sub}</p>}
      {right}
    </div>
  );
}

// Clickable leak module card (used on synthesis)
function LeakModule({ leak, onOpen }) {
  return (
    <div className="card card-pad leak" onClick={onOpen}>
      <div className="leak-top">
        <span className="leak-ic" style={{ background: leak.soft, border: `1px solid ${leak.stroke}55` }}>
          <Icon name={leak.icon} style={{ color: leak.stroke }} />
        </span>
        <Icon name="chevron-right" style={{ color: 'var(--fg-4)', width: 16 }} />
      </div>
      <div className="leak-name">{leak.name}</div>
      <div className="dsub" style={{ marginBottom: 14, fontSize: 12, color: 'var(--fg-3)' }}>{leak.sub}</div>
      <div className="leak-fig" style={{ color: leak.color }}>−{eur(leak.amount)}</div>
      <div className="leak-unit">de manque à gagner / an</div>
      <div className="leak-bar"><i style={{ width: leak.pct + '%', background: leak.color }} /></div>
      <span className="leak-go">Voir le détail <Icon name="arrow-right" style={{ width: 14 }} /></span>
    </div>
  );
}

// Generic data row
function DataRow({ label, sub, value, valueColor, badge }) {
  return (
    <div className="drow">
      <div>
        <div className="dlab">{label}</div>
        {sub && <div className="dsub">{sub}</div>}
      </div>
      {badge}
      <div className="dval" style={{ color: valueColor || 'var(--fg-1)' }}>{value}</div>
    </div>
  );
}

// KPI tile
function StatTile({ icon, iconColor, iconBg, label, value, valueColor, foot }) {
  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="eyebrow" style={{ color: 'var(--fg-3)' }}>{label}</span>
        <span style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center',
          background: iconBg, border: `1px solid ${iconColor}44` }}>
          <Icon name={icon} style={{ color: iconColor, width: 17 }} />
        </span>
      </div>
      <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 34,
        letterSpacing: '-.02em', color: valueColor || 'var(--fg-1)', lineHeight: 1 }}>{value}</div>
      {foot && <div style={{ marginTop: 12 }}>{foot}</div>}
    </div>
  );
}

Object.assign(window, { Icon, Badge, SectionHead, LeakModule, DataRow, StatTile });
