/* ===== Serenity Dashboard — app ===== */
const { useState, useEffect, useMemo } = React;

function clone(o) { return JSON.parse(JSON.stringify(o)); }
const SETTINGS_KEY = 'serenity_settings_v3';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...clone(DEFAULT_SETTINGS), ...JSON.parse(raw) };
  } catch (e) {}
  return clone(DEFAULT_SETTINGS);
}

function App() {
  const [view, setViewRaw] = useState('intro');
  const [unlocked, setUnlocked] = useState(false);
  const [projHorizon, setProjHorizon] = useState(15);
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [settings, setSettingsState] = useState(loadSettings);

  const audit = useMemo(() => computeAudit(inputs, settings), [inputs, settings]);

  // gate: diagnostic / projection / bilan verrouillés tant que le diagnostic n'est pas lancé
  const LOCKED = ['synthese', 'dormant', 'fees', 'perf', 'per', 'projection', 'bilan'];
  const setView = (v) => { if (LOCKED.includes(v) && !unlocked) { setViewRaw('intake'); return; } setViewRaw(v); };
  const launch = () => { setUnlocked(true); setViewRaw('synthese'); };

  // persist settings
  const setSettings = (updater) => setSettingsState(prev => {
    const next = typeof updater === 'function' ? updater(prev) : updater;
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch (e) {}
    return next;
  });
  const resetSettings = () => setSettings(clone(DEFAULT_SETTINGS));

  // nested profile setter: update('profile.p1Nom', 'X')
  const update = (path, value) => setInputs(prev => {
    const next = clone(prev);
    const keys = path.split('.'); let o = next;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = value;
    return next;
  });

  // list operations on epargne / assuranceVie / enveloppes
  const factory = { epargne: window.newEpargne, assuranceVie: window.newAv, enveloppes: window.newEnveloppe };
  const setList = (key, op, idOrField, field, val) => setInputs(prev => {
    const next = clone(prev);
    if (op === 'ADD') {
      const item = factory[key]();
      if (key === 'epargne') {
        // défaut intelligent : 1er produit réglementé non encore détenu par p1 (sinon compte courant)
        const used = new Set(next.epargne.filter(e => e.owner === 'p1').map(e => e.type));
        const pick = window.PRODUITS_EPARGNE.find(p => window.LIVRETS_UNIQUES.includes(p) && !used.has(p)) || 'Compte courant';
        item.type = pick;
        const s = (settings.livrets || []).find(l => l.name === pick);
        item.taux = s ? s.taux : 0;
      }
      next[key] = [...next[key], item];
      return next;
    }
    if (op === 'DEL') { next[key] = next[key].filter(x => x.id !== idOrField); return next; }
    return next;
  });
  // direct item field update: setList(key, id, field, value)
  const setItem = (key, id, field, value) => setInputs(prev => {
    const next = clone(prev);
    next[key] = next[key].map(x => x.id === id ? { ...x, [field]: value } : x);
    return next;
  });
  // unified setList used by intake: (key,'ADD') | (key,'DEL',id) | (key,id,field,val)
  const listApi = (key, a, b, c) => {
    if (a === 'ADD') return setList(key, 'ADD');
    if (a === 'DEL') return setList(key, 'DEL', b);
    return setItem(key, a, b, c);
  };

  useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const showShell = view !== 'intro';
  const isBilan = view === 'bilan';

  let body;
  if (view === 'intro') body = <IntroView setView={setView} />;
  else if (view === 'intake') body = <IntakeView inputs={inputs} update={update} setList={listApi} setView={setView} settings={settings} audit={audit} onLaunch={launch} />;
  else if (view === 'dormant') body = <DormantView setView={setView} audit={audit} />;
  else if (view === 'fees') body = <AvView setView={setView} audit={audit} />;
  else if (view === 'perf') body = <PerfView setView={setView} audit={audit} />;
  else if (view === 'per') body = <PerView setView={setView} audit={audit} />;
  else if (view === 'projection') body = <ProjectionView setView={setView} audit={audit} horizon={projHorizon} setHorizon={setProjHorizon} />;
  else if (view === 'bilan') body = <BilanView setView={setView} audit={audit} projHorizon={projHorizon} />;
  else if (view === 'settings') body = <SettingsView settings={settings} setSettings={setSettings} resetSettings={resetSettings} />;
  else body = <SynthesisView setView={setView} audit={audit} projHorizon={projHorizon} />;

  return (
    <div className="app" style={view === 'intro' ? { gridTemplateColumns: '1fr' } : {}}>
      {showShell && <Sidebar view={view} setView={setView} audit={audit} unlocked={unlocked} />}
      <div className="main">
        {showShell && !isBilan && view !== 'settings' && <Topbar setView={setView} audit={audit} />}
        {body}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
