/* ===== Serenity Dashboard — views (4 fuites, pilotées par l'audit) ===== */

function Legend({ color, label, val, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ width: 22, height: 0, borderTop: `3px ${dashed ? 'dashed' : 'solid'} ${color}` }} />
      <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
    </div>
  );
}
function BackLink({ setView }) {
  return (
    <button className="btn btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setView('synthese')}>
      <Icon name="arrow-left" style={{ width: 16 }} />Synthèse
    </button>
  );
}

/* ---------------- SYNTHÈSE ---------------- */
function SynthesisView({ setView, audit }) {
  const A = audit;
  return (
    <div className="content fade-in">
      <SectionHead eyebrow="Diagnostic patrimonial · synthèse"
        title="Voici où votre argent travaille à perte."
        sub="Quatre fuites pèsent sur votre patrimoine. Chiffrées une à une, à partir de vos données." />

      <div className="card hero">
        <div className="hero-l">
          <span className="eyebrow" style={{ color: 'var(--leak)' }}>Votre manque à gagner total</span>
          <div className="hero-fig" style={{ color: 'var(--leak)' }}>−{fmt(A.totals.leakPerYear)}<small>€/an</small></div>
          <div className="hero-note">
            Soit <b style={{ color: 'var(--fg-1)' }}>{eur(A.totals.over10)}</b> sur 10 ans — qui ne financent aucun de vos projets.</div>
        </div>
        <div className="hero-r">
          <Donut size={150} stroke={18} segments={A.leaks.map(l => ({ value: Math.max(1, l.amount), color: l.stroke }))}>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 600 }}>par an</div>
              <div style={{ fontWeight: 700, fontSize: 22, fontVariantNumeric: 'tabular-nums', color: 'var(--fg-1)', letterSpacing: '-.02em' }}>{fmt(A.totals.leakPerYear)} €</div>
            </div>
          </Donut>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {A.leaks.map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: l.stroke, flex: 'none' }} />
                <span style={{ fontSize: 12.5, color: 'var(--fg-2)', fontWeight: 600 }}>{l.short}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 700, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{fmt(l.amount)} €</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-4">
        {A.leaks.map(l => <LeakModule key={l.id} leak={l} onOpen={() => setView(l.id)} />)}
      </div>

      <div className="card card-pad cta-band">
        <div>
          <span className="eyebrow">Étape suivante</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, margin: '8px 0 4px', color: 'var(--fg-1)' }}>Projetez le potentiel de votre capital</h3>
          <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: 0 }}>Visualisez l'écart entre votre trajectoire actuelle et une allocation optimisée.</p>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setView('projection')}>
          <Icon name="line-chart" style={{ width: 16 }} />Voir la projection</button>
      </div>
    </div>
  );
}

/* ---------------- 1 · ÉPARGNE DORMANTE ---------------- */
function DormantView({ setView, audit }) {
  const d = audit.dormant;
  const r1 = (x) => x.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  const profilNom = { prudent: 'prudent', equilibre: 'équilibré', dynamique: 'dynamique', offensif: 'offensif' }[audit.profilInvest] || 'équilibré';
  return (
    <div className="content fade-in">
      <BackLink setView={setView} />
      <SectionHead eyebrow="Fuite 01 · coût d'opportunité"
        title="Votre épargne dort sur des livrets."
        sub={`Une épargne de précaution de 3 à 6 mois de dépenses suffit. Au-delà, le surplus immobilisé — et l'épargne récurrente que vous versez sur des livrets plutôt que d'investir — ne croît pas au rythme d'un profil ${profilNom} (${r1(d.targetRate)} %/an).`} />
      <div className="grid-2">
        <div className="card card-pad">
          <div className="eyebrow" style={{ color: 'var(--fg-3)' }}>Vos liquidités vs l'épargne de précaution</div>
          <div style={{ margin: '18px 0 6px' }}>
            <StackBar height={14} parts={[{ value: Math.max(1, d.precaution), color: 'var(--accent)' }, { value: Math.max(0, d.surplus), color: 'var(--leak)' }]} />
          </div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 8, flexWrap: 'wrap' }}>
            <Legend color="#3FDBC2" label="Précaution (6 mois)" val={eur(d.precaution)} />
            <Legend color="#E8A24D" label="Surplus à investir" val={eur(d.surplus)} />
          </div>
          <div style={{ marginTop: 8 }}>
            {d.accounts.map((a, i) => (
              <DataRow key={i} label={a.type} sub={audit.couple ? a.ownerName : a.sub} value={eur(a.montant)}
                badge={<span className="chip" style={{ marginRight: 6 }}>{a.taux}%</span>} />
            ))}
            <DataRow label="Épargne de précaution conseillée" sub={`${eur(d.precautionMin)} à ${eur(d.precaution)} (3–6 mois)`} value={eur(d.precaution)} valueColor="var(--accent)" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <StatTile icon="trending-down" iconColor="#E8A24D" iconBg="var(--leak-soft)" label="Manque à gagner" value={'−' + eur(d.leak)} valueColor="var(--leak)"
            foot={<span style={{ fontSize: 13, color: 'var(--fg-2)' }}>chaque année</span>} />
          <div className="card card-pad">
            <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 16 }}>D'où vient ce manque à gagner</div>
            <DataRow label="Surplus dormant" sub={`${eur(d.surplus)} × (${r1(d.targetRate)} % − ${r1(d.blendedRate)} %)`} value={'+' + eur(d.manqueSurplus)} valueColor="var(--accent)" />
            <DataRow label="Épargne récurrente non investie" sub={`${eur(d.epargneRecurrenteAnnuelle)} / an vers les livrets × (${r1(d.targetRate)} % − ${r1(d.blendedRate)} %)`} value={'+' + eur(d.manqueCapacite)} valueColor="var(--accent)" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 2 · FRAIS ASSURANCE-VIE ---------------- */
function AvView({ setView, audit }) {
  const av = audit.av;
  const { useState } = React;
  const [open, setOpen] = useState({});
  const toggle = (id) => setOpen(o => ({ ...o, [id]: !o[id] }));
  return (
    <div className="content fade-in">
      <BackLink setView={setView} />
      <SectionHead eyebrow="Fuite 02 · couche de frais"
        title="Vos contrats sont grignotés par les frais."
        sub={`Un contrat optimal limite les frais à ~${r2(av.feesTarget)} %/an avec des fonds indiciels. Au-delà, chaque ligne ampute votre rendement net, année après année.`} />
      <div className="grid-2">
        <div className="card card-pad">
          <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 18 }}>Vos contrats</div>
          {av.contrats.map((c, i) => {
            const isOpen = !!open[c.id];
            const layers = [
              { label: 'Frais de gestion du contrat', cur: c.fraisGestion || 0, opt: audit.settings.av.fraisGestionCible },
              { label: 'Frais des unités de compte', cur: c.fraisUC || 0, opt: audit.settings.av.fraisUCCible },
              { label: 'Frais sur versement', cur: c.fraisVersement || 0, opt: audit.settings.av.fraisVersementCible },
            ];
            return (
              <div key={i} style={{ padding: '13px 0', borderBottom: i < av.contrats.length - 1 ? '1px solid var(--line-1)' : 'none' }}>
                <div className="av-head" onClick={() => toggle(c.id)}>
                  <button className={'av-chev' + (isOpen ? ' open' : '')}><Icon name="chevron-right" style={{ width: 15 }} /></button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14, color: 'var(--fg-1)', fontWeight: 600 }}>{c.libelle}</span>
                    {audit.couple && <span style={{ fontSize: 12, color: 'var(--fg-3)', marginLeft: 8 }}>· {c.ownerName}</span>}
                    <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{eur(c.encours)} · {c.anciennete} ans · récupérable +{eur(c.recovered)}/an</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', textAlign: 'right', flex: 'none' }}>
                    <span style={{ color: 'var(--danger)' }}>{r2(c.feesCur)} %</span>
                    <span style={{ color: 'var(--fg-4)', margin: '0 7px' }}>→</span>
                    <span style={{ color: 'var(--accent)' }}>{r2(c.feesTarget)} %</span></span>
                </div>
                <div style={{ marginTop: 10 }}><BarMeter value={c.feesCur} max={Math.max(2.4, c.feesCur)} color="var(--danger)" /></div>
                {isOpen && (
                  <div className="av-detail">
                    {layers.map((l, j) => (
                      <div key={j} className="av-line">
                        <span className="av-lab">{l.label}</span>
                        <span className="av-val">
                          <span style={{ color: 'var(--danger)' }}>{r2(l.cur)} %</span>
                          <span style={{ color: 'var(--fg-4)', margin: '0 6px' }}>→</span>
                          <span style={{ color: 'var(--accent)' }}>{r2(l.opt)} %</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {!av.contrats.length && <div style={{ padding: '14px 0', color: 'var(--fg-4)', fontSize: 13.5 }}>Aucun contrat saisi.</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <StatTile icon="shield-check" iconColor="#3FDBC2" iconBg="var(--gain-soft)" label="Récupérable / an" value={'+' + eur(av.recovered)} valueColor="var(--accent)"
            foot={<span style={{ fontSize: 13, color: 'var(--fg-2)' }}>sur {eur(av.encours)} d'encours, à risque équivalent</span>} />
          <div className="card card-pad">
            <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 14 }}>Impact sur 10 ans</div>
            <div className="hero-fig" style={{ fontSize: 40, color: 'var(--accent)' }}>+{eur(av.recovered * 12)}</div>
            <p style={{ fontSize: 13, color: 'var(--fg-2)', margin: '10px 0 0', lineHeight: 1.55 }}>
              En transférant vers un contrat à frais réduits et des fonds indiciels, l'écart se capitalise et change l'ordre de grandeur.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 3 · PERFORMANCE LONG TERME ---------------- */
function PerfView({ setView, audit }) {
  const p = audit.perf;
  const r1 = (x) => x.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  return (
    <div className="content fade-in">
      <BackLink setView={setView} />
      <SectionHead eyebrow="Fuite 03 · performance long terme"
        title="Vos placements long terme sous-performent."
        sub={`Sur un horizon long, un profil dynamique vise ~${r1(p.dynamique)} %/an. L'écart entre vos performances actuelles et ce potentiel, c'est un manque à gagner qui se capitalise.`} />
      <div className="grid-2">
        <div className="card card-pad">
          <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 18 }}>Vos enveloppes investies</div>
          {p.investis.map((e, i) => (
            <div key={i} style={{ padding: '13px 0', borderBottom: i < p.investis.length - 1 ? '1px solid var(--line-1)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div><span style={{ fontSize: 14, color: 'var(--fg-1)', fontWeight: 600 }}>{e.type}</span>
                  {audit.couple && <span style={{ fontSize: 12, color: 'var(--fg-3)', marginLeft: 8 }}>· {e.ownerName}</span>}
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{eur(e.montant)} · {e.anciennete} ans</div></div>
                <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                  <span style={{ color: 'var(--azure)' }}>{r1(e.perf)} %</span>
                  <span style={{ color: 'var(--fg-4)', margin: '0 7px' }}>→</span>
                  <span style={{ color: 'var(--accent)' }}>{r1(p.dynamique)} %</span></span>
              </div>
              <BarMeter value={e.perf} max={p.dynamique} color="var(--azure)" />
            </div>
          ))}
          {!p.investis.length && <div style={{ padding: '14px 0', color: 'var(--fg-4)', fontSize: 13.5 }}>Aucune enveloppe investie saisie (PEA, CTO, PEE).</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <StatTile icon="trending-up" iconColor="#5AA2F5" iconBg="var(--azure-soft)" label="Manque à gagner / an" value={'−' + eur(p.leak)} valueColor="var(--azure)"
            foot={<span style={{ fontSize: 13, color: 'var(--fg-2)' }}>sur {eur(p.montant)} investis, écart de performance</span>} />
          <div className="card card-pad">
            <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 14 }}>Le PEA, un outil long terme</div>
            <p style={{ fontSize: 13.5, color: 'var(--fg-2)', margin: 0, lineHeight: 1.6 }}>
              Au-delà de 5 ans, le PEA capitalise sans impôt sur le revenu (hors prélèvements sociaux).
              C'est l'enveloppe idéale pour viser une performance dynamique sur le long terme — encore
              faut-il qu'il soit investi sur les bons supports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 4 · OPTIMISATION PER ---------------- */
function PerView({ setView, audit }) {
  const f = audit.per, fn = audit.fiscalNotes;
  return (
    <div className="content fade-in">
      <BackLink setView={setView} />
      <SectionHead eyebrow="Fuite 04 · optimisation PER"
        title="Vous ne déduisez pas assez d'impôt."
        sub={`Chaque euro versé sur un PER est déductible de vos revenus, dans la limite de ${audit.per.tmi ? Math.round(audit.per.tmi * 100) : 30} % d'imposition. Le manque à verser, c'est de l'impôt payé en trop.`} />
      <div className="grid-2">
        <div className="card card-pad">
          <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 16 }}>Votre potentiel de versement PER</div>
          <DataRow label="Plafond déductible" sub="10 % des revenus du foyer (plafonné)" value={eur(f.plafond)} />
          <DataRow label="Versement actuel" sub={f.count ? `${f.count} PER existant(s)` : 'aucun PER alimenté'} value={eur(f.verse)} />
          <DataRow label="Manque à verser" sub="potentiel non utilisé" value={eur(f.gap)} valueColor="var(--fg-1)" />
          <div className="drow" style={{ borderTop: '1px solid var(--line-2)' }}>
            <div className="dlab" style={{ fontSize: 15 }}>Économie d'impôt à {Math.round(f.tmi * 100)} %</div>
            <div className="dval" style={{ fontSize: 18, color: 'var(--accent)' }}>+{eur(f.leak)} / an</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <StatTile icon="landmark" iconColor="#3FDBC2" iconBg="var(--gain-soft)" label="Économie d'impôt / an" value={'+' + eur(f.leak)} valueColor="var(--accent)"
            foot={<span style={{ fontSize: 13, color: 'var(--fg-2)' }}>en versant {eur(f.gap)} de plus sur un PER optimisé</span>} />
          <div className="card card-pad">
            <div className="eyebrow" style={{ color: 'var(--fg-3)', marginBottom: 14 }}>Autres leviers fiscaux disponibles</div>
            <DataRow label="Assurance-vie > 8 ans" sub={fn.avEligible ? `${eur(fn.abattement)}/an de PV exonérées d'IR` : 'abattement dès 8 ans de détention'}
              value={fn.avEligible ? 'Actif' : 'À venir'} valueColor={fn.avEligible ? 'var(--accent)' : 'var(--fg-4)'} />
            <DataRow label="PEA > 5 ans" sub="plus-values exonérées d'IR (hors PS)" value={fn.peaEligible ? 'Actif' : 'À venir'}
              valueColor={fn.peaEligible ? 'var(--accent)' : 'var(--fg-4)'} />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SynthesisView, DormantView, AvView, PerfView, PerView, Legend, BackLink });
