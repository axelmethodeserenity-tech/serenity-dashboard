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

/* owner selector (caché si personne seule) */
function OwnerSelect({ couple, profile, value, onChange }) {
  if (!couple) return null;
  return (
    <SelectField label="Titulaire" value={value} onChange={onChange}
      options={[{ v: 'p1', l: profile.p1Nom || 'Prospect 1' }, { v: 'p2', l: profile.p2Nom || 'Prospect 2' }]} />
  );
}

/* ---------- intro ---------- */
function IntroView({ setView }) {
  return (
    <div className="content">
      <div className="intro-hero">
        <span className="eyebrow">Diagnostic patrimonial Serenity</span>
        <h1 className="intro-title">Voyons précisément où votre épargne perd de la valeur.</h1>
        <p className="sec-sub" style={{ textAlign: 'center', fontSize: 17 }}>
          Renseignez votre situation — épargne, assurance-vie, enveloppes. Serenity chiffre votre
          manque à gagner annuel et ce qui peut être récupéré, puis génère votre bilan.</p>
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          <button className="btn btn-primary" onClick={() => setView('intake')}>
            <Icon name="pencil-line" style={{ width: 16 }} />Démarrer la saisie</button>
        </div>
        <div className="dropzone" onClick={() => setView('intake')}>
          <Icon name="upload-cloud" style={{ width: 30, color: 'var(--fg-3)' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-2)', marginTop: 10 }}>
            Ou déposez vos relevés (assurance-vie, livrets, avis d'imposition)</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-4)', marginTop: 4 }}>PDF, image — lecture des contrats</div>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--fg-4)' }}>Données confidentielles · utilisées uniquement pour votre audit</div>
      </div>
    </div>
  );
}

/* ---------- list editor générique ---------- */
function ListBlock({ title, hint, items, onAdd, addLabel, children }) {
  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: items.length ? 18 : 6 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--fg-3)' }}>{title}</div>
          {hint && <div style={{ fontSize: 12.5, color: 'var(--fg-4)', marginTop: 6 }}>{hint}</div>}
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '9px 16px' }} onClick={onAdd}>
          <Icon name="plus" style={{ width: 16 }} />{addLabel}</button>
      </div>
      {children}
    </div>
  );
}
function RowCard({ children, onRemove }) {
  return (
    <div className="row-card">
      <div className="row-grid">{children}</div>
      <button className="row-del" onClick={onRemove} title="Supprimer"><Icon name="trash-2" style={{ width: 16 }} /></button>
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
  const livretOpts = PRODUITS_EPARGNE.map(p => ({ v: p, l: p }));
  const envOpts = TYPES_ENVELOPPE.map(t => ({ v: t, l: t }));
  const V = audit.versements;

  // helper to update a list item field
  const upd = (key, id, field, val) => setList(key, id, field, val);
  // when picking a known product, prefill its rate from settings
  const rateFor = (name) => { const f = settings.livrets.find(l => l.name === name); return f ? f.taux : 0; };

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

      {/* contrôle de cohérence des versements (dès qu'une capacité est saisie) */}
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

          <TextField label="Nom du prospect" value={P.p1Nom} onChange={v => update('profile.p1Nom', v)} />
          <NumField label="Âge" suffix="ans" value={P.p1Age} onChange={v => update('profile.p1Age', v)} />
          {couple && <TextField label="Nom du prospect 2" value={P.p2Nom} onChange={v => update('profile.p2Nom', v)} />}
          {couple && <NumField label="Âge du prospect 2" suffix="ans" value={P.p2Age} onChange={v => update('profile.p2Age', v)} />}

          <EuroField label="Revenu net imposable du foyer / an" hint="sert au calcul du plafond PER déductible"
            value={P.revenuFoyer} onChange={v => update('profile.revenuFoyer', v)} />
          <EuroField label="Dépenses essentielles du foyer / mois" hint="base de l'épargne de précaution (3 à 6 mois)"
            value={P.depensesMensuelles} onChange={v => update('profile.depensesMensuelles', v)} />
          <ChoiceField label="Tranche marginale d'imposition" value={P.tmi} onChange={v => update('profile.tmi', parseFloat(v))}
            options={[{ v: 0.11, l: '11 %' }, { v: 0.30, l: '30 %' }, { v: 0.41, l: '41 %' }, { v: 0.45, l: '45 %' }]} />
          <EuroField label="Capacité d'investissement / mois" hint="épargne mobilisable, comptée en coût d'opportunité"
            value={P.capaciteMensuelle} onChange={v => update('profile.capaciteMensuelle', v)} />
          <ChoiceField label="Profil d'investissement du foyer" value={P.profilInvest} onChange={v => update('profile.profilInvest', v)}
            style={{ gridColumn: '1 / -1' }}
            options={[
              { v: 'prudent', l: `Prudent · ${settings.projProfils.prudent.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %` },
              { v: 'equilibre', l: `Équilibré · ${settings.projProfils.equilibre.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %` },
              { v: 'dynamique', l: `Dynamique · ${settings.projProfils.dynamique.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %` },
              { v: 'offensif', l: `Offensif · ${settings.projProfils.offensif.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %` },
            ]} />
        </div>
      )}

      {/* ---- ÉPARGNE ---- */}
      {step === 1 && (
        <ListBlock title="Livrets & liquidités" addLabel="Ajouter un livret"
          hint="Ajoutez chaque livret ou compte. Le taux se pré-remplit pour les produits connus ; pour « Autre liquidité », saisissez le taux."
          items={inputs.epargne} onAdd={() => setList('epargne', 'ADD')}>
          {inputs.epargne.map(a => (
            <RowCard key={a.id} onRemove={() => setList('epargne', 'DEL', a.id)}>
              <SelectField label="Type" value={a.type} options={livretOpts}
                onChange={v => { upd('epargne', a.id, 'type', v); upd('epargne', a.id, 'taux', rateFor(v)); }} />
              <EuroField label="Montant" value={a.montant} onChange={v => upd('epargne', a.id, 'montant', v)} />
              <PctField label="Taux annuel" step={0.05} value={a.taux} onChange={v => upd('epargne', a.id, 'taux', v)} />
              <NumField label="Versement mensuel" suffix="€" value={a.versementMensuel} onChange={v => upd('epargne', a.id, 'versementMensuel', v)} />
              {couple && <SelectField label="Titulaire" value={a.owner} options={ownerOpts} onChange={v => upd('epargne', a.id, 'owner', v)} />}
            </RowCard>
          ))}
          {!inputs.epargne.length && <Empty label="Aucun livret saisi" />}
        </ListBlock>
      )}

      {/* ---- ASSURANCE-VIE ---- */}
      {step === 2 && (
        <ListBlock title="Contrats d'assurance-vie" addLabel="Ajouter un contrat"
          hint="Un contrat par ligne. Indiquez les frais réels et l'ancienneté (utile pour l'avantage fiscal après 8 ans)."
          items={inputs.assuranceVie} onAdd={() => setList('assuranceVie', 'ADD')}>
          {inputs.assuranceVie.map(c => (
            <RowCard key={c.id} onRemove={() => setList('assuranceVie', 'DEL', c.id)}>
              <TextField label="Libellé du contrat" value={c.libelle} onChange={v => upd('assuranceVie', c.id, 'libelle', v)} />
              {couple && <SelectField label="Détenteur" value={c.owner} options={ownerOpts} onChange={v => upd('assuranceVie', c.id, 'owner', v)} />}
              <EuroField label="Encours" value={c.encours} onChange={v => upd('assuranceVie', c.id, 'encours', v)} />
              <NumField label="Ancienneté" suffix="ans" value={c.anciennete} onChange={v => upd('assuranceVie', c.id, 'anciennete', v)} />
              <PctField label="Frais de gestion / an" value={c.fraisGestion} onChange={v => upd('assuranceVie', c.id, 'fraisGestion', v)} />
              <PctField label="Frais unités de compte" value={c.fraisUC} onChange={v => upd('assuranceVie', c.id, 'fraisUC', v)} />
              <PctField label="Frais sur versement" step={0.1} value={c.fraisVersement} onChange={v => upd('assuranceVie', c.id, 'fraisVersement', v)} />
              <NumField label="Versement mensuel" suffix="€" value={c.versementMensuel} onChange={v => upd('assuranceVie', c.id, 'versementMensuel', v)} />
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
                <EuroField label="Montant" value={e.montant} onChange={v => upd('enveloppes', e.id, 'montant', v)} />
                <NumField label="Ancienneté" suffix="ans" value={e.anciennete} onChange={v => upd('enveloppes', e.id, 'anciennete', v)} />
                {!isPer && <PctField label="Performance annuelle" step={0.1} value={e.performance} onChange={v => upd('enveloppes', e.id, 'performance', v)} />}
                {!isPer && <NumField label="Versement mensuel" suffix="€" value={e.versementMensuel} onChange={v => upd('enveloppes', e.id, 'versementMensuel', v)} />}
                {isPer && <EuroField label="Versement PER actuel / an" value={e.perVerseAnnuel} onChange={v => upd('enveloppes', e.id, 'perVerseAnnuel', v)} />}
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

Object.assign(window, { IntroView, IntakeView, EuroField, PctField, NumField, TextField, SelectField, ChoiceField });
