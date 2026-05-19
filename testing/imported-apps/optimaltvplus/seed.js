module.exports = async function(db) {
  const settings = [
    ['contact_email', null],
    ['contact_phone', null],
    ['business_name', null],
    ['business_address', null],
    ['tagline_fr', "L'IPTV nouvelle génération"],
    ['tagline_en', 'Next-generation IPTV'],
    ['hero_title_fr', 'Streaming illimité en qualité Ultra HD'],
    ['hero_title_en', 'Unlimited streaming in Ultra HD quality'],
    ['hero_subtitle_fr', 'Plus de 10 000 chaînes en direct, films et séries à la demande. Disponible sur tous vos appareils.'],
    ['hero_subtitle_en', 'Over 10,000 live channels, movies and series on demand. Available on all your devices.'],
    ['about_text_fr', "Optimal TV Plus est votre passerelle vers le divertissement sans frontières. Nous offrons un service IPTV premium avec plus de 10 000 chaînes en direct, des dizaines de milliers de films et séries à la demande, le tout en qualité 4K Ultra HD. Notre infrastructure de serveurs ultrarapides garantit un streaming fluide sans interruption, où que vous soyez."],
    ['about_text_en', 'Optimal TV Plus is your gateway to entertainment without borders. We offer premium IPTV service with over 10,000 live channels, tens of thousands of movies and series on demand, all in 4K Ultra HD quality. Our ultra-fast server infrastructure ensures smooth streaming without interruption, wherever you are.'],
    ['payment_etransfer_email', ''],
    ['payment_instructions_fr', "Envoyez le montant exact par virement Interac à l'adresse courriel ci-dessus. Indiquez votre numéro de commande dans le message. Votre abonnement sera activé dans les 30 minutes suivant la réception du paiement."],
    ['payment_instructions_en', 'Send the exact amount via Interac e-Transfer to the email above. Include your order number in the message. Your subscription will be activated within 30 minutes of payment receipt.']
  ];
  for (const [k, v] of settings) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778609717/tapavis_tenant_optimaltvplus/build_optimaltvplus_1778609716936.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778609724/tapavis_tenant_optimaltvplus/build_optimaltvplus_1778609724549.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_devices_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778609716/tapavis_tenant_optimaltvplus/build_optimaltvplus_1778609716503.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_cta_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778609725/tapavis_tenant_optimaltvplus/build_optimaltvplus_1778609724977.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");

  const planCount = await db.get('SELECT COUNT(*)::int AS c FROM plans');
  if (!planCount || planCount.c === 0) {
    await db.run("INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, image_url, badge, featured, sort_order, active) VALUES ('Essentiel', 'Essential', 'Idéal pour découvrir le service.', 'Perfect to discover the service.', 1499, 30, '5 000+ chaînes\nQualité HD 1080p\n1 appareil simultané\nSupport par courriel\nVOD inclus', '5,000+ channels\nHD 1080p quality\n1 simultaneous device\nEmail support\nVOD included', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778609735/tapavis_tenant_optimaltvplus/build_optimaltvplus_1778609735474.png', NULL, 0, 1, 1)");
    await db.run("INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, image_url, badge, featured, sort_order, active) VALUES ('Famille', 'Family', 'Le meilleur rapport qualité-prix.', 'Best value for the family.', 2499, 30, '10 000+ chaînes\nQualité 4K Ultra HD\n3 appareils simultanés\nSupport prioritaire 24/7\nVOD + Séries premium\nGuide TV intégré', '10,000+ channels\n4K Ultra HD quality\n3 simultaneous devices\n24/7 priority support\nVOD + Premium series\nIntegrated TV guide', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778609727/tapavis_tenant_optimaltvplus/build_optimaltvplus_1778609727042.png', 'POPULAIRE', 1, 2, 1)");
    await db.run("INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, image_url, badge, featured, sort_order, active) VALUES ('Premium', 'Premium', 'L''expérience ultime sans compromis.', 'The ultimate no-compromise experience.', 3999, 30, '15 000+ chaînes mondiales\nQualité 4K HDR\n5 appareils simultanés\nSupport VIP dédié 24/7\nVOD illimité + Adulte\nChaînes PPV incluses\nEnregistrement cloud', '15,000+ global channels\n4K HDR quality\n5 simultaneous devices\nDedicated VIP 24/7 support\nUnlimited VOD + Adult\nPPV channels included\nCloud recording', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778609717/tapavis_tenant_optimaltvplus/build_optimaltvplus_1778609717593.png', 'VIP', 0, 3, 1)");
    await db.run("INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, image_url, badge, featured, sort_order, active) VALUES ('Annuel Famille', 'Annual Family', '12 mois au prix de 10 - économisez 50$.', '12 months at the price of 10 - save $50.', 24999, 365, '10 000+ chaînes\nQualité 4K Ultra HD\n3 appareils simultanés\nSupport 24/7\nÉconomie de 50$\nGarantie de remboursement 7 jours', '10,000+ channels\n4K Ultra HD quality\n3 simultaneous devices\n24/7 support\n$50 savings\n7-day money back', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778609727/tapavis_tenant_optimaltvplus/build_optimaltvplus_1778609727042.png', 'MEILLEURE OFFRE', 0, 4, 1)");
  }

  // Firstaru server plans
  const firstCheck = await db.get("SELECT COUNT(*)::int AS c FROM plans WHERE LOWER(name) LIKE 'firstaru%'");
  if (!firstCheck || firstCheck.c === 0) {
    const faruFeats = '10 000+ chaînes\nQualité 4K Ultra HD\nServeur Firstaru Premium\nMulti-appareils\nSupport 24/7\nActivation en moins de 30 min';
    const faruFeatsEn = '10,000+ channels\n4K Ultra HD quality\nFirstaru Premium Server\nMulti-device\n24/7 Support\nActivation in under 30 min';
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Firstaru 1 Mois', 'Firstaru 1 Month', 'Abonnement Firstaru 1 mois.', 'Firstaru 1-month subscription.', 3000, 30, faruFeats, faruFeatsEn, null, 0, 20, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Firstaru 3 Mois', 'Firstaru 3 Months', 'Abonnement Firstaru 3 mois — économisez 15 $.', 'Firstaru 3-month subscription — save $15.', 7500, 90, faruFeats, faruFeatsEn, null, 0, 21, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Firstaru 6 Mois', 'Firstaru 6 Months', 'Abonnement Firstaru 6 mois — économisez 40 $.', 'Firstaru 6-month subscription — save $40.', 14000, 180, faruFeats, faruFeatsEn, null, 0, 22, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Firstaru 12 Mois', 'Firstaru 12 Months', 'Abonnement Firstaru 12 mois — meilleure offre!', 'Firstaru 12-month subscription — best deal!', 25000, 365, faruFeats, faruFeatsEn, 'MEILLEURE OFFRE', 0, 23, 1]);
  }

  // Omega server plans
  const omegaCheck = await db.get("SELECT COUNT(*)::int AS c FROM plans WHERE LOWER(name) LIKE 'omega%'");
  if (!omegaCheck || omegaCheck.c === 0) {
    const omegaFeats = '10 000+ chaînes\nQualité 4K Ultra HD\nServeur Omega Premium\nMulti-appareils\nSupport 24/7\nActivation en moins de 30 min';
    const omegaFeatsEn = '10,000+ channels\n4K Ultra HD quality\nOmega Premium Server\nMulti-device\n24/7 Support\nActivation in under 30 min';
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Omega 1 Mois', 'Omega 1 Month', 'Abonnement Omega 1 mois.', 'Omega 1-month subscription.', 2500, 30, omegaFeats, omegaFeatsEn, null, 0, 30, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Omega 3 Mois', 'Omega 3 Months', 'Abonnement Omega 3 mois — économisez 15 $.', 'Omega 3-month subscription — save $15.', 6000, 90, omegaFeats, omegaFeatsEn, null, 0, 31, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Omega 6 Mois', 'Omega 6 Months', 'Abonnement Omega 6 mois — économisez 50 $.', 'Omega 6-month subscription — save $50.', 10000, 180, omegaFeats, omegaFeatsEn, null, 0, 32, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Omega 12 Mois', 'Omega 12 Months', 'Abonnement Omega 12 mois — meilleure offre!', 'Omega 12-month subscription — best deal!', 20000, 365, omegaFeats, omegaFeatsEn, 'MEILLEURE OFFRE', 0, 33, 1]);
  }

  // Edge server plans
  const edgeCheck = await db.get("SELECT COUNT(*)::int AS c FROM plans WHERE LOWER(name) LIKE 'edge%'");
  if (!edgeCheck || edgeCheck.c === 0) {
    const edgeFeats = '10 000+ chaînes\nQualité 4K Ultra HD\nServeur Edge Premium\nMulti-appareils\nSupport 24/7\nActivation en moins de 30 min';
    const edgeFeatsEn = '10,000+ channels\n4K Ultra HD quality\nEdge Premium Server\nMulti-device\n24/7 Support\nActivation in under 30 min';
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Edge 1 Mois', 'Edge 1 Month', 'Abonnement Edge 1 mois.', 'Edge 1-month subscription.', 2000, 30, edgeFeats, edgeFeatsEn, null, 0, 40, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Edge 3 Mois', 'Edge 3 Months', 'Abonnement Edge 3 mois — économisez 10 $.', 'Edge 3-month subscription — save $10.', 5000, 90, edgeFeats, edgeFeatsEn, null, 0, 41, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Edge 6 Mois', 'Edge 6 Months', 'Abonnement Edge 6 mois — économisez 40 $.', 'Edge 6-month subscription — save $40.', 8000, 180, edgeFeats, edgeFeatsEn, null, 0, 42, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Edge 12 Mois', 'Edge 12 Months', 'Abonnement Edge 12 mois — meilleure offre!', 'Edge 12-month subscription — best deal!', 15000, 365, edgeFeats, edgeFeatsEn, 'MEILLEURE OFFRE', 0, 43, 1]);
  }

  // Trex server plans
  const trexCheck = await db.get("SELECT COUNT(*)::int AS c FROM plans WHERE LOWER(name) LIKE 'trex%'");
  if (!trexCheck || trexCheck.c === 0) {
    const trexFeats = '10 000+ chaînes\nQualité HD/4K Ultra HD\nServeur Trex Premium\nChaînes du Québec incluses\nSports en direct & PPV\nFilms et séries sur demande\nSupport 24/7\nActivation en moins de 30 min';
    const trexFeatsEn = '10,000+ channels\nHD/4K Ultra HD quality\nTrex Premium Server\nQuebec channels included\nLive sports & PPV\nMovies and series on demand\n24/7 Support\nActivation in under 30 min';
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Trex 1 Mois', 'Trex 1 Month', 'Abonnement TREX LIVE 1 mois.', 'TREX LIVE 1-month subscription.', 2000, 30, trexFeats, trexFeatsEn, null, 0, 50, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Trex 3 Mois', 'Trex 3 Months', 'Abonnement TREX LIVE 3 mois — économisez 10 $.', 'TREX LIVE 3-month subscription — save $10.', 5000, 90, trexFeats, trexFeatsEn, null, 0, 51, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Trex 6 Mois', 'Trex 6 Months', 'Abonnement TREX LIVE 6 mois — économisez 40 $.', 'TREX LIVE 6-month subscription — save $40.', 8000, 180, trexFeats, trexFeatsEn, null, 0, 52, 1]);
    await db.run('INSERT INTO plans (name, name_en, description, description_en, price_cents, duration_days, features, features_en, badge, featured, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)', ['Trex 12 Mois', 'Trex 12 Months', 'Abonnement TREX LIVE 12 mois — meilleure offre!', 'TREX LIVE 12-month subscription — best deal!', 14000, 365, trexFeats, trexFeatsEn, 'MEILLEURE OFFRE', 0, 53, 1]);
  }

  // Formuler devices
  const formulerCheck = await db.get("SELECT COUNT(*)::int AS c FROM formuler_products");
  if (!formulerCheck || formulerCheck.c === 0) {
    await db.run(
      'INSERT INTO formuler_products (name, name_en, description, description_en, price_cents, features, features_en, image_url, badge, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [
        'Formuler Z10', 'Formuler Z10',
        'Boîtier Android 4K HDR10+ avec lecteur multimédia myTV Online 2 préinstallé. Compatible avec tous les services IPTV.',
        'Android 4K HDR10+ set-top box with myTV Online 2 pre-installed. Compatible with all IPTV services.',
        16000,
        'Android 10\nCPU Quad-core\n2GB RAM / 8GB ROM\n4K HDR10+\nUSB 3.0\nmyTV Online 2 préinstallé\nTélécommande IR premium',
        'Android 10\nQuad-core CPU\n2GB RAM / 8GB ROM\n4K HDR10+\nUSB 3.0\nmyTV Online 2 pre-installed\nPremium IR remote',
        'https://res.cloudinary.com/duhp69meg/image/upload/v1778771061/managed_agent_updates/ma_update_image_1778771061394.png',
        null, 1, 1
      ]
    );
    await db.run(
      'INSERT INTO formuler_products (name, name_en, description, description_en, price_cents, features, features_en, image_url, badge, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [
        'Formuler Z11 Pro', 'Formuler Z11 Pro',
        'Boîtier Android premium avec texture carbone, 16 Go de stockage et support HDR10+. La référence en matière de streaming IPTV.',
        'Premium Android set-top box with carbon texture, 16GB storage and HDR10+ support. The reference for IPTV streaming.',
        21000,
        'Android 11\nCPU Quad-core\n2GB RAM / 16GB ROM\n4K HDR10+\nMicro SD\nmyTV Online 3 préinstallé\nTélécommande IR premium\nDesign carbone premium',
        'Android 11\nQuad-core CPU\n2GB RAM / 16GB ROM\n4K HDR10+\nMicro SD slot\nmyTV Online 3 pre-installed\nPremium IR remote\nPremium carbon design',
        'https://res.cloudinary.com/duhp69meg/image/upload/v1778771103/managed_agent_updates/ma_update_image_1778771103595.png',
        'TOP VENTE', 2, 1
      ]
    );
    await db.run(
      'INSERT INTO formuler_products (name, name_en, description, description_en, price_cents, features, features_en, image_url, badge, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [
        'Formuler Z mini', 'Formuler Z mini',
        'Dongle IPTV ultra-compact se branchant directement sur votre port HDMI. La solution IPTV la plus portable du marché.',
        'Ultra-compact IPTV dongle plugging directly into your HDMI port. The most portable IPTV solution on the market.',
        18000,
        'Android 9\n1GB RAM / 8GB ROM\n4K HDR\nHDMI direct\nmyTV Online 2 préinstallé\nTélécommande BT vocale\nUltra-compact et portable',
        'Android 9\n1GB RAM / 8GB ROM\n4K HDR\nDirect HDMI\nmyTV Online 2 pre-installed\nBluetooth voice remote\nUltra-compact and portable',
        'https://res.cloudinary.com/duhp69meg/image/upload/v1778771144/managed_agent_updates/ma_update_image_1778771144235.png',
        null, 3, 1
      ]
    );
  }

  const testCount = await db.get('SELECT COUNT(*)::int AS c FROM testimonials');
  if (!testCount || testCount.c === 0) {
    await db.run("INSERT INTO testimonials (author, role, content, content_en, rating, published) VALUES ('Mathieu G.', 'Montréal, QC', 'Le meilleur service IPTV que j''ai essayé! Aucune coupure, qualité 4K impeccable et le support client répond en quelques minutes. Je recommande à 100%.', 'The best IPTV service I have tried! No cuts, impeccable 4K quality and customer support responds in minutes. 100% recommended.', 5, 1)");
    await db.run("INSERT INTO testimonials (author, role, content, content_en, rating, published) VALUES ('Sophie R.', 'Québec, QC', 'Je regarde toutes les chaînes francophones et internationales sur ma Smart TV. L''installation a pris moins de 5 minutes! Excellent rapport qualité-prix.', 'I watch all French-language and international channels on my Smart TV. Setup took less than 5 minutes! Excellent value.', 5, 1)");
    await db.run("INSERT INTO testimonials (author, role, content, content_en, rating, published) VALUES ('Karim B.', 'Laval, QC', 'Plus besoin du câble! Pour le prix d''un mois chez le câblodistributeur, j''ai 1 an de chaînes du monde entier. Service au top.', 'No more cable! For the price of one month with the cable provider, I get 1 year of worldwide channels. Top service.', 5, 1)");
    await db.run("INSERT INTO testimonials (author, role, content, content_en, rating, published) VALUES ('Élodie T.', 'Sherbrooke, QC', 'Le forfait Famille est parfait, je l''utilise sur 3 appareils en même temps. Le contenu jeunesse pour les enfants est fantastique.', 'The Family plan is perfect, I use it on 3 devices at the same time. The kids content is fantastic.', 5, 1)");
    await db.run("INSERT INTO testimonials (author, role, content, content_en, rating, published) VALUES ('Daniel L.', 'Gatineau, QC', 'Fan de hockey et de soccer, j''ai accès à toutes les chaînes sportives. Le streaming est fluide même en 4K. Bravo!', 'Hockey and soccer fan, I have access to all sports channels. Streaming is smooth even in 4K. Bravo!', 5, 1)");
  }

  const chanCount = await db.get('SELECT COUNT(*)::int AS c FROM channels');
  if (!chanCount || chanCount.c === 0) {
    const chans = [
      ['TVA Sports', 'Sport', 'Canada', 1],
      ['RDS', 'Sport', 'Canada', 1],
      ['beIN Sports', 'Sport', 'International', 1],
      ['Sky Sports', 'Sport', 'Royaume-Uni', 1],
      ['HBO', 'Cinéma', 'États-Unis', 1],
      ['Netflix Live', 'Cinéma', 'International', 0],
      ['Disney+', 'Famille', 'International', 1],
      ['TF1', 'Généraliste', 'France', 1],
      ['Radio-Canada', 'Généraliste', 'Canada', 1],
      ['CNN', 'Actualités', 'États-Unis', 0],
      ['BBC World', 'Actualités', 'Royaume-Uni', 0],
      ['Discovery', 'Documentaire', 'International', 0]
    ];
    for (const [n, c, co, f] of chans) {
      await db.run('INSERT INTO channels (name, category, country, featured) VALUES ($1, $2, $3, $4)', [n, c, co, f]);
    }
  }

  const postCount = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (!postCount || postCount.c === 0) {
    await db.run("INSERT INTO posts (title, content, category, published) VALUES ('Nouvelles chaînes ajoutées en novembre', 'Ce mois-ci, nous avons ajouté plus de 200 nouvelles chaînes à notre catalogue, incluant des chaînes sportives internationales et des chaînes premium en 4K. Connectez-vous à votre espace membre pour les découvrir.', 'Nouveautés', 1)");
    await db.run("INSERT INTO posts (title, content, category, published) VALUES ('Comment installer Optimal TV Plus sur votre Smart TV', 'L''installation est simple et rapide. Étape 1: Téléchargez l''application IPTV Smarters Pro. Étape 2: Entrez vos identifiants reçus par courriel. Étape 3: Profitez! Le tout en moins de 5 minutes.', 'Guides', 1)");
    await db.run("INSERT INTO posts (title, content, category, published) VALUES ('Promotion spéciale: -20% sur les abonnements annuels', 'Pour une durée limitée, économisez 20% sur tous nos forfaits annuels. Utilisez le code promo IPTV20 lors de votre commande.', 'Promotions', 1)");
    await db.run("INSERT INTO posts (title, content, category, published) VALUES ('Les meilleurs appareils pour regarder l''IPTV', 'Découvrez notre sélection des meilleurs appareils compatibles avec notre service: Amazon Fire TV Stick 4K, MAG 524, Formuler Z11, et bien plus.', 'Guides', 1)");
  }
};
