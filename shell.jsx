/* ===== Serenity Dashboard — shell (sidebar + topbar) ===== */

function Sidebar({ view, setView, audit, unlocked }) {
  const L = audit.leaks; // [dormant, fees, perf, per]
  const auditNav = [
    { id: 'synthese', label: 'Synthèse', icon: 'gauge' },
    { id: 'dormant', label: L[0].short, icon: L[0].icon, amount: L[0].amount },
    { id: 'fees', label: L[1].short, icon: L[1].icon, amount: L[1].amount },
    { id: 'perf', label: L[2].short, icon: L[2].icon, amount: L[2].amount },
    { id: 'per', label: L[3].short, icon: L[3].icon, amount: L[3].amount },
  ];
  const lockCls = unlocked ? '' : ' locked';
  return (
    <aside className="sb">
      <div className="sb-brand">
        <span className="sb-mark">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
            <path d="M11 46 C22 46 24 30 34 29 C45 28 49 19 53 12" stroke="#3FDBC2" strokeWidth="6.5" strokeLinecap="round" />
            <circle cx="53" cy="12" r="5.5" fill="#3FDBC2" />
          </svg>
        </span>
        <span className="sb-word">Serenity<i>.</i></span>
      </div>

      <div className="sb-group">Données</div>
      <div className={'nav' + (view === 'intro' || view === 'intake' ? ' on' : '')} onClick={() => setView('intake')}>
        <Icon name="pencil-line" /><span>Saisie</span>
      </div>

      <div className="sb-group">Diagnostic{!unlocked && <Icon name="lock" style={{ width: 11, marginLeft: 6, color: 'var(--fg-4)' }} />}</div>
      {auditNav.map(n => (
        <div key={n.id} className={'nav' + lockCls + (view === n.id ? ' on' : '')} onClick={() => setView(n.id)}>
          <Icon name={n.icon} /><span>{n.label}</span>
          {unlocked && typeof n.amount === 'number' && <span className="amt">−{fmt(n.amount)} €</span>}
        </div>
      ))}
      <div className={'nav' + lockCls + (view === 'projection' ? ' on' : '')} onClick={() => setView('projection')}>
        <Icon name="line-chart" /><span>Projection</span>
      </div>

      <div className="sb-group">Livrable</div>
      <div className={'nav' + lockCls + (view === 'bilan' ? ' on' : '')} onClick={() => setView('bilan')}>
        <Icon name="file-text" /><span>Bilan Serenity</span>
      </div>
      <div className={'nav' + (view === 'settings' ? ' on' : '')} onClick={() => setView('settings')}>
        <Icon name="sliders-horizontal" /><span>Paramètres</span>
      </div>

      <div className="sb-foot">
        <span className="av">AL</span>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-1)' }}>Axel Luçon</div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Conseiller patrimonial</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ setView, audit }) {
  const p = audit.prospect;
  return (
    <div className="topbar">
      <div className="tb-id">
        <span className="tb-name">{p.name}</span>
        <div className="tb-meta">
          <span className="chip">{p.situation === 'seul' ? 'Personne seule' : 'Foyer'}</span>
          <span className="chip">{eur(p.patrimoine)} de patrimoine</span>
        </div>
      </div>
      <div className="tb-right">
        <button className="btn btn-primary" onClick={() => setView('bilan')}>
          <Icon name="file-down" style={{ width: 16 }} />Télécharger mon bilan</button>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar });
