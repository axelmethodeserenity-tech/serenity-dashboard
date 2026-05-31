/* ===== Serenity Dashboard — onglet Projection (interactif) ===== */
const { useState: useStateProj } = React;

function ProjectionView({ setView, audit, horizon, setHorizon }) {
  const S = audit.settings;
  const horizons = S.projHorizons;

  const base = audit.patrimoineInvesti;
  const rActuel = audit.perfActuelle;
  const rOpt = audit.profilRate;
  const profilNom = { prudent: 'Prudent', equilibre: 'Équilibré', dynamique: 'Dynamique', offensif: 'Offensif' }[audit.profilInvest] || 'Équilibré';

  const fv = (r, n) => base * Math.pow(1 + r / 100, n);
  const finalOpt = Math.round(fv(rOpt, horizon));
  const finalCur = Math.round(fv(rActuel, horizon));
  const ecart = finalOpt - finalCur;

  return (
    <div className="content fade-in">
      <SectionHead eyebrow="Projection · patrimoine investi"
        title="Ce que votre capital investi peut devenir."
        sub={`Projection sur votre patrimoine investi (${eur(base)}, hors épargne de précaution), selon le profil ${profilNom.toLowerCase()} choisi dans la saisie (~${rOpt.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %/an), comparé à votre performance actuelle estimée (~${rActuel.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %/an). Survolez la courbe pour lire l'écart année par année.`} />

      {/* contrôles : profil du foyer (lecture) + horizon */}
      <div className="card card-pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Profil du foyer (saisie)</div>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 12, background: 'var(--accent-soft)',
            border: '1px solid var(--accent-line)', borderRadius: 12, padding: '12px 18px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-1)' }}>{profilNom}</span>
            <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em', color: 'var(--accent)', whiteSpace: 'nowrap' }}>{rOpt.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %</span>
          </div>
          <button className="proj-edit" onClick={() => setView('intake')}>
            <Icon name="pencil-line" style={{ width: 13 }} />Modifier dans la saisie</button>
        </div>
        <div style={{ flex: '1 1 auto' }}>
          <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 12 }}>Horizon</div>
          <div className="seg seg-wrap">
            {horizons.map(hz => (
              <button key={hz} className={horizon === hz ? 'on' : ''} onClick={() => setHorizon(hz)}>{hz} ans</button>
            ))}
          </div>
        </div>
      </div>

      {/* graphe */}
      <div className="card card-pad">
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="eyebrow">Sur {horizon} ans</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, margin: '8px 0 0', color: 'var(--fg-1)' }}>
              Deux trajectoires, un écart qui se creuse</h3>
          </div>
          <div style={{ marginLeft: 'auto' }}><Badge kind="gain">+{eur(ecart)} d'écart en {new Date().getFullYear() + horizon}</Badge></div>
        </div>
        <InteractiveProjection base={base} rActuel={rActuel} rOptimise={rOpt} years={horizon} />
        <div style={{ display: 'flex', gap: 22, marginTop: 12, flexWrap: 'wrap' }}>
          <Legend color="#3FDBC2" label={`Optimisée · ${rOpt.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %/an`} val={eur(finalOpt)} />
          <Legend color="#6E7884" label={`Actuelle · ${rActuel.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %/an`} val={eur(finalCur)} dashed />
        </div>
      </div>

      {/* résumé chiffré */}
      <div className="grid-3">
        <StatTile icon="wallet" iconColor="#5AA2F5" iconBg="var(--azure-soft)" label="Capital investi aujourd'hui"
          value={eur(base)} foot={<span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>hors épargne de précaution</span>} />
        <StatTile icon="trending-up" iconColor="#3FDBC2" iconBg="var(--gain-soft)" label={`Trajectoire optimisée`}
          value={eur(finalOpt)} valueColor="var(--accent)" foot={<span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>profil {profilNom.toLowerCase()} · {horizon} ans</span>} />
        <StatTile icon="sparkles" iconColor="#3FDBC2" iconBg="var(--gain-soft)" label="Écart cumulé"
          value={'+' + eur(ecart)} valueColor="var(--accent)" foot={<span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>vs trajectoire actuelle</span>} />
      </div>

      <div className="card card-pad cta-band">
        <div>
          <span className="eyebrow">Votre livrable</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, margin: '8px 0 4px', color: 'var(--fg-1)' }}>Repartez avec votre diagnostic complet</h3>
          <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: 0 }}>Fuites chiffrées, leviers, et cette projection — dans un document clair.</p>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setView('bilan')}>
          <Icon name="file-down" style={{ width: 16 }} />Télécharger mon bilan</button>
      </div>
    </div>
  );
}

Object.assign(window, { ProjectionView });
