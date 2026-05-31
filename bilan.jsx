/* ===== Serenity Dashboard — Bilan (document clair, téléchargeable) ===== */

function DocRow({ label, sub, value, strong }) {
  return (
    <div className="doc-row" style={strong ? { borderBottom: 'none' } : {}}>
      <div>
        <div className="doc-lab" style={strong ? { fontSize: 16 } : {}}>{label}</div>
        {sub && <div className="doc-sub">{sub}</div>}
      </div>
      <div className="doc-val" style={strong ? { fontSize: 19, color: '#1FA992' } : {}}>{value}</div>
    </div>
  );
}

function BilanView({ setView, audit, projHorizon }) {
  const A = audit, d = A.dormant, av = A.av, perf = A.perf, per = A.per, fn = A.fiscalNotes;
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const S = A.settings;
  // projection : profil du foyer (saisie) + horizon retenu dans l'onglet Projection
  const projH = projHorizon || 15;
  const rOpt = A.profilRate;
  const rAct = A.perfActuelle;
  const profilNom = { prudent: 'prudent', equilibre: 'équilibré', dynamique: 'dynamique', offensif: 'offensif' }[A.profilInvest] || 'équilibré';
  const projOpt = Math.round(A.patrimoineInvesti * Math.pow(1 + rOpt / 100, projH));
  const projCur = Math.round(A.patrimoineInvesti * Math.pow(1 + rAct / 100, projH));
  const projEcart = projOpt - projCur;
  const yEnd = new Date().getFullYear() + projH;
  const r1 = (x) => x.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

  const sections = [
    { n: '01', title: 'Épargne dormante', color: '#E8A24D',
      note: <>Une épargne de précaution de <b>3 à 6 mois</b> de dépenses ({eur(d.precautionMin)} à {eur(d.precaution)}) suffit.
        Vos liquidités s'élèvent à {eur(d.liquidites)} : le surplus de <b>{eur(d.surplus)}</b> et l'épargne récurrente versée sur des livrets
        ({eur(d.epargneRecurrenteAnnuelle)}/an) ne travaillent pas au rythme d'un profil {profilNom} (~{r1(d.targetRate)} %/an).</>,
      rows: [
        { label: 'Surplus immobilisé', sub: 'au-delà de la précaution', value: eur(d.surplus) },
        { label: 'Capacité non investie', sub: 'par an', value: eur(d.capaciteAnnuelle) },
        { label: 'Manque à gagner', sub: "coût d'opportunité annuel", value: '+' + eur(d.leak) + ' / an', strong: true },
      ] },
    { n: '02', title: 'Frais d\'assurance-vie', color: '#EC6A56',
      note: <>Un contrat optimal limite les frais à <b>~{r2(av.feesTarget)} %/an</b> (fonds indiciels).
        Vos frais moyens atteignent <b>{r2(av.feesAvg)} %/an</b> sur {eur(av.encours)} d'encours.</>,
      rows: [
        { label: 'Frais moyens actuels', sub: `vs ${r2(av.feesTarget)} % cible`, value: r2(av.feesAvg) + ' %' },
        { label: 'Récupérable', sub: 'à risque équivalent', value: '+' + eur(av.recovered) + ' / an', strong: true },
      ] },
    { n: '03', title: 'Performance long terme', color: '#5AA2F5',
      note: <>Sur le long terme, un profil dynamique vise <b>~{perf.dynamique.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %/an</b>. L'écart entre vos performances
        actuelles et ce potentiel, sur {eur(perf.montant)} investis, représente un manque à gagner annuel.</>,
      rows: [
        { label: 'Capital investi concerné', sub: 'PEA / CTO / PEE', value: eur(perf.montant) },
        { label: 'Manque à gagner', sub: 'écart de performance', value: '+' + eur(perf.leak) + ' / an', strong: true },
      ] },
    { n: '04', title: 'Optimisation PER', color: '#1FA992',
      note: <>Le versement déductible optimal est de <b>{eur(per.plafond)}/an</b>. Vous versez aujourd'hui {eur(per.verse)} :
        le manque à verser de {eur(per.gap)}, déduit à {Math.round(per.tmi * 100)} %, génère une économie d'impôt directe.
        {fn.avEligible && <> Par ailleurs, votre assurance-vie de plus de 8 ans ouvre {eur(fn.abattement)}/an d'abattement sur les plus-values.</>}
        {fn.peaEligible && <> Votre PEA de plus de 5 ans capitalise hors IR (hors prélèvements sociaux).</>}</>,
      rows: [
        { label: 'Versement PER optimal', sub: '10 % des revenus (plafonné)', value: eur(per.plafond) },
        { label: 'Manque à verser', sub: 'potentiel non utilisé', value: eur(per.gap) },
        { label: 'Économie d\'impôt', sub: `à ${Math.round(per.tmi * 100)} % d'imposition`, value: '+' + eur(per.leak) + ' / an', strong: true },
      ] },
  ];

  return (
    <div>
      <div className="bilan-toolbar no-print">
        <button className="btn btn-ghost" onClick={() => setView('synthese')}><Icon name="arrow-left" style={{ width: 16 }} />Retour au diagnostic</button>
        <span style={{ fontSize: 13.5, color: 'var(--fg-3)', fontWeight: 600 }}>Aperçu du bilan — prêt à imprimer / enregistrer en PDF</span>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => window.print()}><Icon name="file-down" style={{ width: 16 }} />Télécharger le PDF</button>
      </div>

      <div className="bilan-stage">
        <div className="sheet">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: '#0C0E12', display: 'grid', placeItems: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
                <path d="M11 46 C22 46 24 30 34 29 C45 28 49 19 53 12" stroke="#3FDBC2" strokeWidth="6.5" strokeLinecap="round" />
                <circle cx="53" cy="12" r="5.5" fill="#3FDBC2" /></svg>
            </span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#10161A' }}>Serenity</span>
            <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#9C9888' }}>Diagnostic patrimonial · {today}</span>
          </div>

          <div className="doc-eyebrow">Diagnostic patrimonial confidentiel</div>
          <h1 style={{ fontSize: 38, lineHeight: 1.08, letterSpacing: '-.02em', margin: '12px 0 6px' }}>{A.prospect.name}</h1>
          <p style={{ fontSize: 14.5, color: '#5A5F52', margin: 0 }}>
            {A.prospect.situation === 'seul' ? 'Personne seule' : 'Foyer'} · patrimoine financier {eur(A.patrimoine)}</p>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 36, margin: '36px 0', padding: '28px 30px', background: '#0C0E12', borderRadius: 14, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#3FDBC2', fontWeight: 700 }}>Récupérable / an</div>
              <div className="doc-fig" style={{ fontSize: 46, color: '#5FE9D2', marginTop: 6 }}>+{fmt(A.totals.leakPerYear)} €</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,.14)', paddingLeft: 30 }}>
              <div style={{ fontSize: 12.5, color: '#AAB4C0' }}>Sur 10 ans</div>
              <div className="doc-fig" style={{ fontSize: 24, color: '#F1F4F7', marginTop: 6 }}>+{eur(A.totals.over10)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12.5, color: '#AAB4C0' }}>Capital investi en {yEnd}</div>
              <div className="doc-fig" style={{ fontSize: 24, color: '#F1F4F7', marginTop: 6 }}>+{eur(projEcart)}</div>
            </div>
          </div>

          {sections.map(s => (
            <div key={s.n} style={{ marginBottom: 30 }}>
              <h2 style={{ fontSize: 21, marginBottom: 4, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>{s.title}</h2>
              <div className="doc-note" style={{ margin: '14px 0 16px', borderLeftColor: s.color }}>{s.note}</div>
              {s.rows.map((r, i) => <DocRow key={i} {...r} />)}
            </div>
          ))}

          {/* Projection */}
          <div style={{ marginBottom: 30 }}>
            <h2 style={{ fontSize: 21, marginBottom: 4, display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ color: '#5AA2F5', fontVariantNumeric: 'tabular-nums' }}>05</span>Projection de votre capital investi</h2>
            <div className="doc-note" style={{ margin: '14px 0 16px', borderLeftColor: '#5AA2F5' }}>
              Sur votre patrimoine investi ({eur(A.patrimoineInvesti)}, hors épargne de précaution), une allocation
              <b> {profilNom} (~{r1(rOpt)} %/an)</b> projetée sur <b>{projH} ans</b> dépasse nettement votre performance
              actuelle estimée (~{r1(rAct)} %/an). L'écart cumulé illustre le coût, dans le temps, du statu quo.</div>
            <DocRow label="Capital investi aujourd'hui" sub="hors livrets / précaution" value={eur(A.patrimoineInvesti)} />
            <DocRow label={`Trajectoire actuelle en ${yEnd}`} sub={`~${r1(rAct)} %/an`} value={eur(projCur)} />
            <DocRow label={`Trajectoire optimisée en ${yEnd}`} sub={`profil ${profilNom} ~${r1(rOpt)} %/an`} value={eur(projOpt)} />
            <DocRow label="Écart cumulé" sub={`sur ${projH} ans`} value={'+' + eur(projEcart)} strong />
          </div>

          <hr className="doc-line" style={{ margin: '32px 0 18px' }} />
          <p className="doc-foot">
            Document établi par Axel Luçon — Conseiller en gestion de patrimoine. Estimations à titre indicatif,
            fondées sur les informations communiquées et des hypothèses de marché (profil {profilNom} ~{r1(d.targetRate)} %/an,
            performance long terme {r1(perf.dynamique)} %/an, taux à jour février 2026). Ne constitue pas un conseil d'investissement
            personnalisé au sens réglementaire avant étude complète.
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BilanView });
