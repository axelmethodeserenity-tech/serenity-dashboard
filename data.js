/* ===== Serenity Dashboard — inputs par défaut + barèmes éditables ===== */
(function () {
  let _id = 0; const uid = (p) => p + '_' + (++_id);

  /* ---------------- DONNÉES PROSPECT (vierges — on part de zéro) ---------------- */
  window.DEFAULT_INPUTS = {
    profile: {
      situation: 'seul',
      p1Nom: '', p1Age: 0,
      p2Nom: '', p2Age: 0,
      revenuFoyer: 0,
      depensesMensuelles: 0,
      precautionSouhaitee: 0,    // épargne de précaution choisie par le foyer (€)
      tmi: 0.30,
      capaciteMensuelle: 0,
      profilInvest: 'equilibre',  // prudent | equilibre | dynamique | offensif (foyer)
    },
    epargne: [],
    assuranceVie: [],
    enveloppes: [],
  };

  /* ---------------- BARÈMES / PARAMÈTRES (éditables, persistés) ----------------
     Taux à jour février 2026. Modifiables dans l'onglet Paramètres. */
  window.DEFAULT_SETTINGS = {
    livrets: [
      { id: uid('lv'), name: 'Livret A', taux: 1.5, plafond: 22950 },
      { id: uid('lv'), name: 'LDDS', taux: 1.5, plafond: 12000 },
      { id: uid('lv'), name: 'LEP', taux: 2.5, plafond: 10000 },
      { id: uid('lv'), name: 'CEL', taux: 1.0, plafond: 15300 },
      { id: uid('lv'), name: 'Livret Jeune', taux: 1.5, plafond: 1600 },
      { id: uid('lv'), name: 'PEL', taux: 2.0, plafond: 61200 },
      { id: uid('lv'), name: 'Fonds euros (AV)', taux: 2.6, plafond: 0 },
      { id: uid('lv'), name: 'Compte courant', taux: 0, plafond: 0 },
      { id: uid('lv'), name: 'Autre liquidité', taux: 0, plafond: 0 },
    ],
    profils: {
      equilibre: 4.5,    // épargne réinvestie sur profil équilibré
      dynamique: 7.5,    // long terme (PEA / actions)
      actuelMoyen: 2.8,  // rendement moyen actuel estimé du patrimoine investi
      optimiseMoyen: 6.0,// trajectoire optimisée globale (projection)
    },
    projProfils: { prudent: 3.0, equilibre: 5.5, dynamique: 7.5, offensif: 10.0 },
    projHorizons: [5, 10, 15, 20, 25, 30],
    av: { fraisGestionUCCible: 0.5, fraisGestionFECible: 0.6, fraisUCCible: 0.3, fraisVersementCible: 0 },
    per: { tauxPlafond: 10, plafondMax: 35194 }, // % des revenus · plafond PASS 2025
    fiscal: { pfuIR: 12.8, prelevementsSociaux: 17.2, abattementAVSeul: 4600, abattementAVCouple: 9200 },
    precaution: { moisMin: 3, moisMax: 6 },
    over10ans: 10, // horizon du « manque à gagner cumulé » affiché en synthèse
  };

  // produits disponibles dans la saisie
  window.PRODUITS_EPARGNE = ['Livret A', 'LDDS', 'LEP', 'CEL', 'Livret Jeune', 'PEL', 'Compte courant', 'Autre liquidité'];
  // livrets réglementés : un seul par personne
  window.LIVRETS_UNIQUES = ['Livret A', 'LDDS', 'LEP', 'CEL', 'Livret Jeune', 'PEL'];
  window.TYPES_ENVELOPPE = ['PEA', 'Compte-titres (CTO)', 'PER', "Plan épargne entreprise (PEE)"];

  window.newEpargne = () => ({ id: uid('ep'), owner: 'p1', type: 'Livret A', montant: 0, taux: 1.5, versementMensuel: 0 });
  window.newAv = () => ({ id: uid('av'), owner: 'p1', libelle: 'Contrat', encours: 0, fraisGestionUC: 0.8, fraisGestionFE: 0.6, fraisUC: 1.2, fraisVersement: 0, versementMensuel: 0, anciennete: 0 });
  window.newEnveloppe = () => ({ id: uid('en'), owner: 'p1', type: 'PEA', montant: 0, anciennete: 0, performance: 0, versementMensuel: 0, perVerseAnnuel: 0 });
  window.newLivret = () => ({ id: uid('lv'), name: 'Nouveau produit', taux: 0, plafond: 0 });

  /* Métadonnées d'affichage des 4 fuites */
  window.LEAK_META = {
    dormant: { name: 'Épargne dormante', sub: "Coût d'opportunité", short: 'Dormante',
      color: 'var(--leak)', soft: 'var(--leak-soft)', stroke: '#E8A24D', icon: 'wallet' },
    fees: { name: 'Frais assurance-vie', sub: 'Frais récupérables', short: 'Frais AV',
      color: 'var(--danger)', soft: 'var(--danger-soft)', stroke: '#EC6A56', icon: 'shield' },
    perf: { name: 'Performance long terme', sub: 'Écart vs profil dynamique', short: 'Performance',
      color: 'var(--azure)', soft: 'var(--azure-soft)', stroke: '#5AA2F5', icon: 'trending-up' },
    per: { name: 'Optimisation PER', sub: "Économie d'impôt annuelle", short: 'PER',
      color: 'var(--accent)', soft: 'var(--gain-soft)', stroke: '#3FDBC2', icon: 'landmark' },
  };

  window.fmt = (n) => Math.round(n || 0).toLocaleString('fr-FR').replace(/\u00A0/g, ' ');
  window.eur = (n) => window.fmt(n) + ' €';
  window.pct = (n) => (n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' %';
  window.r2 = (n) => (n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // "0,70"
})();
