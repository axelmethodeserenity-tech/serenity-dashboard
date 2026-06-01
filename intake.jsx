/* ===== Serenity Dashboard — parcours de saisie (intake) ===== */
const { useState: useStateIntake } = React;

/* ---------- champs réutilisables ---------- */
function FieldShell({ label, hint, children, style }) {
  return (
    <label className="fld" style={style}>
      {label && <span className="fld-l">{label}</span>}
      {children}
      {hint && <span className="fld-h">{hint}</span>}
    </label>
  );
}
function EuroField({ label, hint, value, onChange, style }) {
  return (
    <FieldShell label={label} hint={hint} style={style}>
      <div className="fld-wrap">
        <input className="fld-in" inputMode="numeric" value={value ? fmt(value) : ''} placeholder="0"
          onChange={e => onChange(parseInt(e.target.value.replace(/[^\d]/g, ''), 10) || 0)} />
        <span className="fld-suf">€</span>
      </div>
    </FieldShell>
  );
}
/* champ € avec flèches d'incrémentation (et plafond optionnel) */
function EuroStepField({ label, hint, value, onChange, step = 100, max = 0, style }) {
  const v = value || 0;
  const clamp = (n) => { n = Math.max(0, n); if (max > 0) n = Math.min(max, n); return n; };
  const capped = max > 0 && v >= max;
  return (
    <FieldShell label={label} hint={hint} style={style}>
      <div className={'fld-wrap stepper-wrap' + (capped ? ' capped' : '')}>
        <button type="button" className="stp" tabIndex={-1} onClick={() => onChange(clamp(v - step))} aria-label="Diminuer">
          <Icon name="minus" style={{ width: 14 }} /></button>
        <input className="fld-in stp-in" inputMode="numeric" value={v ? fmt(v) : ''} placeholder="0"
          onChange={e => onChange(clamp(parseInt(e.target.value.replace(/[^\d]/g, ''), 10) || 0))} />
        <span className="fld-suf">€</span>
        <button type="button" className="stp" tabIndex={-1} onClick={() => onChange(clamp(v + step))} aria-label="Augmenter">
          <Icon name="plus" style={{ width: 14 }} /></button>
      </div>
    </FieldShell>
  );
}
function PctField({ label, hint, value, onChange, step = 0.05, style }) {
  return (
    <FieldShell label={label} hint={hint} style={style}>
      <div className="fld-wrap">
        <input className="fld-in" type="number" step={step} min="0" value={value || ''} placeholder="0"
          onChange={e => onChange(parseFloat(e.target.value) || 0)} />
        <span className="fld-suf">%</span>
      </div>
    </FieldShell>
  );
}
function NumField({ label, hint, value, onChange, suffix, style }) {
  return (
    <FieldShell label={label} hint={hint} style={style}>
      <div className="fld-wrap">
        <input className="fld-in" type="number" min="0" value={value || ''} placeholder="0"
          onChange={e => onChange(parseInt(e.target.value, 10) || 0)} />
        {suffix && <span className="fld-suf">{suffix}</span>}
      </div>
    </FieldShell>
  );
}
function TextField({ label, hint, value, onChange, style }) {
  return (
    <FieldShell label={label} hint={hint} style={style}>
      <input className="fld-in solo" value={value} onChange={e => onChange(e.target.value)} />
    </FieldShell>
  );
}
function SelectField({ label, value, onChange, options, style }) {
  return (
    <FieldShell label={label} style={style}>
      <div className="fld-wrap">
        <select className="fld-in fld-sel" value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <Icon name="chevron-down" style={{ width: 15, color: 'var(--fg-3)' }} />
      </div>
    </FieldShell>
  );
}
function ChoiceField({ label, value, onChange, options, style }) {
  return (
    <FieldShell label={label} style={style}>
      <div className="seg seg-wrap">
        {options.map(o => (
          <button key={o.v} type="button" className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>{o.l}</button>
        ))}
      </div>
    </FieldShell>
  );
}

/* ---------- intro (plein écran) ---------- */
function IntroView({ setView }) {
  return (
    <div className="intro-stage">
      <div className="intro-hero">
        <span className="intro-mark">
          <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
            <path d="M11 46 C22 46 24 30 34 29 C45 28 49 19 53 12" stroke="#3FDBC2" strokeWidth="6.5" strokeLinecap="round" />
            <circle cx="53" cy="12" r="5.5" fill="#3FDBC2" />
          </svg>
        </span>
        <span className="eyebrow">Diagnostic patrimonial Serenity</span>
        <h1 className="intro-title">Voyons précisément où votre épargne perd de la valeur.</h1>
        <p className="intro-sub">
          Renseignez votre situation — épargne, assurance-vie, enveloppes. Serenity chiffre votre
          manque à gagner annuel et ce qui peut être récupéré, puis génère votre bilan.</p>
        <button className="btn btn-primary btn-lg" onClick={() => setView('intake')}>
          <Icon name="pencil-line" style={{ width: 18 }} />Démarrer la saisie</button>
        <div className="intro-confid">
          <Icon name="lock" style={{ width: 13 }} />Données confidentielles · utilisées uniquement pour votre diagnostic</div>
      </div>
    </div>
  );
}

/* ---------- list editor générique ---------- */
function ListBlock({ title, hint, items, onAdd, addLabel, children }) {
  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: items.length ? 18 : 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow" style={{ color: 'var(--fg-3)' }}>{title}</div>
          {hint && <div style={{ fontSize: 12.5, color: 'var(--fg-4)', marginTop: 6 }}>{hint}</div>}
        </div>
        <button className="btn btn-add" onClick={onAdd}>
          <Icon name="plus" style={{ width: 17 }} />{addLabel}</button>
      </div>
      {children}
    </div>
  );
}
function RowCard({ children, onRemove }) {
  return (
    <div className="row-card">
      <div className="row-grid">{children}</div>
      <button className="row-del" onClick={onRemove} title="Supprimer">
        <Icon name="trash-2" style={{ width: 15 }} /><span>Supprimer</span></button>
    </div>
  );
}

/* ---------- étapes ---------- */
const STEPS = [
  { id: 'profile', label: 'Profil', icon: 'user' },
  { id: 'epargne', label: 'Épargne', icon: 'piggy-bank' },
  { id: 'av', label: 'Assurance-vie', icon: 'shield' },
  { id: 'enveloppes', label: 'Enveloppes', icon: 'landmark' },
];

function IntakeView({ inputs, update, setList, setView, settings, audit, onLaunch }) {
  const [step, setStep] = useStateIntake(0);
  const P = inputs.profile;
  const couple = P.situation !== 'seul';
  const last = step === STEPS.length - 1;
  const ownerOpts = [{ v: 'p1', l: P.p1Nom || 'Prospect 1' }, { v: 'p2', l: P.p2Nom || 'Prospect 2' }];
  const envOpts = TYPES_ENVELOPPE.map(t => ({ v: t, l: t }));
  const V = audit.versements;

  const upd = (key, id, field, val) => setList(key, id, field, val);
  const settingFor = (name) => settings.livrets.find(l => l.name === name) || null;
  const rateFor = (name) => { const f = settingFor(name); return f ? f.taux : 0; };
  const plafondFor = (name) => { const f = settingFor(name); return f && f.plafond > 0 ? f.plafond : 0; };

  // livrets réglementés déjà détenus par chaque titulaire (unicité)
  const usedByOwner = {};
  inputs.epargne.forEach(a => { (usedByOwner[a.owner] = usedByOwner[a.owner] || new Set()).add(a.type); });
  const optsForRow = (row) => PRODUITS_EPARGNE
    .filter(p => !LIVRETS_UNIQUES.includes(p) || p === row.type || !(usedByOwner[row.owner] && usedByOwner[row.owner].has(p)))
    .map(p => ({ v: p, l: p }));

  return (
    <div className="content">
      <SectionHead eyebrow={`Saisie · étape ${step + 1} / ${STEPS.length}`}
        title="Situation patrimoniale du foyer"
        sub="Renseignez les informations ci-dessous. Le diagnostic se débloque une fois la saisie lancée." />

      <div className="stepper">
        {STEPS.map((s, i) => (
          <button key={s.id} className={'step' + (i === step ? ' on' : '') + (i < step ? ' done' : '')} onClick={() => setStep(i)}>
            <span className="step-n">{i < step ? '✓' : i + 1}</span>{s.label}
          </button>
        ))}
      </div>

      {/* contrôle de cohérence des versements */}
      {V.capacite > 0 && step > 0 && (
        <div className={'vers-banner ' + (V.coherent ? 'ok' : 'warn')}>
          <Icon name={V.coherent ? 'check-circle-2' : 'alert-triangle'} style={{ width: 18 }} />
          <span>
            Versements saisis : <b>{fmt(V.total)} €/mois</b> · capacité déclarée : <b>{fmt(V.capacite)} €/mois</b>.
            {V.coherent ? ' Cohérent.' : ` Écart de ${fmt(Math.abs(V.ecart))} €/mois ${V.ecart > 0 ? '(versements supérieurs à la capacité)' : '(capacité non entièrement allouée)'}.`}
          </span>
        </div>
      )}

      {/* ---- PROFIL ---- */}
      {step === 0 && (
        <div className="card card-pad form-2">
          <ChoiceField label="Situation du foyer" value={P.situation} onChange={v => update('profile.situation', v)}
            style={{ gridColumn: '1 / -1' }}
            options={[{ v: 'seul', l: 'Personne seule' }, { v: 'couple', l: 'Couple marié' }, { v: 'pacs', l: 'Pacsé' }, { v: 'concubinage', l: 'Concubinage' }]} />

          <TextField label={couple ? 'Nom du prospect 1' : 'Nom du prospect'} value={P.p1Nom} onChange={v => update('profile.p1Nom', v)} />
          <NumField label={couple ? 'Âge du prospect 1' : 'Âge'} suffix="ans" value={P.p1Age} onChange={v => update('profile.p1Age', v)} />
          {couple && <TextField label="Nom du prospect 2" value={P.p2Nom} onChange={v => update('profile.p2Nom', v)} />}
          {couple && <NumField label="Âge du prospect 2" suffix="ans" value={P.p2Age} onChange={v => update('profile.p2Age', v)} />}

          <EuroStepField label="Revenu net imposable du foyer / an" step={1000} hint="sert au calcul du plafond PER déductible"
            value={P.revenuFoyer} onChange={v => update('profile.revenuFoyer', v)} />
          <EuroStepField label="Dépenses essentielles du foyer / mois" step={50} hint="sert à estimer votre épargne de précaution conseillée"
            value={P.depensesMensuelles} onChange={v => update('profile.depensesMensuelles', v)} />
          <ChoiceField label="Tranche marginale d'imposition" value={P.tmi} onChange={v => update('profile.tmi', parseFloat(v))}
            options={[{ v: 0.11, l: '11 %' }, { v: 0.30, l: '30 %' }, { v: 0.41, l: '41 %' }, { v: 0.45, l: '45 %' }]} />
          <EuroStepField label="Capacité d'investissement / mois" step={50} hint="épargne mobilisable chaque mois"
            value={P.capaciteMensuelle} onChange={v => update('profile.capaciteMensuelle', v)} />
          <ChoiceField label="Profil d'investissement du foyer" value={P.profilInvest} onChange={v => update('profile.profilInvest', v)}
            style={{ gridColumn: '1 / -1' }}
            options={[
              { v: 'prudent', l: `Prudent · ${r2(settings.projProfils.prudent)} %` },
              { v: 'equilibre', l: `Équilibré · ${r2(settings.projProfils.equilibre)} %` },
              { v: 'dynamique', l: `Dynamique · ${r2(settings.projProfils.dynamique)} %` },
              { v: 'offensif', l: `Offensif · ${r2(settings.projProfils.offensif)} %` },
            ]} />
        </div>
      )}

      {/* ---- ÉPARGNE ---- */}
      {step === 1 && (
        <React.Fragment>
          <div className="card card-pad precaution-card">
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="eyebrow" style={{ color: 'var(--accent)' }}>Épargne de précaution</div>
              <div style={{ fontSize: 13.5, color: 'var(--fg-2)', marginTop: 8, lineHeight: 1.5 }}>
                Combien souhaitez-vous garder disponible en cas d'imprévu ? Ce montant ne sera pas
                considéré comme dormant.
                {P.depensesMensuelles > 0 && <> Repère : <b style={{ color: 'var(--fg-1)' }}>{eur(audit.dormant.precautionMin)} à {eur(audit.dormant.precautionMax)}</b> (3 à 6 mois de dépenses).</>}
              </div>
            </div>
            <EuroStepField label="Précaution souhaitée" step={500} style={{ flex: '0 0 240px' }}
              value={P.precautionSouhaitee} onChange={v => update('profile.precautionSouhaitee', v)} />
          </div>

          <ListBlock title="Livrets & liquidités" addLabel="Ajouter un livret"
            hint="Un livret réglementé par personne (Livret A, LDDS, LEP, CEL, Livret Jeune, PEL). Le taux et le plafond se pré-remplissent ; « Autre liquidité » accepte un taux libre."
            items={inputs.epargne} onAdd={() => setList('epargne', 'ADD')}>
            {inputs.epargne.map(a => {
              const plaf = plafondFor(a.type);
              return (
                <RowCard key={a.id} onRemove={() => setList('epargne', 'DEL', a.id)}>
                  <SelectField label="Type" value={a.type} options={optsForRow(a)}
                    onChange={v => { upd('epargne', a.id, 'type', v); upd('epargne', a.id, 'taux', rateFor(v)); const pl = plafondFor(v); if (pl > 0 && a.montant > pl) upd('epargne', a.id, 'montant', pl); }} />
                  <EuroStepField label="Montant" step={100} max={plaf} value={a.montant} onChange={v => upd('epargne', a.id, 'montant', v)}
                    hint={plaf > 0 ? `Plafond : ${eur(plaf)}` : null} />
                  <PctField label="Taux annuel" step={0.05} value={a.taux} onChange={v => upd('epargne', a.id, 'taux', v)} />
                  <EuroStepField label="Versement mensuel" step={10} value={a.versementMensuel} onChange={v => upd('epargne', a.id, 'versementMensuel', v)} />
                  {couple && <SelectField label="Titulaire" value={a.owner} options={ownerOpts} onChange={v => upd('epargne', a.id, 'owner', v)} />}
                </RowCard>
              );
            })}
            {!inputs.epargne.length && <Empty label="Aucun livret saisi" />}
          </ListBlock>
        </React.Fragment>
      )}

      {/* ---- ASSURANCE-VIE ---- */}
      {step === 2 && (
        <ListBlock title="Contrats d'assurance-vie" addLabel="Ajouter un contrat"
          hint="Un contrat par ligne. Les frais de gestion peuvent différer entre la poche unités de compte et le fonds en euros."
          items={inputs.assuranceVie} onAdd={() => setList('assuranceVie', 'ADD')}>
          {inputs.assuranceVie.map(c => (
            <RowCard key={c.id} onRemove={() => setList('assuranceVie', 'DEL', c.id)}>
              <TextField label="Libellé du contrat" value={c.libelle} onChange={v => upd('assuranceVie', c.id, 'libelle', v)} />
              {couple && <SelectField label="Détenteur" value={c.owner} options={ownerOpts} onChange={v => upd('assuranceVie', c.id, 'owner', v)} />}
              <EuroStepField label="Encours" step={100} value={c.encours} onChange={v => upd('assuranceVie', c.id, 'encours', v)} />
              <NumField label="Ancienneté" suffix="ans" value={c.anciennete} onChange={v => upd('assuranceVie', c.id, 'anciennete', v)} />
              <PctField label="Frais de gestion (UC)" value={c.fraisGestionUC} onChange={v => upd('assuranceVie', c.id, 'fraisGestionUC', v)} />
              <PctField label="Frais de gestion (fonds €)" value={c.fraisGestionFE} onChange={v => upd('assuranceVie', c.id, 'fraisGestionFE', v)} />
              <PctField label="Frais des unités de compte" value={c.fraisUC} onChange={v => upd('assuranceVie', c.id, 'fraisUC', v)} />
              <PctField label="Frais sur versement" step={0.1} value={c.fraisVersement} onChange={v => upd('assuranceVie', c.id, 'fraisVersement', v)} />
              <EuroStepField label="Versement mensuel" step={10} value={c.versementMensuel} onChange={v => upd('assuranceVie', c.id, 'versementMensuel', v)} />
            </RowCard>
          ))}
          {!inputs.assuranceVie.length && <Empty label="Aucun contrat d'assurance-vie saisi" />}
        </ListBlock>
      )}

      {/* ---- ENVELOPPES ---- */}
      {step === 3 && (
        <ListBlock title="Enveloppes (PEA, CTO, PER, PEE)" addLabel="Ajouter une enveloppe"
          hint="Pour le PEA/CTO/PEE : indiquez la performance annuelle (comparée au profil dynamique). Pour le PER : le versement annuel actuel."
          items={inputs.enveloppes} onAdd={() => setList('enveloppes', 'ADD')}>
          {inputs.enveloppes.map(e => {
            const isPer = e.type === 'PER';
            return (
              <RowCard key={e.id} onRemove={() => setList('enveloppes', 'DEL', e.id)}>
                <SelectField label="Type d'enveloppe" value={e.type} options={envOpts} onChange={v => upd('enveloppes', e.id, 'type', v)} />
                {couple && <SelectField label="Titulaire" value={e.owner} options={ownerOpts} onChange={v => upd('enveloppes', e.id, 'owner', v)} />}
                <EuroStepField label="Montant" step={100} value={e.montant} onChange={v => upd('enveloppes', e.id, 'montant', v)} />
                <NumField label="Ancienneté" suffix="ans" value={e.anciennete} onChange={v => upd('enveloppes', e.id, 'anciennete', v)} />
                {!isPer && <PctField label="Performance annuelle" step={0.1} value={e.performance} onChange={v => upd('enveloppes', e.id, 'performance', v)} />}
                {!isPer && <EuroStepField label="Versement mensuel" step={10} value={e.versementMensuel} onChange={v => upd('enveloppes', e.id, 'versementMensuel', v)} />}
                {isPer && <EuroStepField label="Versement PER actuel / an" step={100} value={e.perVerseAnnuel} onChange={v => upd('enveloppes', e.id, 'perVerseAnnuel', v)} />}
              </RowCard>
            );
          })}
          {!inputs.enveloppes.length && <Empty label="Aucune enveloppe saisie" />}
        </ListBlock>
      )}

      {/* nav */}
      <div style={{ display: 'flex', gap: 12 }}>
        {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}><Icon name="arrow-left" style={{ width: 16 }} />Précédent</button>}
        {!last && <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setStep(step + 1)}>Continuer<Icon name="arrow-right" style={{ width: 16 }} /></button>}
        {last && <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={onLaunch}><Icon name="sparkles" style={{ width: 16 }} />Lancer mon diagnostic</button>}
      </div>
    </div>
  );
}

function Empty({ label }) {
  return <div style={{ padding: '22px 0', textAlign: 'center', color: 'var(--fg-4)', fontSize: 13.5 }}>{label}</div>;
}

Object.assign(window, { IntroView, IntakeView, EuroField, EuroStepField, PctField, NumField, TextField, SelectField, ChoiceField });
