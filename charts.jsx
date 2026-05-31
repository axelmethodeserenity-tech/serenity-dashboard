/* ===== Serenity Dashboard — SVG charts ===== */

// Donut: segments = [{value, color, label}]
function Donut({ segments, size = 168, stroke = 20, children }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color}
              strokeWidth={stroke} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
              strokeLinecap="round" style={{ transition: 'stroke-dasharray .6s var(--ease-out)' }} />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', textAlign:'center' }}>
        {children}
      </div>
    </div>
  );
}

// Projection line chart: two series over years; B (optimized) diverges above A
function ProjectionChart({ width = 640, height = 230, current, optimized, labels }) {
  const pad = { l: 8, r: 8, t: 18, b: 26 };
  const w = width - pad.l - pad.r, h = height - pad.t - pad.b;
  const all = [...current, ...optimized];
  const max = Math.max(...all) * 1.05, min = Math.min(...all) * 0.96;
  const x = i => pad.l + (i / (current.length - 1)) * w;
  const y = v => pad.t + h - ((v - min) / (max - min)) * h;
  const path = arr => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = arr => `${path(arr)} L ${x(arr.length-1)} ${pad.t+h} L ${x(0)} ${pad.t+h} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display:'block' }}>
      <defs>
        <linearGradient id="gOpt" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(63,219,194,.28)" />
          <stop offset="100%" stopColor="rgba(63,219,194,0)" />
        </linearGradient>
      </defs>
      {[0,0.5,1].map((g,i)=>(
        <line key={i} x1={pad.l} x2={width-pad.r} y1={pad.t+h*g} y2={pad.t+h*g}
          stroke="rgba(255,255,255,.05)" />
      ))}
      <path d={area(optimized)} fill="url(#gOpt)" />
      <path d={path(current)} fill="none" stroke="#6E7884" strokeWidth="2.4" strokeDasharray="2 6" strokeLinecap="round" />
      <path d={path(optimized)} fill="none" stroke="#3FDBC2" strokeWidth="3" strokeLinecap="round"
        style={{ filter:'drop-shadow(0 4px 12px rgba(63,219,194,.4))' }} />
      <circle cx={x(optimized.length-1)} cy={y(optimized[optimized.length-1])} r="5" fill="#3FDBC2" />
      <circle cx={x(current.length-1)} cy={y(current[current.length-1])} r="4" fill="#6E7884" />
      {labels.map((l,i)=>(
        <text key={i} x={x(i*(current.length-1)/(labels.length-1))} y={height-7}
          fill="#6E7884" fontSize="11" fontFamily="var(--font-sans)" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

// Horizontal compare meter (e.g. fees current vs optimized)
function BarMeter({ value, max, color, track = 'var(--surface-3)', height = 8 }) {
  return (
    <div style={{ height, borderRadius:99, background:track, overflow:'hidden', width:'100%' }}>
      <div style={{ height:'100%', width:`${Math.min(100,(value/max)*100)}%`, background:color,
        borderRadius:99, transition:'width .6s var(--ease-out)' }} />
    </div>
  );
}

// Stacked allocation bar: parts = [{value,color}]
function StackBar({ parts, height = 12 }) {
  const total = parts.reduce((s,p)=>s+p.value,0);
  return (
    <div style={{ height, borderRadius:99, overflow:'hidden', display:'flex', width:'100%', gap:2 }}>
      {parts.map((p,i)=>(
        <div key={i} style={{ width:`${(p.value/total)*100}%`, background:p.color }} />
      ))}
    </div>
  );
}

Object.assign(window, { Donut, ProjectionChart, BarMeter, StackBar });

/* ===== Interactive projection — hover crosshair + tooltip ===== */
function InteractiveProjection({ base, rActuel, rOptimise, years, width = 760, height = 320 }) {
  const { useState, useRef } = React;
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const pad = { l: 64, r: 18, t: 24, b: 36 };
  const w = width - pad.l - pad.r, h = height - pad.t - pad.b;

  const cur = [], opt = [];
  for (let i = 0; i <= years; i++) {
    cur.push(Math.round(base * Math.pow(1 + rActuel / 100, i)));
    opt.push(Math.round(base * Math.pow(1 + rOptimise / 100, i)));
  }
  const max = Math.max(...opt) * 1.06, min = 0;
  const x = i => pad.l + (i / years) * w;
  const y = v => pad.t + h - ((v - min) / (max - min)) * h;
  const line = arr => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = arr => `${line(arr)} L ${x(years)} ${pad.t + h} L ${x(0)} ${pad.t + h} Z`;
  const areaBetween = `${line(opt)} ` + opt.map((_, i) => `L ${x(years - i).toFixed(1)} ${y(cur[years - i]).toFixed(1)}`).join(' ') + ' Z';

  const yTicks = 4;
  const fmtK = v => v >= 1000 ? Math.round(v / 1000) + ' k€' : Math.round(v) + ' €';
  const xLabels = []; const stepN = Math.max(1, Math.round(years / 6));
  for (let i = 0; i <= years; i += stepN) xLabels.push(i);
  if (xLabels[xLabels.length - 1] !== years) xLabels.push(years);
  const y0 = new Date().getFullYear();

  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (width / rect.width);
    let i = Math.round(((sx - pad.l) / w) * years);
    i = Math.max(0, Math.min(years, i));
    setHover(i);
  };

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', cursor: 'crosshair' }}
      onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id="gOptF" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(63,219,194,.20)" /><stop offset="100%" stopColor="rgba(63,219,194,0)" />
        </linearGradient>
      </defs>
      {Array.from({ length: yTicks + 1 }).map((_, k) => {
        const v = min + (max - min) * (k / yTicks); const yy = y(v);
        return (<g key={k}>
          <line x1={pad.l} x2={width - pad.r} y1={yy} y2={yy} stroke="rgba(255,255,255,.05)" />
          <text x={pad.l - 12} y={yy + 4} fill="#6E7884" fontSize="11" fontFamily="var(--font-sans)" textAnchor="end">{fmtK(v)}</text>
        </g>);
      })}
      <path d={areaBetween} fill="url(#gOptF)" opacity="0.7" />
      <path d={line(cur)} fill="none" stroke="#6E7884" strokeWidth="2.4" strokeDasharray="2 6" strokeLinecap="round" />
      <path d={line(opt)} fill="none" stroke="#3FDBC2" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0 4px 12px rgba(63,219,194,.4))' }} />
      <circle cx={x(years)} cy={y(opt[years])} r="5" fill="#3FDBC2" />
      <circle cx={x(years)} cy={y(cur[years])} r="4" fill="#6E7884" />
      {xLabels.map((i, k) => (
        <text key={k} x={x(i)} y={height - 10} fill="#6E7884" fontSize="11" fontFamily="var(--font-sans)" textAnchor="middle">{y0 + i}</text>
      ))}
      {hover !== null && (
        <g>
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + h} stroke="rgba(255,255,255,.22)" strokeWidth="1" />
          <circle cx={x(hover)} cy={y(opt[hover])} r="5.5" fill="#3FDBC2" stroke="#0C0E12" strokeWidth="2" />
          <circle cx={x(hover)} cy={y(cur[hover])} r="5" fill="#AAB4C0" stroke="#0C0E12" strokeWidth="2" />
          {(() => {
            const bw = 168, bh = 96; let bx = x(hover) + 14; if (bx + bw > width - pad.r) bx = x(hover) - bw - 14;
            const by = Math.max(pad.t, Math.min(y(opt[hover]) - bh / 2, pad.t + h - bh));
            const ecart = opt[hover] - cur[hover];
            return (<g>
              <rect x={bx} y={by} width={bw} height={bh} rx="11" fill="#181C23" stroke="rgba(255,255,255,.14)" />
              <text x={bx + 16} y={by + 24} fill="#6E7884" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600">{y0 + hover} · +{hover} ans</text>
              <circle cx={bx + 18} cy={by + 42} r="4" fill="#3FDBC2" />
              <text x={bx + 30} y={by + 46} fill="#F1F4F7" fontSize="13" fontFamily="var(--font-sans)" fontWeight="700">{fmtK(opt[hover])}</text>
              <circle cx={bx + 18} cy={by + 62} r="4" fill="#AAB4C0" />
              <text x={bx + 30} y={by + 66} fill="#AAB4C0" fontSize="13" fontFamily="var(--font-sans)" fontWeight="600">{fmtK(cur[hover])}</text>
              <text x={bx + 16} y={by + 86} fill="#5FE9D2" fontSize="12.5" fontFamily="var(--font-sans)" fontWeight="700">Écart : +{fmtK(ecart)}</text>
            </g>);
          })()}
        </g>
      )}
    </svg>
  );
}

Object.assign(window, { InteractiveProjection });
