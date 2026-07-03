module.exports = async function(db, services) {
  const cfg = (services && services.config) || {};
  async function reglage(k, v, maj) {
    if (v == null || v === '') return;
    if (maj) await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
    else await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }
  await reglage('business_name', cfg.businessName || cfg.displayName || "Météo d'marde");
  await reglage('tagline', 'La météo des Laurentides, dite comme du vrai monde.');
  await reglage('hero_sous', "Microclimats vérifiés à l'oeil pis au thermomètre. La seule météo qui te parle comme ta matante.");
  await reglage('hero_caption', 'Les Laurentides dans toute leur splendeur douteuse');
  await reglage('about_text', "Météo d'marde, c'est le bulletin météo hyper-local des Laurentides : chaque village a son microclimat, pis on le dit sans mettre de gants blancs. Des données fraîches, des expressions d'icitte, pis zéro langue de bois.");
  await reglage('footer_note', 'Fait dans les Laurentides, entre deux bordées.');
  await reglage('cta_titre', 'Écoeure tes chums des autres régions');
  await reglage('cta_texte', "Génère une carte météo exagérée avec le jargon d'icitte pis partage-la. Parce que si on est pour manger d'la marde, aussi ben en rire.");
  await reglage('carte_sous', "Chaque point, c'est un microclimat qui fait à sa tête. Pèse sur un village pour voir sa marde en direct, pis vire la carte en mode relief pour comprendre pourquoi.");
  await reglage('partage_intro', "Choisis ton coin, choisis ta marde, pis l'artiste te dessine une carte à partager. Garantie 100 % exagérée.");
  await reglage('partage_note', "Les cartes sont gardées en banque : si quelqu'un a déjà généré la même marde pour le même coin, tu reçois la même caricature. Le texte, lui, change chaque jour.");
  if (cfg.contactEmail) await reglage('contact_email', cfg.contactEmail);
  if (cfg.contactPhone) await reglage('contact_phone', String(cfg.contactPhone));
  if (cfg.businessAddress) await reglage('business_address', cfg.businessAddress);
  await reglage('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039813/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813099.png', true);
  await reglage('_p_partage_demo_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039813/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813370.png', true);

  const nV = await db.get('SELECT COUNT(*)::int AS n FROM villages');
  if (!nV || Number(nV.n) === 0) {
    const villages = [
      ['Saint-Sauveur', 'saint-sauveur', 45.8901, -74.1699, 240, "Le fond de vallée par excellence : l'air frette dévale les pentes le soir pis s'écrase dans le village comme d'la mélasse. Deux degrés de moins que chez le voisin d'en haut, garanti.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039814/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039814128.png', 1],
      ['Mont-Tremblant', 'mont-tremblant', 46.1185, -74.5962, 265, "En bas, c'est vivable. En haut d'la montagne, enlève huit degrés, rajoute un vent qui décoiffe pis un nuage personnel accroché au sommet à l'année.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039813/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813194.png', 2],
      ['Val-David', 'val-david', 46.0295, -74.2153, 335, "Coincé entre deux monts, le village ramasse les averses que les autres échappent. Quand y mouille à Sainte-Adèle, icitte y mouille à siaux.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039814/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039814020.png', 3],
      ['Sainte-Agathe-des-Monts', 'sainte-agathe', 46.0448, -74.2817, 395, "Le lac des Sables joue au thermostat : y tempère l'été, mais au printemps pis à l'automne, y crache une brume épaisse comme d'la soupe aux pois.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039815/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039815220.png', 4],
      ['Morin-Heights', 'morin-heights', 45.9005, -74.2469, 300, "Le corridor à neige officiel. Les nuages arrivent de l'ouest, frappent les collines pis déchargent tout leur stock icitte. Les bancs de neige ont leur propre code postal.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039813/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813490.png', 5],
      ['Saint-Donat', 'saint-donat', 46.3186, -74.2211, 400, "Le congélateur des Laurentides. Perché dans le bout, encaissé entre les monts : quand la radio dit moins vingt, icitte c'est moins vingt-huit pis on n'en parle pu.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039814/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813864.png', 6]
    ];
    for (const v of villages) await db.run('INSERT INTO villages (nom, slug, lat, lng, altitude, microclimat, image_url, ordre) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (slug) DO NOTHING', v);
  }

  const nE = await db.get('SELECT COUNT(*)::int AS n FROM expressions');
  if (!nE || Number(nE.n) === 0) {
    const expressions = [
      ['Y mouille à siaux', "Il pleut abondamment, comme si quelqu'un vidait des seaux d'eau direct sur ta tête.", 'Annule le golf, y mouille à siaux depuis à matin.', 'pluie'],
      ['Frette à fendre les clôtures', 'Un froid intense, sec pis coupant, qui fait craquer le bois pis les moraux.', 'Rentre le chien, y fait frette à fendre les clôtures.', 'frette'],
      ['Chaud à faire suer les mouches', "Une chaleur écrasante où même les bibittes cherchent de l'ombre.", 'Le gazon est jaune raide, y fait chaud à faire suer les mouches.', 'canicule'],
      ['Une bordée de bonne femme', "Une chute de neige généreuse qui te remplit l'entrée en criant ciseau.", "On a eu une bordée de bonne femme : trente centimètres, pis c'est pas fini.", 'neige'],
      ["Épais comme d'la soupe aux pois", "Un brouillard tellement dense qu'on voit pas le voisin, ni son cabanon.", "Prends la 117 tranquillement, c'est épais comme d'la soupe aux pois.", 'brouillard'],
      ['Le ciel file un mauvais coton', 'Temps gris, morose, qui donne envie de rien pantoute.', 'Journée de lavage : le ciel file un mauvais coton anyway.', 'nuageux'],
      ["Ça va brasser dans l'cabanon", "Un orage qui s'en vient, avec du vent pis du tonnerre en masse.", 'Rentre les coussins du patio, ça va brasser dans l\'cabanon à soir.', 'orage'],
      ['Beau à pas rester en dedans', 'Un temps splendide qui rend coupable quiconque reste devant la télé.', 'Sors dehors un peu, y fait beau à pas rester en dedans !', 'soleil'],
      ['Une vraie patinoire à ciel ouvert', 'Du verglas partout : les rues, les marches, le perron — tout glisse.', 'Mets tes crampons, le stationnement est une vraie patinoire à ciel ouvert.', 'verglas'],
      ['Un vent à écorner les boeufs', 'Des rafales assez fortes pour arracher ta tuque pis ton orgueil.', 'Attache ta poubelle, y vente à écorner les boeufs.', 'nuageux']
    ];
    for (const e of expressions) await db.run('INSERT INTO expressions (expression, signification, exemple, condition) VALUES ($1, $2, $3, $4)', e);
  }

  const nP = await db.get('SELECT COUNT(*)::int AS n FROM posts');
  if (!nP || Number(nP.n) === 0) {
    const posts = [
      ['Pourquoi Saint-Donat gèle toujours plus que chez vous', "Tout le monde a un chum de Saint-Donat qui se vante d'avoir eu moins trente pendant que toé t'avais moins vingt. C'est pas de la vantardise : c'est de la physique.\n\nLe village est perché à 400 mètres, encaissé entre les monts. La nuit, l'air frette, plus pesant, descend des sommets pis s'accumule dans le fond comme de la mélasse dans un bol. Résultat : un frette de fond de rang qui fait craquer les maisons.\n\nMoralité : si tu veux te sentir en vacances dans le Sud, appelle quelqu'un de Saint-Donat en janvier. Ça règle le moral en deux minutes.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039814/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039814062.png', 'Chialage'],
      ['Guide de survie de la première bordée', "La première bordée, c'est comme la visite des fêtes : tu sais qu'elle s'en vient, pis a te prend toujours par surprise pareil.\n\nRègle numéro un : ta pelle est pas dans le cabanon. Est en dessous de la neige, à côté du barbecue que t'as pas rentré. Règle numéro deux : le premier char pris dans le banc de neige du rang, c'est toujours celui du gars qui a des pneus quatre saisons « encore bons ».\n\nNotre conseil d'expert : sors dix minutes plus de bonne heure, mets tes mitaines les plus laides — c'est les plus chaudes — pis lâche pas ton café.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039813/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813573.png', 'Conseils'],
      ['Microclimats 101 : pourquoi ton voisin a pas la même météo que toé', "Dans les Laurentides, la météo se joue au coin de rue près. Un versant au soleil, un fond de vallée à l'ombre, un lac qui fait son frais : chaque coin a son caractère.\n\nC'est ça, un microclimat : une petite bulle de météo locale qui fait mentir la moyenne régionale. La radio te dit « quelques flocons », pis Morin-Heights ramasse trente centimètres pendant que Saint-Sauveur voit passer trois flocons de courtoisie.\n\nC'est exactement pour ça qu'on existe : on regarde la météo village par village. Pas de moyenne diluée, pas de cachette.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039813/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813194.png', 'Bulletin'],
      ['La canicule dans le Nord : mythe ou réalité ?', "On pense aux Laurentides pour le ski pis les bancs de neige, mais nos étés savent fesser fort. Quand l'humidex embarque, le fond de vallée de Saint-Sauveur se transforme en fournaise.\n\nLes lacs sauvent la mise : une saucette au lac des Sables pis la vie recommence. Mais en haut des monts, le vent garde la tête froide — littéralement. Dix degrés de différence entre le stationnement pis le sommet, c'est pas rare.\n\nMoralité : en canicule, monte en altitude ou saute dans le lac. Les deux, c'est encore mieux.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039813/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813099.png', 'Saison']
    ];
    for (const p of posts) await db.run('INSERT INTO posts (title, content, image_url, category, published) VALUES ($1, $2, $3, $4, 1)', p);
  }

  const nS = await db.get('SELECT COUNT(*)::int AS n FROM signalements');
  if (!nS || Number(nS.n) === 0) {
    async function idVillage(slug) { const r = await db.get('SELECT id FROM villages WHERE slug = $1', [slug]); return r ? r.id : null; }
    const sigs = [
      ['Ginette du village', await idVillage('val-david'), 'pluie', 'Y mouille tellement que mon gazon a des vagues. Le chat refuse de sortir depuis mardi.'],
      ['Réal', await idVillage('saint-donat'), 'neige', "J'ai pardu mon char dans l'banc de neige à matin. Si quelqu'un le trouve, y'é bleu. Je pense."],
      ['Mado', await idVillage('sainte-agathe'), 'soleil', "Beau soleil su'l lac, mais le vent m'a décoiffée raide. Ça compte-tu comme une marde partielle ?"],
      ['Ti-Guy de la 117', await idVillage('morin-heights'), 'frette', 'Mon thermomètre a lâché à moins trente. Je pense qu\'y était juste découragé.']
    ];
    for (const s of sigs) await db.run('INSERT INTO signalements (nom, village_id, condition, message, approuve) VALUES ($1, $2, $3, $4, 1)', s);
  }
};
