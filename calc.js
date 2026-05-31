/* ============================================================
   Serenity — moteur de calcul d'audit (4 fuites)
   Piloté par les barèmes éditables (SETTINGS) + données saisies.
   Fuites chiffrées :
     1. Épargne dormante (coût d'opportunité) — surplus + capacité non investie
     2. Frais d'assurance-vie — frais récupérables
     3. Performance long terme — écart vs profil dynamique (PEA/CTO/PEE)
     4. Optimisation PER — manque à verser × TMI (économie d'impôt)
   Hypothèses pédagogiques — à affiner par le conseiller.
   ============================================================ */
(function () {
  const num = (v) => { const x = parseFloat(v); return isFinite(x) && x > 0 ? x : 0; };

  function computeAudit(I, S) {
    const P = I.profile;
    const couple = P.situation !== 'seul';
    const ownerName = (o) => o === 'p2' ? (P.p2Nom || 'Prospect 2') : (P.p1Nom || 'Prospect 1');

    /* ---------- 1. ÉPARGNE DORMANTE ---------- */
    const ep = I.epargne || [];
    const liquidites = ep.reduce((s, a) => s + num(a.montant), 0);
    const pondere = liquidites > 0 ? ep.reduce((s, a) => s + num(a.montant) * num(a.taux), 0) / liquidites : 0;
    const precaution = num(P.depensesMensuelles) * S.precaution.moisBase;
    const precautionMin = num(P.depensesMensuelles) * S.precaution.moisMin;
    const surplus = Math.max(0, liquidites - precaution);
    // versements mensuels orientés vers les livrets/liquidités (= la part de la capacité qui dort)
    const versEpargne = ep.reduce((s, a) => s + num(a.versementMensuel), 0);
    const epargneRecurrenteAnnuelle = versEpargne * 12;
    // profil d'investissement du foyer → taux cible de comparaison pour l'épargne dormante
    const profilInvest = P.profilInvest || 'equilibre';
    const cible = S.projProfils[profilInvest] != null ? S.projProfils[profilInvest] : S.profils.equilibre;
    const manqueSurplus = surplus * (cible - pondere) / 100;
    // seule l'épargne récurrente dirigée vers les livrets est comptée (pas toute la capacité)
    const manqueCapacite = epargneRecurrenteAnnuelle * (cible - pondere) / 100;
    const dormantLeak = Math.max(0, Math.round(manqueSurplus + manqueCapacite));
    const dormant = {
      liquidites, precaution, precautionMin, surplus,
      epargneRecurrenteAnnuelle, versEpargneMensuel: versEpargne,
      blendedRate: pondere, targetRate: cible, leak: dormantLeak,
      manqueSurplus: Math.round(manqueSurplus), manqueCapacite: Math.round(manqueCapacite),
      accounts: ep.map(a => ({ ...a, montant: num(a.montant), owner: a.owner, ownerName: ownerName(a.owner) })),
    };

    /* ---------- 2. FRAIS ASSURANCE-VIE ---------- */
    const avList = I.assuranceVie || [];
    const feesTarget = S.av.fraisGestionCible + S.av.fraisUCCible;
    const avContrats = avList.map(c => {
      const feesCur = num(c.fraisGestion) + num(c.fraisUC);
      const recovered = Math.max(0, Math.round(num(c.encours) * (feesCur - feesTarget) / 100));
      return { ...c, encours: num(c.encours), feesCur, feesTarget, recovered, ownerName: ownerName(c.owner) };
    });
    const avEncours = avContrats.reduce((s, c) => s + c.encours, 0);
    const avRecovered = avContrats.reduce((s, c) => s + c.recovered, 0);
    const avFeesAvg = avEncours > 0 ? avContrats.reduce((s, c) => s + c.feesCur * c.encours, 0) / avEncours : 0;
    const av = { contrats: avContrats, encours: avEncours, recovered: avRecovered, feesAvg: avFeesAvg, feesTarget };

    /* ---------- 3. PERFORMANCE LONG TERME ---------- */
    const env = I.enveloppes || [];
    const dyn = S.profils.dynamique;
    const investis = env.filter(e => e.type !== 'PER').map(e => {
      const ecart = Math.max(0, dyn - num(e.performance));
      const manque = Math.round(num(e.montant) * ecart / 100);
      return { ...e, montant: num(e.montant), perf: num(e.performance), ecart, manque, ownerName: ownerName(e.owner) };
    });
    const perfMontant = investis.reduce((s, e) => s + e.montant, 0);
    const perfLeak = investis.reduce((s, e) => s + e.manque, 0);
    const perf = { investis, montant: perfMontant, leak: perfLeak, dynamique: dyn };

    /* ---------- 4. OPTIMISATION PER ---------- */
    const pers = env.filter(e => e.type === 'PER');
    const perVerse = pers.reduce((s, e) => s + num(e.perVerseAnnuel), 0);
    const perCapital = pers.reduce((s, e) => s + num(e.montant), 0);
    const perPlafond = Math.min(num(P.revenuFoyer) * S.per.tauxPlafond / 100, S.per.plafondMax);
    const perGap = Math.max(0, perPlafond - perVerse);
    const perLeak = Math.round(perGap * P.tmi);
    const per = { plafond: perPlafond, verse: perVerse, gap: perGap, leak: perLeak, capital: perCapital,
      tmi: P.tmi, count: pers.length };

    /* ---------- AVANTAGES FISCAUX QUALITATIFS (bilan) ---------- */
    const abattement = couple ? S.fiscal.abattementAVCouple : S.fiscal.abattementAVSeul;
    const avAnciens = avList.filter(c => num(c.anciennete) >= 8);
    const peaMurs = env.filter(e => e.type === 'PEA' && num(e.anciennete) >= 5);
    const fiscalNotes = {
      abattement, avEligible: avAnciens.length > 0,
      peaEligible: peaMurs.length > 0,
      avAbattementGain: avAnciens.length > 0 ? Math.round(abattement * S.fiscal.pfuIR / 100) : 0,
    };

    /* ---------- AGRÉGATION DES 4 FUITES ---------- */
    const M = window.LEAK_META;
    const amounts = { dormant: dormantLeak, fees: avRecovered, perf: perfLeak, per: perLeak };
    const maxA = Math.max(1, ...Object.values(amounts));
    const leaks = ['dormant', 'fees', 'perf', 'per'].map(id => ({
      id, ...M[id], amount: amounts[id], pct: Math.round((amounts[id] / maxA) * 100),
    }));
    const leakPerYear = Object.values(amounts).reduce((s, x) => s + x, 0);
    const fv = (Math.pow(1 + cible / 100, 10) - 1) / (cible / 100);
    const over10 = Math.round(leakPerYear * fv);

    /* ---------- PATRIMOINE & PROJECTION ---------- */
    const envTotal = env.reduce((s, e) => s + num(e.montant), 0);
    const patrimoine = liquidites + avEncours + envTotal;
    const patrimoineInvesti = avEncours + envTotal; // hors livrets / épargne dormante

    /* ---------- PERFORMANCE ACTUELLE MOYENNE (auto, sur patrimoine investi) ----------
       AV → rendement fonds euros de référence ; enveloppes investies → performance saisie ;
       PER → rendement fonds euros par défaut (pas de champ performance). */
    const fondsEuros = (() => { const f = S.livrets.find(l => /fonds euros/i.test(l.name)); return f ? f.taux : 2.6; })();
    let perfPond = 0;
    avContrats.forEach(c => { perfPond += c.encours * fondsEuros; });
    env.forEach(e => {
      const r = e.type === 'PER' ? fondsEuros : num(e.performance);
      perfPond += num(e.montant) * r;
    });
    const perfActuelle = patrimoineInvesti > 0 ? perfPond / patrimoineInvesti : S.profils.actuelMoyen;

    /* ---------- VERSEMENTS MENSUELS (contrôle de cohérence) ---------- */
    const versAv = avList.reduce((s, c) => s + num(c.versementMensuel), 0);
    const versEnv = env.reduce((s, e) => s + (e.type === 'PER' ? num(e.perVerseAnnuel) / 12 : num(e.versementMensuel)), 0);
    const versementsMensuels = versEpargne + versAv + versEnv;
    const capacite = num(P.capaciteMensuelle);
    const versements = {
      total: versementsMensuels, capacite,
      ecart: versementsMensuels - capacite,
      coherent: Math.abs(versementsMensuels - capacite) <= 1 || capacite === 0,
      epargne: versEpargne, av: versAv, env: versEnv,
    };
    const y0 = new Date().getFullYear();
    const rA = S.profils.actuelMoyen / 100, rO = S.profils.optimiseMoyen / 100;
    const N = S.projection.annees;
    const current = [], optimized = [];
    for (let i = 0; i <= N; i++) {
      current.push(Math.round(patrimoine * Math.pow(1 + rA, i)));
      optimized.push(Math.round(patrimoine * Math.pow(1 + rO, i)));
    }
    const labels = [0, 1, 2, 3].map(k => String(y0 + Math.round(k * N / 3)));
    const projection = { current, optimized, labels, years: N, rActuel: S.profils.actuelMoyen, rOptimise: S.profils.optimiseMoyen };

    return {
      couple, ownerName,
      prospect: {
        name: couple ? `${P.p1Nom || 'Prospect 1'} & ${P.p2Nom || 'Prospect 2'}` : (P.p1Nom || 'Prospect'),
        situation: P.situation, ageP1: P.age, patrimoine,
      },
      totals: { leakPerYear, over10 },
      leaks, dormant, av, perf, per, fiscalNotes, projection, patrimoine, patrimoineInvesti,
      perfActuelle, versements, profilInvest, profilRate: cible, settings: S,
    };
  }

  window.computeAudit = computeAudit;
})();
