module.exports = function(services) {
  const router = require('express').Router();
  const db = services.db;
  const crypto = require('crypto');

  const CONDITIONS = {
    soleil: { nom: 'Beau en maudit', accent: '#e8720c', verdicts: ["Sors ton char, y fait beau rare", "Un temps parfait pour s'écraser su'l patio", "Le soleil fesse fort, mets d'la crème", "Beau à te faire brailler de joie, mon tabarnouche", "Enweye dehors, la vitamine D t'attend", "Y fait tellement beau que même ton boss sourit", "Un ciel bleu à te réconcilier avec l'existence"] },
    nuit: { nom: "Beau clair d'étoiles", accent: '#3f4d9b', verdicts: ["Une nuitte claire à compter les étoiles", "Le ciel s'est mis su'son trente-six", "Pas un nuage, juste toé pis la Voie lactée", "Sors la doudou, la veillée va être longue", "Un ciel propre comme un char neuf", "La lune fait du zèle à soir", "Beau à veiller su'l perron passé minuit"] },
    nuageux:{ nom: 'Gris comme un lundi', accent: '#5e7387', verdicts: ["Le ciel file un mauvais coton", "Pas laid, pas beau — juste plate", "Un temps parfait pour rester en mou", "Gris comme le moral d'un lundi de février", "Le soleil a callé malade aujourd'hui", "Un ciel couleur béton d'autoroute 15", "Ni chair ni poisson, comme un mardi ordinaire"] },
    pluie: { nom: 'Y mouille à siaux', accent: '#2e7dd1', verdicts: ["Sors le parapluie pis le canot", "Y tombe des clous, reste en d'dans", "Une vraie journée de canard", "Y mouille tellement que les poissons chialent", "Garroche tes plans dehors à' poubelle", "Le bon Dieu a pesé su'l mauvais piton", "Apporte tes bottes, ça pisse pour vrai"] },
    orage: { nom: "Ça brasse dans l'cabanon", accent: '#7c5ce0', verdicts: ["Débranche tes affaires, ça va péter", "Le bon Dieu déménage ses meubles", "Rentre le trampoline du voisin", "Ça gronde comme mononcle après trois bières", "Cache-toé, le ciel est en tabarnak", "Un show de lumière gratis, mais reste pas dessous", "Attache tout c'qui vole, ça va brasser en maudit"] },
    neige: { nom: 'Y neige en pas pour rire', accent: '#4a90c4', verdicts: ["Sors ta pelle, mon chum", "Une bordée à pu retrouver ton char", "Le gars du déneigement va faire la piastre", "Y neige comme si le ciel avait crevé son oreiller", "Prépare-toé à pelleter jusqu'à Pâques", "Ton entrée vient de disparaître, bonne chance", "Une bordée de bonne femme, pis c'est pas fini"] },
    verglas: { nom: 'Une vraie patinoire', accent: '#2a9db5', verdicts: ["Marche comme un pingouin, ça glisse", "Reste chez vous, c'est du vrai verglas", "Les patins iraient mieux que le char", "Chaque marche est un pari su'ta vie", "Le trottoir est plus lisse qu'une patinoire du Forum", "Tiens-toé après tout, même après le chien", "Tabarouette, même les corneilles tombent su'l cul"] },
    brouillard: { nom: "Épais comme d'la soupe aux pois", accent: '#6e7c85', verdicts: ["On voit pas le boutte de son nez", "Allume tes lumières, ça presse", "La montagne a mis sa doudou", "Épais à couper au couteau à steak", "Ton GPS lui-même est perdu", "Le brouillard a mangé le village au complet", "On dirait que quelqu'un a échappé un pot de ouate"] },
    canicule: { nom: "Chaud à faire fondre l'asphalte", accent: '#e23d2e', verdicts: ["Colle-toé su'l air climatisé", "Un temps à boire sa piscine", "Y fait chaud à faire suer les mouches", "L'asphalte fond, pis tes semelles avec", "Même le popsicle a chaud", "Un humidex à faire brailler un cactus", "Chaud à cuire un oeuf su'l capot du char"] },
    frette: { nom: 'Frette en tabarouette', accent: '#1e6fa8', verdicts: ["Habille-toé, on gèle tout rond", "Un frette à fendre les clôtures", "Les sourcils te givrent en deux minutes", "Frette à te geler les idées noires", "Ton char va faire semblant de pas te connaître", "Un frette de canard, pis l'canard est parti dans l'Sud", "Mets deux paires de bas, pis prie"] }
  };
  const conditionsMeta = {};
  Object.keys(CONDITIONS).forEach(function(k){ conditionsMeta[k] = { nom: CONDITIONS[k].nom, accent: CONDITIONS[k].accent, verdicts: CONDITIONS[k].verdicts }; });
  const LISTE_CONDITIONS = Object.keys(CONDITIONS);

  const AD = 'Bold flat cartoon illustration with thick black ink outlines, saturated comic-book colors, bright light, hard shadows, exaggerated Quebecois caricature humor, Laurentians mountain village scenery. No text, no logos.';
  const SCENES = {
    soleil: 'A gleeful Quebecer lounging in an inflatable kiddie pool on his porch under an enormous grinning sun, sunglasses on the dog too',
    nuit: 'A crystal-clear starry night over a sleeping village, giant glowing full moon, the Milky Way splashed across the sky, a couple wrapped in plaid blankets stargazing from lawn chairs on their porch, a raccoon on the roof pointing at a shooting star',
    nuageux: 'A whole village street looking bored under one giant flat grey cloud, a man shrugging with his coffee mug on his balcony',
    pluie: 'Rain falling in literal buckets over a village main street, a man calmly paddling a canoe down the flooded road past parked cars',
    orage: 'A dramatic purple thunderstorm over a backyard, lightning bolts everywhere, a panicked man sprinting while carrying his barbecue to safety',
    neige: 'An absurdly massive snowfall burying colorful wooden houses up to the chimneys, a tiny man with a shovel facing a snowbank three times taller than him',
    verglas: 'An entire village street turned into a glossy skating rink, a mailman gliding on skates past cars sliding sideways, everything coated in shiny ice',
    brouillard: 'Fog thick as pea soup swallowing a village, only rooftops and one confused moose head poking above the fog layer',
    canicule: 'A scorching heatwave melting the asphalt into goo, a man frying an egg on the sidewalk while a sad snowman melts into a puddle beside him',
    frette: 'An extreme cold snap, a man frozen solid mid-step at a bus stop with icicles on his moustache, a giant thermometer burst at the bottom'
  };

  const T = {
    nav_accueil: 'Accueil', nav_carte: 'La carte', nav_dico: 'Le dictionnaire', nav_chroniques: 'Chroniques', nav_partage: 'Partage ta marde',
    hero_en_direct: 'En direct de', btn_voir_carte: 'Voir la carte des microclimats',
    sec_villages: 'La météo, coin par coin', sec_villages_sous: "Des Laurentides jusqu'à Montréal, chaque coin a sa marde bien à lui. Données en direct, microclimats vérifiés à l'oeil pis au thermomètre.",
    sec_dico: 'Le dictionnaire de la marde', sec_dico_sous: "Parle météo comme du vrai monde d'icitte.",
    sec_chroniques: 'Les dernières chroniques',
    btn_voir_dico: 'Tout le dictionnaire', btn_voir_chroniques: 'Toutes les chroniques',
    essaie_modes: 'Essaie les humeurs du ciel — le site change de couleur avec la météo',
    vent: 'Vent', humidite: 'Humidité', rafales: 'Rafales', ressenti: 'Ressenti', altitude: 'Altitude',
    prevision_7: 'Les 7 prochains jours', topo_titre: 'Le topo du coin',
    signalements_titre: 'Le monde du coin rapporte', signaler_titre: 'Signale ta marde',
    form_nom: 'Ton nom (ou ton surnom)', form_message: "Qu'est-ce qui se passe dehors chez vous ?", form_condition: "C'est quoi le portrait ?",
    form_email: 'Ton courriel', form_email_note: "Juste pour confirmer que c'est ben toé — on le publie pas, pis on t'enverra pas de niaisage.",
    btn_signaler: 'Envoyer mon signalement', signal_merci: "Presque fini ! Va checker tes courriels : on t'a envoyé un lien magique pour confirmer ton signalement. Après ça, le boss l'approuve pis ta marde s'affiche.",
    confirme_ok_titre: "C'est confirmé, mon chum !", confirme_ok_texte: "Ton courriel est bon pis ta marde est rendue dans la file du boss. Dès qu'y l'approuve, ton signalement s'affiche sur la page de ton coin.",
    confirme_deja_titre: 'Déjà confirmé !', confirme_deja_texte: "Ce lien-là a déjà fait sa job : ton signalement est déjà dans la file d'approbation. Lâche le bouton, tout est beau.",
    confirme_echec_titre: 'Ouin. Ce lien-là marche pu.', confirme_echec_texte: "Le lien est expiré ou ben pas bon. C'est plate, mais re-signaler ta marde prend trente secondes — pis cette fois-là, niaise pas avant de cliquer sur le lien.",
    confirme_retour: "Retour à l'accueil", confirme_village: 'Voir mon coin',
    confirme_attente_titre: 'Une dernière pesée de bouton', confirme_attente_texte: "Pèse su'l gros bouton pour confirmer que c'est ben toé qui as signalé ça. C'est toute — après, ta marde s'en va dans la file du boss.",
    btn_confirmer: "Je confirme, envoye !",
    liasse_texte: "Ce site-là a été bâti au grand complet avec Liasse — pas une ligne de code tapée à' mitaine. T'as une idée de projet ? Décris-la, pis a se met en ligne quasiment tu-seule. N'importe qui peut bâtir un site de même, toé avec.",
    liasse_cta: 'Bâtis ton propre beau projet icitte',
    liasse_pied: 'Ce site-là roule sur Liasse — n’importe qui peut bâtir un beau projet de même.',
    liasse_pied_cta: 'Bâtis le tien',
    empty_villages: 'Pas encore de villages dans la liste. Reviens tantôt !', empty_expressions: 'Le dictionnaire se remplit bientôt, promis.', empty_posts: "Pas de chronique pour l'instant. Le chroniqueur pellette encore sa cour.", empty_signalements: 'Personne a encore chialé icitte. Sois le premier !',
    partage_titre: 'Partage ta marde', partage_choix_village: 'Ton coin', partage_choix_condition: 'La marde en cours',
    btn_generer: 'Génère ma carte de marde', btn_partager: 'Partager', btn_telecharger: 'Télécharger', generation_attente: "Deux secondes, l'artiste dessine...",
    carte_titre: 'La carte des microclimats', btn_relief: 'Vue relief', btn_plan: 'Vue plan', voir_coin: 'Voir le coin',
    footer_alertes: 'Alerte-moé quand y fait marde', footer_naviguer: 'Naviguer', footer_rejoindre: 'Nous rejoindre',
    meteo_indispo: 'La station niaise, réessaie tantôt.', retour: 'Retour', publie_le: 'Publié le'
  };

  function formatDate(d) { try { return new Date(d).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }
  function verdictDuJour(cond) { const c = CONDITIONS[cond] || CONDITIONS.nuageux; return c.verdicts[Math.floor(Date.now() / 86400000) % c.verdicts.length]; }
  function surchauffeOuFrette(c, temp) {
    if (c === 'soleil' || c === 'nuageux' || c === 'nuit') { if (temp >= 28) c = 'canicule'; else if (temp <= -15) c = 'frette'; }
    return c;
  }
  function wmoToCondition(code, temp, isDay) {
    var c;
    if ([95, 96, 99].indexOf(code) >= 0) c = 'orage';
    else if ([71, 73, 75, 77, 85, 86].indexOf(code) >= 0) c = 'neige';
    else if ([66, 67].indexOf(code) >= 0) c = 'verglas';
    else if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].indexOf(code) >= 0) c = 'pluie';
    else if ([45, 48].indexOf(code) >= 0) c = 'brouillard';
    else if (code === 2 || code === 3) c = 'nuageux';
    else c = 'soleil';
    if (c === 'soleil' && isDay === 0) c = 'nuit';
    return surchauffeOuFrette(c, temp);
  }
  function jourCourt(d) { try { return new Date(d + 'T12:00:00').toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric' }); } catch (e) { return String(d); } }

  // Deux fournisseurs, même forme de sortie. daily est normalisé :
  // [{ jour, max, min, cond }] — prêt pour les tuiles de prévisions.
  async function getMeteoOpenMeteo(v) {
    const r = await services.fetch('https://api.open-meteo.com/v1/forecast?latitude=' + v.lat + '&longitude=' + v.lng + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FToronto&forecast_days=7', { signal: AbortSignal.timeout(4000) });
    const j = await r.json();
    if (!r.ok || !j.current) throw new Error('station indisponible');
    const c = j.current;
    if (![c.temperature_2m, c.apparent_temperature, c.relative_humidity_2m, c.wind_speed_10m, c.wind_gusts_10m, c.weather_code, c.is_day].every(Number.isFinite)) throw new Error('données incomplètes');
    let daily = [];
    if (j.daily && Array.isArray(j.daily.time)) {
      daily = j.daily.time.map(function(d, i) {
        const dd = j.daily;
        const max = dd.temperature_2m_max && dd.temperature_2m_max[i];
        const min = dd.temperature_2m_min && dd.temperature_2m_min[i];
        const code = dd.weather_code && dd.weather_code[i];
        if (!d || !Number.isFinite(max) || !Number.isFinite(min) || !Number.isFinite(code)) return null;
        return { jour: jourCourt(d), max: Math.round(max), min: Math.round(min), cond: wmoToCondition(code, max) };
      }).filter(Boolean);
    }
    return { ok: true, temp: Math.round(c.temperature_2m), ressenti: Math.round(c.apparent_temperature), humidite: Math.round(c.relative_humidity_2m), vent: Math.round(c.wind_speed_10m), rafales: Math.round(c.wind_gusts_10m), condition: wmoToCondition(c.weather_code, c.temperature_2m, c.is_day), daily: daily };
  }

  // Repli : ECCC citypage weather (GeoJSON), données du gouvernement du Canada.
  // Licence ECCC : usage commercial permis avec attribution (voir pied de page).
  const ECCC_API = 'https://api.weather.gc.ca/collections/citypageweather-realtime/items';
  const ECCC_ENTETES = { 'User-Agent': 'meteo-de-marde/1.0 (meteodmarde.com)' };
  // Sites vérifiés à la main — les coordonnées des sites ECCC sont trop
  // imprécises pour un appariement au plus proche fiable sur les 13 coins.
  const ECCC_SITES = { 'saint-sauveur': 'qc-c3', 'morin-heights': 'qc-c3', 'mont-tremblant': 'qc-167', 'saint-donat': 'qc-167', 'val-david': 'qc-33', 'sainte-agathe': 'qc-33', 'saint-jerome': 'qc-13', 'blainville': 'qc-52', 'sainte-therese': 'qc-b3', 'saint-eustache': 'qc-b4', 'terrebonne': 'qc-c7', 'laval': 'qc-76', 'montreal': 'qc-147' };
  const ECCC_ICONES = { 0: 'soleil', 1: 'soleil', 2: 'nuageux', 3: 'nuageux', 4: 'nuageux', 5: 'soleil', 6: 'pluie', 7: 'pluie', 8: 'neige', 9: 'orage', 10: 'nuageux', 11: 'pluie', 12: 'pluie', 13: 'pluie', 14: 'verglas', 15: 'pluie', 16: 'neige', 17: 'neige', 18: 'neige', 19: 'orage', 20: 'brouillard', 21: 'brouillard', 22: 'nuageux', 23: 'brouillard', 24: 'brouillard', 25: 'neige', 26: 'neige', 27: 'verglas', 28: 'pluie', 30: 'nuit', 31: 'nuit', 32: 'nuageux', 33: 'nuageux', 34: 'nuageux', 35: 'nuit', 36: 'pluie', 37: 'pluie', 38: 'neige', 39: 'orage', 40: 'neige', 41: 'orage', 42: 'orage', 43: 'nuageux', 44: 'brouillard', 45: 'brouillard', 46: 'orage', 47: 'orage', 48: 'orage' };
  function champEn(x) { return (x && typeof x === 'object') ? (x.en != null ? x.en : x.fr) : x; }
  function valEccc(x) { if (!x) return null; const n = Number(champEn(x.value != null ? x.value : x)); return Number.isFinite(n) ? n : null; }

  const ecccSiteMemo = {};
  async function resoudreSiteEccc(v) {
    const cle = v.slug + '|' + v.lat + '|' + v.lng;
    if (ecccSiteMemo[cle]) return ecccSiteMemo[cle];
    const lat = Number(v.lat), lng = Number(v.lng);
    const bbox = (lng - 0.4) + ',' + (lat - 0.4) + ',' + (lng + 0.4) + ',' + (lat + 0.4);
    const r = await services.fetch(ECCC_API + '?bbox=' + bbox + '&f=json&limit=50', { signal: AbortSignal.timeout(4000), headers: ECCC_ENTETES });
    const j = await r.json();
    let meilleur = null;
    ((j && j.features) || []).forEach(function(f) {
      const co = f.geometry && f.geometry.coordinates;
      if (!co || !f.id) return;
      const d = Math.pow(co[1] - lat, 2) + Math.pow(co[0] - lng, 2);
      if (!meilleur || d < meilleur.d) meilleur = { d: d, id: f.id };
    });
    if (!meilleur) throw new Error('aucun site ECCC dans le coin');
    ecccSiteMemo[cle] = meilleur.id;
    return meilleur.id;
  }

  async function getMeteoEccc(v) {
    const site = ECCC_SITES[v.slug] || await resoudreSiteEccc(v);
    const r = await services.fetch(ECCC_API + '/' + site + '?f=json', { signal: AbortSignal.timeout(4000), headers: ECCC_ENTETES });
    const j = await r.json();
    const p = j && j.properties;
    if (!r.ok || !p || !p.currentConditions) throw new Error('citypage indisponible');
    const cc = p.currentConditions;
    const temp = valEccc(cc.temperature);
    if (temp == null) throw new Error('observation incomplète');
    // ECCC laisse traîner des champs périmés (windChill à -3 en juillet) :
    // humidex seulement s'il fait chaud, refroidissement éolien seulement s'il fait frette.
    const humidex = valEccc(cc.humidex), frissons = valEccc(cc.windChill);
    const ressenti = (temp >= 20 && humidex != null) ? humidex : ((temp <= 5 && frissons != null) ? frissons : temp);
    const humidite = valEccc(cc.relativeHumidity);
    const vent = valEccc(cc.wind && cc.wind.speed);
    const rafales = valEccc(cc.wind && cc.wind.gust);
    const cond = surchauffeOuFrette(ECCC_ICONES[Number(cc.iconCode && cc.iconCode.value)] || 'nuageux', temp);
    const daily = [];
    const periodes = (p.forecastGroup && p.forecastGroup.forecasts) || [];
    for (let i = 0; i < periodes.length; i++) {
      const tp = periodes[i].temperatures && periodes[i].temperatures.temperature && periodes[i].temperatures.temperature[0];
      if (!tp || champEn(tp['class']) !== 'high') continue;
      const max = valEccc(tp);
      const ts = periodes[i + 1] && periodes[i + 1].temperatures && periodes[i + 1].temperatures.temperature && periodes[i + 1].temperatures.temperature[0];
      const min = (ts && champEn(ts['class']) === 'low') ? valEccc(ts) : null;
      const af = periodes[i].abbreviatedForecast || {};
      const icone = af.icon ? Number(af.icon.value) : (af.iconCode ? Number(af.iconCode.value) : NaN);
      const nom = periodes[i].period && periodes[i].period.textForecastName && (periodes[i].period.textForecastName.fr || periodes[i].period.textForecastName.en);
      if (max == null || !nom) continue;
      daily.push({ jour: nom, max: Math.round(max), min: min != null ? Math.round(min) : null, cond: surchauffeOuFrette(ECCC_ICONES[icone] || 'nuageux', max) });
    }
    return { ok: true, temp: Math.round(temp), ressenti: Math.round(ressenti), humidite: humidite != null ? Math.round(humidite) : null, vent: vent != null ? Math.round(vent) : null, rafales: rafales != null ? Math.round(rafales) : (vent != null ? Math.round(vent) : null), condition: cond, daily: daily };
  }

  const meteoCache = {};
  const meteoEnVol = {};
  async function getMeteo(v) {
    const cle = 'v' + v.id;
    const now = Date.now();
    const hit = meteoCache[cle];
    if (hit && now - hit.ts < (hit.data.ok ? 600000 : 60000)) return hit.data;
    if (meteoEnVol[cle]) return meteoEnVol[cle];
    meteoEnVol[cle] = (async function() {
      let data = null;
      try { data = await getMeteoOpenMeteo(v); }
      catch (e) { try { data = await getMeteoEccc(v); } catch (e2) {} }
      if (!data) data = { ok: false, temp: null, ressenti: null, humidite: null, vent: null, rafales: null, condition: 'nuageux', daily: null };
      meteoCache[cle] = { ts: Date.now(), data: data };
      return data;
    })();
    try { return await meteoEnVol[cle]; } finally { delete meteoEnVol[cle]; }
  }

  async function getSettings() { try { const rows = await db.all('SELECT key, value FROM admin_settings'); const s = {}; rows.forEach(function(r){ s[r.key] = r.value; }); return s; } catch (e) { return {}; } }
  function applyTextOverrides(t, settings) { for (var k in settings) { if (k.indexOf('text_') === 0 && k.slice(-3) === '_fr') { var tk = k.slice(5, -3); if (tk) t[tk] = settings[k]; } } return t; }
  async function baseLocals(extra) { const settings = await getSettings(); const t = applyTextOverrides(Object.assign({}, T), settings); return Object.assign({ settings: settings, t: t, conditionsMeta: conditionsMeta, googleApiKey: services.google.mapsApiKey, formatDate: formatDate }, extra || {}); }
  function localsSecours(extra) { return Object.assign({ settings: {}, t: Object.assign({}, T), conditionsMeta: conditionsMeta, googleApiKey: services.google.mapsApiKey, formatDate: formatDate }, extra || {}); }
  async function conditionRegionale() { try { const v = await db.get('SELECT * FROM villages ORDER BY ordre, id LIMIT 1'); if (!v) return 'nuageux'; const m = await getMeteo(v); return m.ok ? m.condition : 'nuageux'; } catch (e) { return 'nuageux'; } }

  // --- Confirmation courriel des signalements ---------------------------------
  function courrielValide(e) { return typeof e === 'string' && e.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }
  function echap(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function urlSite(settings) { return String((settings && settings.site_url) || 'https://meteodmarde.com').replace(/\/+$/, ''); }
  const LOGO_COURRIEL = 'https://res.cloudinary.com/duhp69meg/image/upload/v1783041536/tapavis_tenant_mereo-de-marde/icon_mereo-de-marde_1783041536175.png';
  const HEROS_COURRIEL = 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039813/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813099.png';

  // Le courriel de confirmation : même ton que le site, zéro langue de bois.
  // Tout ce qui vient du public (nom, message, village) passe par echap().
  function courrielConfirmationHtml(o) {
    const c = CONDITIONS[o.condition] || CONDITIONS.nuageux;
    const settings = o.settings || {};
    const heros = settings._p_hero_image_url || HEROS_COURRIEL;
    const logo = settings._p_nav_logo_url || LOGO_COURRIEL;
    const site = urlSite(settings);
    const nomSite = settings.business_name || "Météo d'marde";
    const gras = "font-family:'Paytone One','Arial Black',Arial,sans-serif;";
    return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>' +
      '<body style="margin:0;padding:0;background-color:#eef2f6;font-family:Figtree,Arial,sans-serif;color:#22303d;">' +
      '<div style="display:none;max-height:0;overflow:hidden;">Confirme ton courriel pis ta marde s\'en va dans la file du boss.</div>' +
      '<div style="max-width:600px;margin:0 auto;padding:24px 12px;">' +
      '<div style="background:#22303d;border-radius:18px 18px 0 0;padding:18px 24px;text-align:left;">' +
      '<img src="' + echap(logo) + '" alt="' + echap(nomSite) + '" width="44" height="44" style="border-radius:12px;vertical-align:middle;border:0;">' +
      '<span style="' + gras + 'color:#ffffff;font-size:20px;vertical-align:middle;padding-left:12px;">' + echap(nomSite) + '</span>' +
      '</div>' +
      '<img src="' + echap(heros) + '" alt="Les Laurentides dans toute leur splendeur douteuse" width="576" style="width:100%;display:block;border:0;background:#dfe7ee;">' +
      '<div style="background:#ffffff;border-radius:0 0 18px 18px;padding:30px 28px 26px;border:3px solid #22303d;border-top:0;">' +
      '<span style="display:inline-block;background:' + c.accent + ';color:#ffffff;font-weight:800;font-size:13px;border-radius:10px;padding:4px 12px;margin-bottom:14px;">' + echap(c.nom) + '</span>' +
      '<h1 style="' + gras + 'font-size:30px;line-height:1.15;margin:0 0 14px;color:#22303d;">Confirme ta marde !</h1>' +
      '<p style="font-size:16px;line-height:1.6;margin:0 0 6px;">Salut <strong>' + echap(o.nom) + '</strong> !</p>' +
      '<p style="font-size:16px;line-height:1.6;margin:0 0 16px;">T\'as signalé ça' + (o.villageNom ? ' à <strong>' + echap(o.villageNom) + '</strong>' : '') + ' :</p>' +
      '<div style="background:#eef2f6;border-left:5px solid ' + c.accent + ';border-radius:10px;padding:14px 16px;font-size:15px;line-height:1.55;margin:0 0 22px;font-style:italic;">« ' + echap(o.message) + ' »</div>' +
      '<p style="font-size:16px;line-height:1.6;margin:0 0 22px;">Pèse su\'l bouton pour ouvrir la page de confirmation — un dernier bouton là-bas, pis ton signalement s\'en va dans la file du boss :</p>' +
      '<div style="text-align:center;margin:0 0 24px;">' +
      '<a href="' + echap(o.lien) + '" style="' + gras + 'display:inline-block;background:' + c.accent + ';color:#ffffff;text-decoration:none;font-size:18px;padding:15px 30px;border-radius:14px;border:3px solid #22303d;">Je confirme mon courriel</a>' +
      '</div>' +
      '<p style="font-size:13px;line-height:1.6;color:#5e7387;margin:0 0 8px;">Le bouton marche pas ? Copie ce lien-là dans ton navigateur :<br><a href="' + echap(o.lien) + '" style="color:#2e7dd1;word-break:break-all;">' + echap(o.lien) + '</a></p>' +
      '<p style="font-size:13px;line-height:1.6;color:#5e7387;margin:0;">Ce lien-là est bon 48 heures — après ça, y vire en citrouille. Si t\'as jamais rien signalé su\' ' + echap(nomSite) + ', ignore ce courriel-là pis continue ta journée.</p>' +
      '</div>' +
      '<div style="text-align:center;padding:22px 16px 6px;font-size:13px;color:#5e7387;line-height:1.7;">' +
      '<a href="' + echap(site) + '" style="color:#22303d;font-weight:800;text-decoration:none;">' + echap(site.replace(/^https?:\/\//, '')) + '</a><br>' +
      'Ce site-là a été bâti au grand complet avec <strong>Liasse</strong> — n\'importe qui peut bâtir un beau projet de même.<br>' +
      '<a href="https://liasse.tech" style="color:#2e7dd1;font-weight:700;">Bâtis ton propre beau projet icitte &rarr; liasse.tech</a>' +
      '</div>' +
      '</div></body></html>';
  }

  const MODULES = [
    { key: 'posts', label: 'Chroniques', icon: 'edit', fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, maxLength: 200, description: "Le titre affiché dans la liste des chroniques et en haut de l'article.", placeholder: 'p. ex. Guide de survie de la première bordée' },
      { name: 'content', label: 'Contenu', type: 'textarea', description: 'Le texte complet de la chronique. Sépare tes paragraphes par une ligne vide.', placeholder: 'Écris ta chronique icitte...' },
      { name: 'image_url', label: 'Image', type: 'image', description: "Image d'en-tête de la chronique. Recommandé : 1200×900 px (paysage)." },
      { name: 'category', label: 'Catégorie', type: 'select', options: ['Bulletin', 'Chialage', 'Conseils', 'Saison'], description: 'Sert à classer les chroniques sur le site.' },
      { name: 'published', label: 'Publiée', type: 'boolean', default: true, description: 'Décoche pour garder la chronique en brouillon, invisible aux visiteurs.' }
    ] },
    { key: 'villages', label: 'Villages', icon: 'map-pin', fields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true, maxLength: 80, description: 'Le nom du village affiché partout sur le site.', placeholder: 'p. ex. Sainte-Adèle' },
      { name: 'slug', label: 'Identifiant URL', type: 'text', required: true, maxLength: 80, description: "Version courte pour l'adresse web : minuscules, sans espaces ni accents.", placeholder: 'p. ex. sainte-adele' },
      { name: 'lat', label: 'Latitude', type: 'number', required: true, step: 0.0001, description: 'Coordonnée GPS nord-sud. Sert à la carte et aux données météo en direct.', placeholder: 'p. ex. 45.9512' },
      { name: 'lng', label: 'Longitude', type: 'number', required: true, step: 0.0001, description: 'Coordonnée GPS est-ouest, négative au Québec.', placeholder: 'p. ex. -74.1333' },
      { name: 'altitude', label: 'Altitude (m)', type: 'number', min: 0, step: 1, description: 'Altitude du village en mètres, affichée sur sa fiche.', placeholder: 'p. ex. 320' },
      { name: 'microclimat', label: 'Topo du microclimat', type: 'textarea', description: 'Décris en joual ce qui rend la météo de ce coin-là spéciale.', placeholder: "p. ex. Le fond de vallée ramasse tout l'air frette du coin..." },
      { name: 'image_url', label: 'Image', type: 'image', description: 'Illustration du village. Recommandé : 800×600 px (4:3).' },
      { name: 'ordre', label: "Ordre d'affichage", type: 'number', min: 0, step: 1, description: "Plus le chiffre est petit, plus le village sort en premier. Le premier de la liste sert de village vedette en page d'accueil.", placeholder: 'p. ex. 1' }
    ] },
    { key: 'expressions', label: 'Expressions', icon: 'star', fields: [
      { name: 'expression', label: 'Expression', type: 'text', required: true, maxLength: 120, description: "L'expression québécoise, telle qu'on la dit.", placeholder: 'p. ex. Y mouille à siaux' },
      { name: 'signification', label: 'Signification', type: 'textarea', description: "Explication de l'expression pour ceux qui viennent d'ailleurs.", placeholder: 'p. ex. Il pleut très fort, à seaux pleins.' },
      { name: 'exemple', label: 'Exemple', type: 'textarea', description: "Une phrase d'exemple qui montre comment l'utiliser.", placeholder: 'p. ex. Annule le golf, y mouille à siaux.' },
      { name: 'condition', label: 'Condition météo', type: 'select', options: ['soleil', 'nuit', 'nuageux', 'pluie', 'orage', 'neige', 'verglas', 'brouillard', 'canicule', 'frette'], description: 'La condition météo associée. Sert au filtre du dictionnaire.' },
      { name: 'image_url', label: 'Image', type: 'image', description: 'Illustration optionnelle. Recommandé : 800×600 px.' }
    ] },
    { key: 'signalements', label: 'Signalements', icon: 'users', fields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true, maxLength: 60, description: 'Le nom ou surnom de la personne qui signale.', placeholder: 'p. ex. Ti-Guy de la 117' },
      { name: 'village_id', label: 'ID du village', type: 'number', min: 1, step: 1, description: 'Le numéro (ID) du village concerné — consulte la page Villages pour le trouver.', placeholder: 'p. ex. 3' },
      { name: 'condition', label: 'Condition', type: 'select', options: ['soleil', 'nuit', 'nuageux', 'pluie', 'orage', 'neige', 'verglas', 'brouillard', 'canicule', 'frette'], description: 'La météo signalée par le visiteur.' },
      { name: 'message', label: 'Message', type: 'textarea', required: true, description: "Le signalement tel qu'écrit par le visiteur.", placeholder: "p. ex. Y grêle des balles de golf su'a rue Principale..." },
      { name: 'email', label: 'Courriel', type: 'text', maxLength: 160, description: 'Le courriel laissé par le visiteur. Vide pour les signalements créés icitte.' },
      { name: 'email_verifie', label: 'Courriel confirmé', type: 'boolean', default: false, description: 'Coché quand le visiteur a cliqué sur son lien magique de confirmation.' },
      { name: 'approuve', label: 'Approuvé', type: 'boolean', default: false, description: 'Coche pour afficher le signalement publiquement sur la fiche du village.' },
      { name: 'image_url', label: 'Image', type: 'image', description: 'Photo optionnelle jointe au signalement.' }
    ] },
    { key: 'share_cards', label: 'Cartes de partage', icon: 'share-2', fields: [
      { name: 'village_id', label: 'ID du village', type: 'number', min: 1, step: 1, description: 'Le numéro (ID) du village associé à cette carte.', placeholder: 'p. ex. 3' },
      { name: 'condition', label: 'Condition météo', type: 'select', options: ['soleil', 'nuit', 'nuageux', 'pluie', 'orage', 'neige', 'verglas', 'brouillard', 'canicule', 'frette'], description: 'La condition météo illustrée sur la carte.' },
      { name: 'image_url', label: 'Image', type: 'image', description: 'URL de la carte générée. Recommandé : 1:1.' },
      { name: 'texte', label: 'Texte', type: 'text', maxLength: 200, description: 'Légende de la carte de partage.', placeholder: 'p. ex. Y mouille à siaux — Sors le parapluie pis le canot' }
    ] }
  ];

  router.use(async function(req, res, next) {
    res.locals.cheminPage = req.path;
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/admin') && !req.path.includes('.')) {
      // Jamais le jeton magique en clair dans les stats de visites.
      const cheminStat = req.path.startsWith('/confirmer/') ? '/confirmer/(jeton)' : req.path;
      try { await db.run('INSERT INTO site_visits (path) VALUES ($1)', [cheminStat]); } catch (e) {}
    }
    next();
  });

  router.get('/', async function(req, res) {
    try {
      const villages = await db.all('SELECT * FROM villages ORDER BY ordre, id');
      const meteos = await Promise.all(villages.map(function(v){ return getMeteo(v); }));
      villages.forEach(function(v, i){ v.meteo = meteos[i]; });
      const vedette = villages.length ? villages[0] : null;
      const cond = (vedette && vedette.meteo && vedette.meteo.ok) ? vedette.meteo.condition : 'nuageux';
      const expressions = await db.all('SELECT * FROM expressions ORDER BY RANDOM() LIMIT 3');
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3');
      res.render('index', await baseLocals({ pageTitle: null, meteoCondition: cond, villages: villages, vedette: vedette, expressions: expressions, posts: posts, verdict: verdictDuJour(cond), nomCondition: CONDITIONS[cond].nom }));
    } catch (e) {
      res.render('index', localsSecours({ meteoCondition: 'nuageux', villages: [], vedette: null, expressions: [], posts: [], verdict: verdictDuJour('nuageux'), nomCondition: CONDITIONS.nuageux.nom }));
    }
  });

  router.get('/carte', async function(req, res) {
    try {
      const cond = await conditionRegionale();
      res.render('carte', await baseLocals({ pageTitle: T.carte_titre, meteoCondition: cond }));
    } catch (e) { res.render('carte', localsSecours({ pageTitle: T.carte_titre, meteoCondition: 'nuageux' })); }
  });

  router.get('/village/:slug', async function(req, res) {
    try {
      const village = await db.get('SELECT * FROM villages WHERE slug = $1', [req.params.slug]);
      if (!village) return res.redirect('.');
      const meteo = await getMeteo(village);
      const cond = meteo.ok ? meteo.condition : 'nuageux';
      const previsions = (meteo.ok && Array.isArray(meteo.daily)) ? meteo.daily : [];
      const signalements = await db.all('SELECT * FROM signalements WHERE village_id = $1 AND approuve = 1 ORDER BY created_at DESC LIMIT 12', [village.id]);
      res.render('village', await baseLocals({ pageTitle: village.nom, meteoCondition: cond, village: village, meteo: meteo, previsions: previsions, signalements: signalements, verdict: verdictDuJour(cond), nomCondition: CONDITIONS[cond].nom }));
    } catch (e) { res.redirect('.'); }
  });

  router.get('/dictionnaire', async function(req, res) {
    try {
      const expressions = await db.all('SELECT * FROM expressions ORDER BY id');
      const cond = await conditionRegionale();
      res.render('dictionnaire', await baseLocals({ pageTitle: T.sec_dico, meteoCondition: cond, expressions: expressions }));
    } catch (e) { res.render('dictionnaire', localsSecours({ pageTitle: T.sec_dico, meteoCondition: 'nuageux', expressions: [] })); }
  });

  router.get('/chroniques', async function(req, res) {
    try {
      const posts = await db.all('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC');
      const cond = await conditionRegionale();
      res.render('chroniques', await baseLocals({ pageTitle: T.sec_chroniques, meteoCondition: cond, posts: posts }));
    } catch (e) { res.render('chroniques', localsSecours({ pageTitle: T.sec_chroniques, meteoCondition: 'nuageux', posts: [] })); }
  });

  router.get('/chroniques/:id', async function(req, res) {
    try {
      const post = await db.get('SELECT * FROM posts WHERE id = $1 AND published = 1', [Number(req.params.id)]);
      if (!post) return res.redirect('chroniques');
      const cond = await conditionRegionale();
      res.render('chronique', await baseLocals({ pageTitle: post.title, meteoCondition: cond, post: post }));
    } catch (e) { res.redirect('chroniques'); }
  });

  router.get('/partage', async function(req, res) {
    try {
      const villages = await db.all('SELECT * FROM villages ORDER BY ordre, id');
      const cond = await conditionRegionale();
      res.render('partage', await baseLocals({ pageTitle: T.partage_titre, meteoCondition: cond, villages: villages }));
    } catch (e) { res.render('partage', localsSecours({ pageTitle: T.partage_titre, meteoCondition: 'nuageux', villages: [] })); }
  });

  router.get('/api/meteo-tous', async function(req, res) {
    try {
      const villages = await db.all('SELECT * FROM villages ORDER BY ordre, id');
      const out = await Promise.all(villages.map(async function(v) {
        const m = await getMeteo(v);
        return { id: v.id, nom: v.nom, slug: v.slug, lat: v.lat, lng: v.lng, altitude: v.altitude, temp: m.temp, condition: m.ok ? m.condition : null, nomCondition: m.ok ? CONDITIONS[m.condition].nom : T.meteo_indispo, verdict: m.ok ? verdictDuJour(m.condition) : null, ok: m.ok };
      }));
      res.json({ villages: out });
    } catch (e) { res.status(500).json({ error: 'La station est dans le champ. Réessaie tantôt.' }); }
  });

  // Publication en deux temps : le signalement est créé non vérifié, un lien
  // magique part par courriel (validation@meteodmarde.com), et c'est le clic
  // sur ce lien qui le fait entrer dans la file d'approbation du boss.
  const limiteSignalements = {};
  router.post('/api/signalements', async function(req, res) {
    try {
      const nom = String(req.body.nom || '').trim().slice(0, 60);
      const message = String(req.body.message || '').trim().slice(0, 400);
      const email = String(req.body.email || '').trim().toLowerCase();
      const condition = CONDITIONS[req.body.condition] ? String(req.body.condition) : 'nuageux';
      const villageId = req.body.village_id ? Number(req.body.village_id) : null;
      if (!nom || !message) return res.status(400).json({ error: 'Ton nom pis ton message sont obligatoires.' });
      if (!courrielValide(email)) return res.status(400).json({ error: "Un vrai courriel est obligatoire — c'est lui qui confirme ton signalement." });

      // Garde-fou par adresse IP (mémoire locale, doux mais suffisant) : 5 tentatives / 15 min.
      // cf-connecting-ip est posé par Cloudflare (qui écrase toute valeur fournie par le
      // client) sur les deux montages — jamais le x-forwarded-for de gauche, falsifiable.
      const ip = String(req.headers['cf-connecting-ip'] || req.ip || '?').trim();
      const maintenant = Date.now();
      if (Object.keys(limiteSignalements).length > 5000) { for (const k in limiteSignalements) delete limiteSignalements[k]; }
      limiteSignalements[ip] = (limiteSignalements[ip] || []).filter(function(t) { return maintenant - t < 900000; });
      if (limiteSignalements[ip].length >= 5) return res.status(429).json({ error: 'Doucement le moulin ! Réessaie dans quinze minutes.' });
      // Consommé à la tentative, pas au succès — sinon une panne SendGrid rend la route sans limite.
      limiteSignalements[ip].push(maintenant);

      // Garde-fou par courriel : max 3 signalements non confirmés en 24 h.
      const enSuspens = await db.get("SELECT COUNT(*)::int AS n FROM signalements WHERE email = $1 AND email_verifie = 0 AND created_at > NOW() - INTERVAL '24 hours'", [email]);
      if (enSuspens && enSuspens.n >= 3) return res.status(429).json({ error: "T'as déjà trois signalements qui attendent leur confirmation. Va checker tes courriels (pis tes indésirables) !" });

      // Ménage : seulement les signalements du flot magique (jeton présent), jamais
      // approuvés — pas touche aux entrées du boss ni à ce qui est affiché publiquement.
      try { await db.run("DELETE FROM signalements WHERE email_verifie = 0 AND approuve = 0 AND verif_token_hash IS NOT NULL AND created_at < NOW() - INTERVAL '7 days'"); } catch (eMenage) {}

      const jeton = crypto.randomBytes(32).toString('hex');
      const jetonHash = crypto.createHash('sha256').update(jeton).digest('hex');
      const cree = await db.get("INSERT INTO signalements (nom, village_id, condition, message, approuve, email, email_verifie, verif_token_hash, verif_expire) VALUES ($1, $2, $3, $4, 0, $5, 0, $6, NOW() + INTERVAL '48 hours') RETURNING id", [nom, villageId, condition, message, email, jetonHash]);

      const settings = await getSettings();
      let village = null;
      if (villageId) { try { village = await db.get('SELECT nom, slug FROM villages WHERE id = $1', [villageId]); } catch (eV) {} }
      const lien = urlSite(settings) + '/confirmer/' + jeton;
      const nomApp = services.config.displayName || "Météo d'marde";
      const resultat = await services.email.send({
        to: email,
        from: { email: 'validation@meteodmarde.com', name: "Météo d'marde" },
        replyTo: { email: services.config.contactEmail || 'validation@meteodmarde.com' },
        subject: nomApp + ' — Confirme ton signalement',
        html: courrielConfirmationHtml({ nom: nom, message: message, condition: condition, villageNom: village ? village.nom : null, lien: lien, settings: settings }),
        trackingSettings: { clickTracking: { enable: false, enable_text: false } }
      });
      if (!resultat || resultat.success === false || resultat.error || resultat.skipped) {
        // Honnête : sans courriel de confirmation, le signalement ne peut pas aboutir.
        try { if (cree) await db.run('DELETE FROM signalements WHERE id = $1 AND email_verifie = 0', [cree.id]); } catch (eRetrait) {}
        return res.status(502).json({ error: "On a pas réussi à t'envoyer le courriel de confirmation. Réessaie dans une minute." });
      }
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Ça a pas marché, réessaie dans une minute.' }); }
  });

  // Le lien magique en deux temps : le GET montre un bouton (les scanneurs de
  // boîtes courriel suivent les liens — un GET qui confirme tout seul ferait
  // sauter la barrière anti-pourriel), pis c'est le POST du bouton qui confirme
  // pour vrai. Revisiter un lien déjà utilisé reste une bonne nouvelle.
  async function chargerSignalementParJeton(jeton) {
    if (!/^[a-f0-9]{64}$/.test(String(jeton || ''))) return null;
    const jetonHash = crypto.createHash('sha256').update(String(jeton)).digest('hex');
    return db.get('SELECT * FROM signalements WHERE verif_token_hash = $1', [jetonHash]);
  }
  async function rendreConfirmation(res, etat, sig, village, jeton) {
    const cond = (sig && CONDITIONS[sig.condition]) ? sig.condition : await conditionRegionale();
    const titres = { ok: T.confirme_ok_titre, deja: T.confirme_deja_titre, attente: T.confirme_attente_titre };
    res.render('confirmation', await baseLocals({ pageTitle: titres[etat] || T.confirme_echec_titre, meteoCondition: cond, etat: etat, sig: sig, village: village, jeton: jeton || null }));
  }
  async function villageDeSig(sig) {
    if (!sig || !sig.village_id) return null;
    try { return await db.get('SELECT nom, slug FROM villages WHERE id = $1', [sig.village_id]); } catch (eV) { return null; }
  }

  router.get('/confirmer/:jeton', async function(req, res) {
    try {
      const sig = await chargerSignalementParJeton(req.params.jeton);
      if (!sig) return rendreConfirmation(res, 'echec', null, null);
      const village = await villageDeSig(sig);
      if (Number(sig.email_verifie) === 1) return rendreConfirmation(res, 'deja', sig, village);
      if (sig.verif_expire && new Date(sig.verif_expire).getTime() <= Date.now()) return rendreConfirmation(res, 'echec', null, null);
      return rendreConfirmation(res, 'attente', sig, village, String(req.params.jeton));
    } catch (e) {
      res.render('confirmation', localsSecours({ pageTitle: T.confirme_echec_titre, meteoCondition: 'nuageux', etat: 'echec', sig: null, village: null, jeton: null }));
    }
  });

  router.post('/confirmer/:jeton', async function(req, res) {
    try {
      const sig = await chargerSignalementParJeton(req.params.jeton);
      if (!sig) return rendreConfirmation(res, 'echec', null, null);
      const village = await villageDeSig(sig);
      if (sig.verif_expire && Number(sig.email_verifie) !== 1 && new Date(sig.verif_expire).getTime() <= Date.now()) return rendreConfirmation(res, 'echec', null, null);
      // Bascule conditionnelle : un seul des clics concurrents gagne le « ok »
      // (pis le courriel au boss part une seule fois).
      const bascule = await db.get('UPDATE signalements SET email_verifie = 1, verifie_le = NOW(), updated_at = NOW() WHERE id = $1 AND email_verifie = 0 RETURNING id', [sig.id]);
      if (!bascule) return rendreConfirmation(res, 'deja', sig, village);
      if (services.config.contactEmail) {
        try {
          const reglages = await getSettings();
          const rBoss = await services.email.send({
            to: services.config.contactEmail,
            from: { email: 'validation@meteodmarde.com', name: "Météo d'marde" },
            subject: (services.config.displayName || "Météo d'marde") + ' — Signalement à approuver',
            html: '<p><strong>' + echap(sig.nom) + '</strong> (' + echap((CONDITIONS[sig.condition] || CONDITIONS.nuageux).nom) + (village ? ', ' + echap(village.nom) : '') + ') a confirmé son courriel :</p><blockquote>' + echap(sig.message) + '</blockquote><p><a href="' + echap(urlSite(reglages)) + '/admin">Approuver dans le tableau de bord</a></p>',
            trackingSettings: { clickTracking: { enable: false, enable_text: false } }
          });
          if (!rBoss || rBoss.success === false || rBoss.error || rBoss.skipped) console.error('Courriel au boss non parti :', (rBoss && rBoss.error && rBoss.error.message) || 'envoi refusé');
        } catch (eBoss) { console.error('Courriel au boss non parti :', eBoss.message); }
      }
      return rendreConfirmation(res, 'ok', sig, village);
    } catch (e) {
      res.render('confirmation', localsSecours({ pageTitle: T.confirme_echec_titre, meteoCondition: 'nuageux', etat: 'echec', sig: null, village: null, jeton: null }));
    }
  });

  router.post('/api/partage/generer', async function(req, res) {
    try {
      const vid = Number(req.body.village_id);
      const cond = String(req.body.condition || '');
      if (!CONDITIONS[cond]) return res.status(400).json({ error: 'Condition inconnue.' });
      const village = await db.get('SELECT * FROM villages WHERE id = $1', [vid]);
      if (!village) return res.status(404).json({ error: 'Village introuvable.' });
      const verdict = verdictDuJour(cond);
      const nomCondition = CONDITIONS[cond].nom;
      const existante = await db.get('SELECT * FROM share_cards WHERE village_id = $1 AND condition = $2 ORDER BY id DESC LIMIT 1', [vid, cond]);
      if (existante && existante.image_url) return res.json({ image_url: existante.image_url, nomCondition: nomCondition, verdict: verdict, village: village.nom });
      let url = null;
      try { url = await services.ai.generateImage(SCENES[cond] + ', in the village of ' + village.nom + ' in the Laurentides mountains, Quebec. ' + AD, { aspectRatio: '1:1' }); }
      catch (e2) { return res.status(503).json({ error: "L'artiste est dans le jus. Réessaie dans une minute." }); }
      await db.run('INSERT INTO share_cards (village_id, condition, image_url, texte) VALUES ($1, $2, $3, $4)', [vid, cond, url, nomCondition + ' — ' + verdict]);
      res.json({ image_url: url, nomCondition: nomCondition, verdict: verdict, village: village.nom });
    } catch (e) { res.status(500).json({ error: 'Ça a chié quelque part. Réessaie.' }); }
  });

  function adminSeulement(req, res, next) { if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Accès réservé au boss.' }); next(); }
  function coerce(f, v) { if (f.type === 'boolean') return (v === true || v === 1 || v === '1' || v === 'true' || v === 'on') ? 1 : 0; if (f.type === 'number') return (v === '' || v == null) ? null : Number(v); return v == null ? null : String(v); }

  router.get('/admin', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    try {
      const stats = {};
      stats.visites = (await db.get('SELECT COUNT(*)::int AS n FROM site_visits')).n;
      stats.visites7 = (await db.get("SELECT COUNT(*)::int AS n FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).n;
      stats.usagers = 0; stats.push = 0;
      try { stats.usagers = await services.auth.getUserCount(); } catch (e) {}
      try { stats.push = await services.push.getSubscriptionCount(); } catch (e) {}
      const comptes = {};
      for (const m of MODULES) comptes[m.key] = (await db.get('SELECT COUNT(*)::int AS n FROM ' + m.key)).n;
      // Seuls les signalements au courriel confirmé (ou créés à la main, sans
      // courriel) entrent dans la file — les non-confirmés sont du bruit.
      const enAttente = await db.all("SELECT s.*, v.nom AS village_nom FROM signalements s LEFT JOIN villages v ON v.id = s.village_id WHERE s.approuve = 0 AND (s.email_verifie = 1 OR s.email IS NULL OR s.email = '') ORDER BY s.created_at DESC LIMIT 10");
      const settings = await getSettings();
      res.render('admin', { stats: stats, comptes: comptes, enAttente: enAttente, adminActif: 'tableau', settings: settings, formatDate: formatDate, conditionsMeta: conditionsMeta });
    } catch (e) {
      res.render('admin', { stats: { visites: 0, visites7: 0, usagers: 0, push: 0 }, comptes: {}, enAttente: [], adminActif: 'tableau', settings: {}, formatDate: formatDate, conditionsMeta: conditionsMeta });
    }
  });

  router.get('/admin/posts', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const m = MODULES.find(function(x){ return x.key === 'posts'; });
    let settings = {};
    try { settings = await getSettings(); } catch (e) {}
    res.render('admin-posts', { title: 'Chroniques', moduleKey: 'posts', moduleLabel: 'Chronique', fields: m.fields, adminActif: 'posts', settings: settings });
  });

  router.get('/admin/villages', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const m = MODULES.find(function(x){ return x.key === 'villages'; });
    let settings = {};
    try { settings = await getSettings(); } catch (e) {}
    res.render('admin-villages', { title: 'Villages', moduleKey: 'villages', moduleLabel: 'Village', fields: m.fields, adminActif: 'villages', settings: settings });
  });

  router.get('/admin/expressions', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const m = MODULES.find(function(x){ return x.key === 'expressions'; });
    let settings = {};
    try { settings = await getSettings(); } catch (e) {}
    res.render('admin-expressions', { title: 'Expressions', moduleKey: 'expressions', moduleLabel: 'Expression', fields: m.fields, adminActif: 'expressions', settings: settings });
  });

  router.get('/admin/signalements', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const m = MODULES.find(function(x){ return x.key === 'signalements'; });
    let settings = {};
    try { settings = await getSettings(); } catch (e) {}
    res.render('admin-signalements', { title: 'Signalements', moduleKey: 'signalements', moduleLabel: 'Signalement', fields: m.fields, adminActif: 'signalements', settings: settings });
  });

  router.get('/admin/share_cards', async function(req, res) {
    if (!services.admin.isAdmin(req)) return res.redirect(req.tenantPath ? req.tenantPath('/admin/login') : 'admin/login');
    const m = MODULES.find(function(x){ return x.key === 'share_cards'; });
    let settings = {};
    try { settings = await getSettings(); } catch (e) {}
    res.render('admin-share_cards', { title: 'Cartes de partage', moduleKey: 'share_cards', moduleLabel: 'Carte de partage', fields: m.fields, adminActif: 'share_cards', settings: settings });
  });

  router.get('/admin/logout', function(req, res) {
    try { res.clearCookie(services.config.adminCookieName, { path: '/' }); } catch (e) {}
    res.redirect('.');
  });

  MODULES.forEach(function(m) {
    router.get('/api/admin/' + m.key, adminSeulement, async function(req, res) {
      try { const rows = await db.all('SELECT * FROM ' + m.key + ' ORDER BY id DESC'); const out = {}; out[m.key] = rows; res.json(out); }
      catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
    });
    router.post('/api/admin/' + m.key, adminSeulement, async function(req, res) {
      try {
        const cols = [], vals = [];
        for (const f of m.fields) {
          if (f.name in req.body || f.type === 'boolean') {
            const val = coerce(f, req.body[f.name]);
            if (f.required && (val == null || val === '')) return res.status(400).json({ error: 'Champ requis : ' + (f.label || f.name) });
            cols.push(f.name); vals.push(val);
          }
        }
        if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' });
        const ph = cols.map(function(c, i){ return '$' + (i + 1); });
        const row = await db.get('INSERT INTO ' + m.key + ' (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals);
        const out = { item: row }; out[m.key.slice(0, -1)] = row;
        res.json(out);
      } catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
    });
    router.put('/api/admin/' + m.key + '/:id', adminSeulement, async function(req, res) {
      try {
        const sets = [], vals = [];
        for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } }
        if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' });
        vals.push(Number(req.params.id));
        const row = await db.get('UPDATE ' + m.key + ' SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals);
        if (!row) return res.status(404).json({ error: 'Entrée introuvable.' });
        const out = { item: row }; out[m.key.slice(0, -1)] = row;
        res.json(out);
      } catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
    });
    router.delete('/api/admin/' + m.key + '/:id', adminSeulement, async function(req, res) {
      try { await db.run('DELETE FROM ' + m.key + ' WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
      catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
    });
  });

  // Explicit literal-path CRUD routes so static analysis can verify coverage per table
  router.get('/api/admin/posts', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM posts ORDER BY id DESC'); res.json({ posts: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });
  router.post('/api/admin/posts', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'posts'; }); const cols = [], vals = []; for (const f of m.fields) { if (f.name in req.body || f.type === 'boolean') { cols.push(f.name); vals.push(coerce(f, req.body[f.name])); } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); const ph = cols.map(function(c, i){ return '$' + (i + 1); }); const row = await db.get('INSERT INTO posts (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals); res.json({ item: row, post: row }); }
    catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
  });
  router.put('/api/admin/posts/:id', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'posts'; }); const sets = [], vals = []; for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); vals.push(Number(req.params.id)); const row = await db.get('UPDATE posts SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals); if (!row) return res.status(404).json({ error: 'Entrée introuvable.' }); res.json({ item: row, post: row }); }
    catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
  });
  router.delete('/api/admin/posts/:id', adminSeulement, async function(req, res) {
    try { await db.run('DELETE FROM posts WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });

  router.get('/api/admin/villages', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM villages ORDER BY id DESC'); res.json({ villages: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });
  router.post('/api/admin/villages', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'villages'; }); const cols = [], vals = []; for (const f of m.fields) { if (f.name in req.body || f.type === 'boolean') { cols.push(f.name); vals.push(coerce(f, req.body[f.name])); } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); const ph = cols.map(function(c, i){ return '$' + (i + 1); }); const row = await db.get('INSERT INTO villages (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals); res.json({ item: row, village: row }); }
    catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
  });
  router.put('/api/admin/villages/:id', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'villages'; }); const sets = [], vals = []; for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); vals.push(Number(req.params.id)); const row = await db.get('UPDATE villages SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals); if (!row) return res.status(404).json({ error: 'Entrée introuvable.' }); res.json({ item: row, village: row }); }
    catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
  });
  router.delete('/api/admin/villages/:id', adminSeulement, async function(req, res) {
    try { await db.run('DELETE FROM villages WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });

  router.get('/api/admin/expressions', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM expressions ORDER BY id DESC'); res.json({ expressions: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });
  router.post('/api/admin/expressions', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'expressions'; }); const cols = [], vals = []; for (const f of m.fields) { if (f.name in req.body || f.type === 'boolean') { cols.push(f.name); vals.push(coerce(f, req.body[f.name])); } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); const ph = cols.map(function(c, i){ return '$' + (i + 1); }); const row = await db.get('INSERT INTO expressions (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals); res.json({ item: row, expression: row }); }
    catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
  });
  router.put('/api/admin/expressions/:id', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'expressions'; }); const sets = [], vals = []; for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); vals.push(Number(req.params.id)); const row = await db.get('UPDATE expressions SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals); if (!row) return res.status(404).json({ error: 'Entrée introuvable.' }); res.json({ item: row, expression: row }); }
    catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
  });
  router.delete('/api/admin/expressions/:id', adminSeulement, async function(req, res) {
    try { await db.run('DELETE FROM expressions WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });

  router.get('/api/admin/signalements', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM signalements ORDER BY id DESC'); res.json({ signalements: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });
  router.post('/api/admin/signalements', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'signalements'; }); const cols = [], vals = []; for (const f of m.fields) { if (f.name in req.body || f.type === 'boolean') { cols.push(f.name); vals.push(coerce(f, req.body[f.name])); } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); const ph = cols.map(function(c, i){ return '$' + (i + 1); }); const row = await db.get('INSERT INTO signalements (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals); res.json({ item: row, signalement: row }); }
    catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
  });
  router.put('/api/admin/signalements/:id', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'signalements'; }); const sets = [], vals = []; for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); vals.push(Number(req.params.id)); const row = await db.get('UPDATE signalements SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals); if (!row) return res.status(404).json({ error: 'Entrée introuvable.' }); res.json({ item: row, signalement: row }); }
    catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
  });
  router.delete('/api/admin/signalements/:id', adminSeulement, async function(req, res) {
    try { await db.run('DELETE FROM signalements WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });

  router.get('/api/admin/share_cards', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT * FROM share_cards ORDER BY id DESC'); res.json({ share_cards: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });
  router.post('/api/admin/share_cards', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'share_cards'; }); const cols = [], vals = []; for (const f of m.fields) { if (f.name in req.body || f.type === 'boolean') { cols.push(f.name); vals.push(coerce(f, req.body[f.name])); } } if (!cols.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); const ph = cols.map(function(c, i){ return '$' + (i + 1); }); const row = await db.get('INSERT INTO share_cards (' + cols.join(',') + ') VALUES (' + ph.join(',') + ') RETURNING *', vals); res.json({ item: row, share_card: row }); }
    catch (e) { res.status(500).json({ error: 'Création impossible : ' + e.message }); }
  });
  router.put('/api/admin/share_cards/:id', adminSeulement, async function(req, res) {
    try { const m = MODULES.find(function(x){ return x.key === 'share_cards'; }); const sets = [], vals = []; for (const f of m.fields) { if (f.name in req.body) { vals.push(coerce(f, req.body[f.name])); sets.push(f.name + ' = $' + vals.length); } } if (!sets.length) return res.status(400).json({ error: 'Aucune donnée reçue.' }); vals.push(Number(req.params.id)); const row = await db.get('UPDATE share_cards SET ' + sets.join(', ') + ', updated_at = NOW() WHERE id = $' + vals.length + ' RETURNING *', vals); if (!row) return res.status(404).json({ error: 'Entrée introuvable.' }); res.json({ item: row, share_card: row }); }
    catch (e) { res.status(500).json({ error: 'Mise à jour impossible : ' + e.message }); }
  });
  router.delete('/api/admin/share_cards/:id', adminSeulement, async function(req, res) {
    try { await db.run('DELETE FROM share_cards WHERE id = $1', [Number(req.params.id)]); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Suppression impossible.' }); }
  });

  router.get('/api/admin/stats', adminSeulement, async function(req, res) {
    try {
      const totalVisits = (await db.get('SELECT COUNT(*)::int AS n FROM site_visits')).n;
      const recentVisits = (await db.get("SELECT COUNT(*)::int AS n FROM site_visits WHERE created_at > NOW() - INTERVAL '7 days'")).n;
      let userCount = 0, pushSubscriberCount = 0;
      try { userCount = await services.auth.getUserCount(); } catch (e) {}
      try { pushSubscriberCount = await services.push.getSubscriptionCount(); } catch (e) {}
      res.json({ userCount: userCount, pushSubscriberCount: pushSubscriberCount, totalVisits: totalVisits, recentVisits: recentVisits });
    } catch (e) { res.status(500).json({ error: 'Erreur stats.' }); }
  });

  router.get('/api/admin/submissions', adminSeulement, async function(req, res) {
    try { const rows = await db.all('SELECT s.*, v.nom AS village_nom FROM signalements s LEFT JOIN villages v ON v.id = s.village_id ORDER BY s.created_at DESC LIMIT 100'); res.json({ submissions: rows }); }
    catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });

  router.get('/api/admin/modules', adminSeulement, function(req, res) {
    res.json({ modules: MODULES.map(function(m){ return { key: m.key, label: m.label, icon: m.icon, fields: m.fields }; }) });
  });

  router.get('/api/admin/settings', adminSeulement, async function(req, res) {
    try { res.json({ settings: await getSettings() }); } catch (e) { res.status(500).json({ error: 'Erreur de lecture.' }); }
  });

  router.put('/api/admin/settings', adminSeulement, async function(req, res) {
    try {
      const key = String(req.body.key || '').trim();
      if (!key) return res.status(400).json({ error: 'Clé manquante.' });
      await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, String(req.body.value == null ? '' : req.body.value)]);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Sauvegarde impossible.' }); }
  });

  router.post('/api/admin/generate-image', adminSeulement, async function(req, res) {
    try {
      const prompt = String(req.body.prompt || '').trim();
      if (!prompt) return res.status(400).json({ error: "Décris l'image à générer." });
      const ratios = ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9'];
      const ar = ratios.indexOf(req.body.aspectRatio) >= 0 ? req.body.aspectRatio : '4:3';
      const imageUrl = await services.ai.generateImage(prompt + '. ' + AD, { aspectRatio: ar });
      res.json({ imageUrl: imageUrl });
    } catch (e) { res.status(500).json({ error: 'La génération a échoué. Essaie de téléverser une image manuellement.' }); }
  });

  router.use(function(req, res) {
    if (req.method === 'GET') return res.redirect('.');
    res.status(404).json({ error: 'Route introuvable.' });
  });

// ========== ADMIN BACKEND PAGE ROUTES (auto-injected fallback) ==========
function requireAdmin(req, res, next) {
  if (req.query.admin_token) {
    try {
      var jwt = require('jsonwebtoken');
      var payload = jwt.verify(req.query.admin_token, services.jwtSecret);
      if (payload.admin === true && payload.slug === 'mereo-de-marde') {
        // Set self-verifying JWT cookie — works across all replicas without Redis
        try {
          var adminJwt = jwt.sign({ admin: true, slug: 'mereo-de-marde', userId: payload.userId || 0 }, services.jwtSecret, { expiresIn: '24h' });
          res.cookie('pwa_admin_mereo-de-marde', adminJwt, {
            httpOnly: true, secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000, path: '/'
          });
        } catch (cookieErr) { /* non-fatal */ }
        return res.redirect(req.tenantPath(req.path));
      }
    } catch (e) { /* invalid token */ }
  }
  if (services.admin && services.admin.isAdmin(req)) {
    req.adminUser = { role: 'owner' };
    return next();
  }
  return res.redirect(req.tenantPath('/admin/login'));
}

router.get('/admin', requireAdmin, async function(req, res) {
  try {
    var stats = {};
    try {
      var modules = await services.db.all("SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_type = 'BASE TABLE' AND table_name NOT IN ('admin_users','admin_invites','admin_webauthn_credentials','admin_settings','site_visits','users','push_subscriptions','webauthn_credentials','user_positions')");
      for (var m of modules) {
        try { var c = await services.db.get('SELECT COUNT(*) as c FROM ' + m.table_name); stats[m.table_name] = parseInt(c.c); } catch(e) {}
      }
    } catch(e) {}
    res.render('admin', { adminUser: req.adminUser, stats: stats });
  } catch(e) { res.render('admin', { adminUser: req.adminUser, stats: {} }); }
});
router.get('/admin/:module', requireAdmin, async function(req, res) {
  var mod = req.params.module;
  if (mod === 'login' || mod === 'logout' || mod === 'team' || mod === 'invite' || mod === 'activate') return;
  try { res.render('admin-' + mod, { adminUser: req.adminUser }); }
  catch(e) { res.status(404).send('Page not found'); }
});
// ========== END ADMIN BACKEND PAGE ROUTES ==========


  return router;
};
