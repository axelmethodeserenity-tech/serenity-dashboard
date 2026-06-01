/* ===== Serenity Dashboard — Paramètres (barèmes éditables, persistés) ===== */

function SettingsView({ settings, setSettings, resetSettings }) {
  const S = settings;
  const setS = (path, value) => setSettings(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    const keys = path.split('.'); let o = next;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = value;
    return next;
  });
  const setLivret = (id, field, val) => setSettings(prev => ({
    ...prev, livrets: prev.livrets.map(l => l.id === id ? { ...l, [field]: val } : l),
  }));
  const addLivret = () => setSettings(prev => ({ ...prev, livrets: [...prev.livrets, window.newLivret()] }));
  const delLivret = (id) => setSettings(prev => ({ ...prev, livrets: prev.livrets.filter(l => l.id !== id) }));

  return (
    <div className="content fade-in">
      <SectionHead eyebrow="Paramètres · barèmes de référence"
        title="Les taux qui pilotent vos calculs"
        sub="Modifiez ici les taux de marché et hypothèses. Tout est enregistré sur cet appareil et réutilisé pour chaque audit — pratique quand les livrets changent de taux." />

      <div className="settings-banner no-print">
        <Icon name="info" style={{ width: 18, color: 'var(--accent)' }} />
        <span>Enregistrement automatique. Dernière mise à jour des taux réglementés : <b>février 2026</b>.</span>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '8px 14px' }} onClick={resetSettings}>
          <Icon name="rotate-ccw" style={{ width: 15 }} />Réinitialiser</button>
      </div>

      {/* Livrets & produits */}
      <div className="card card-pad">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div className="eyebrow" style={{ color: 'var(--fg-3)' }}>Taux des livrets & supports d'épargne</div>
          <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '8px 14px' }} onClick={addLivret}>
            <Icon name="plus" style={{ width: 15 }} />Ajouter</button>
        </div>
        <div className="set-table">
          <div className="set-head"><span>Produit</span><span>Taux annuel</span><span>Plafond</span><span></span></div>
          {S.livrets.map(l => (
            <div className="set-row" key={l.id}>
              <input className="set-in" value={l.name} onChange={e => setLivret(l.id, 'name', e.target.value)} />
              <div className="set-num"><input type="number" step="0.05" value={l.taux} onChange={e => setLivret(l.id, 'taux', parseFloat(e.target.value) || 0)} /><span>%</span></div>
              <div className="set-num"><input type="number" value={l.plafond} onChange={e => setLivret(l.id, 'plafond', parseInt(e.target.value, 10) || 0)} /><span>€</span></div>
              <button className="row-del sm" onClick={() => delLivret(l.id)}><Icon name="trash-2" style={{ width: 15 }} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {/* Profils de rendement */}
        <div className="card card-pad">
          <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 16 }}>Profils de rendement (hypothèses)</div>
          <SetLine label="Profil équilibré" hint="épargne réinvestie" value={S.profils.equilibre} onChange={v => setS('profils.equilibre', v)} />
          <SetLine label="Profil dynamique" hint="long terme (PEA / actions)" value={S.profils.dynamique} onChange={v => setS('profils.dynamique', v)} />
          <SetLine label="Rendement actuel moyen" hint="trajectoire actuelle (projection)" value={S.profils.actuelMoyen} onChange={v => setS('profils.actuelMoyen', v)} />
          <SetLine label="Trajectoire optimisée" hint="projection optimisée globale" value={S.profils.optimiseMoyen} onChange={v => setS('profils.optimiseMoyen', v)} last />
        </div>

        {/* Assurance-vie cible */}
        <div className="card card-pad">
          <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 16 }}>Contrat d'assurance-vie optimal (cible)</div>
          <SetLine label="Frais de gestion (unités de compte)" value={S.av.fraisGestionUCCible} onChange={v => setS('av.fraisGestionUCCible', v)} />
          <SetLine label="Frais de gestion (fonds en euros)" value={S.av.fraisGestionFECible} onChange={v => setS('av.fraisGestionFECible', v)} />
          <SetLine label="Frais unités de compte" value={S.av.fraisUCCible} onChange={v => setS('av.fraisUCCible', v)} />
          <SetLine label="Frais sur versement" value={S.av.fraisVersementCible} onChange={v => setS('av.fraisVersementCible', v)} last />
          <div style={{ borderTop: '1px solid var(--line-1)', marginTop: 14, paddingTop: 14, fontSize: 13, color: 'var(--fg-3)' }}>
            Total frais cible (poche UC) : <b style={{ color: 'var(--accent)' }}>{r2(S.av.fraisGestionUCCible + S.av.fraisUCCible)} %</b></div>
        </div>

        {/* PER / fiscalité */}
        <div className="card card-pad">
          <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 16 }}>PER & fiscalité</div>
          <SetLine label="Plafond de déduction PER" hint="% des revenus" value={S.per.tauxPlafond} onChange={v => setS('per.tauxPlafond', v)} />
          <SetEuro label="Plafond PER maximal" value={S.per.plafondMax} onChange={v => setS('per.plafondMax', v)} />
          <SetLine label="PFU — part impôt sur le revenu" value={S.fiscal.pfuIR} onChange={v => setS('fiscal.pfuIR', v)} />
          <SetEuro label="Abattement AV > 8 ans (seul)" value={S.fiscal.abattementAVSeul} onChange={v => setS('fiscal.abattementAVSeul', v)} />
          <SetEuro label="Abattement AV > 8 ans (couple)" value={S.fiscal.abattementAVCouple} onChange={v => setS('fiscal.abattementAVCouple', v)} last />
        </div>

        {/* Précaution & manque à gagner */}
        <div className="card card-pad">
          <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 16 }}>Repères de précaution & synthèse</div>
          <SetLine label="Précaution minimale" hint="mois de dépenses (repère affiché)" value={S.precaution.moisMin} onChange={v => setS('precaution.moisMin', v)} suffix="mois" step={1} />
          <SetLine label="Précaution maximale" hint="mois de dépenses · défaut si non renseigné" value={S.precaution.moisMax} onChange={v => setS('precaution.moisMax', v)} suffix="mois" step={1} />
          <SetLine label="Horizon du manque à gagner cumulé" hint="affiché en synthèse (« sur N ans »)" value={S.over10ans} onChange={v => setS('over10ans', v)} suffix="ans" step={1} last />
        </div>
      </div>
    </div>
  );
}

function SetLine({ label, hint, value, onChange, suffix = '%', step = 0.05, last }) {
  return (
    <div className="set-line" style={last ? { borderBottom: 'none' } : {}}>
      <div><div className="set-lab">{label}</div>{hint && <div className="set-hint">{hint}</div>}</div>
      <div className="set-num"><input type="number" step={step} value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} /><span>{suffix}</span></div>
    </div>
  );
}
function SetEuro({ label, hint, value, onChange, last }) {
  return (
    <div className="set-line" style={last ? { borderBottom: 'none' } : {}}>
      <div><div className="set-lab">{label}</div>{hint && <div className="set-hint">{hint}</div>}</div>
      <div className="set-num wide"><input inputMode="numeric" value={fmt(value)} onChange={e => onChange(parseInt(e.target.value.replace(/[^\d]/g, ''), 10) || 0)} /><span>€</span></div>
    </div>
  );
}

Object.assign(window, { SettingsView });
