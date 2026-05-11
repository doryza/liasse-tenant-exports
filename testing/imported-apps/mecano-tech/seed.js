module.exports = async function(db) {
  const settings = [
    ['business_name', 'MécanoTech'],
    ['tagline', 'L\'assistant intelligent du mécanicien moderne'],
    ['hero_title', 'Diagnostiquez plus vite, réparez mieux'],
    ['hero_subtitle', 'Diagnostics IA, reconnaissance de pièces par photo, guidage vocal et inventaire intégré. Tout ce dont vous avez besoin, dans votre poche.'],
    ['about_text', 'MécanoTech accompagne les mécaniciens à chaque étape de leur journée. Décrivez un problème à voix haute, prenez en photo une pièce inconnue, suivez une procédure pas à pas — sans jamais lâcher vos outils.'],
    ['contact_email', 'jimmybernard47@gmail.com'],
    ['contact_phone', ''],
    ['business_address', ''],
    ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778485222/tapavis_tenant_mecano-tech/build_mecano-tech_1778485222439.png']
  ];
  for (var i = 0; i < settings.length; i++) {
    var s = settings[i];
    if (s[0].indexOf('_p_') === 0 || s[0].indexOf('image_url') !== -1) {
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [s[0], s[1]]);
    } else {
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO NOTHING', [s[0], s[1]]);
    }
  }

  const diagCount = await db.get('SELECT COUNT(*)::int AS c FROM diagnostics');
  if (diagCount.c === 0) {
    const diagnostics = [
      ['Voyant moteur allumé — code P0420', 'Tous véhicules à essence', 'Modérée', 'Voyant moteur allumé en continu\nLégère perte de performance possible\nConsommation d\'essence accrue', 'Catalyseur usé ou inefficace\nCapteur d\'oxygène défectueux (aval)\nFuite d\'échappement avant le catalyseur\nRatés d\'allumage non corrigés', 'Vérifier les codes secondaires avant tout remplacement\nInspecter visuellement l\'échappement à la recherche de fuites\nTester les capteurs O2 amont et aval — le capteur aval est souvent en cause et coûte 4× moins cher que le catalyseur\nNettoyer le système avec un additif de qualité avant remplacement', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778485220/tapavis_tenant_mecano-tech/build_mecano-tech_1778485220342.png'],
      ['Bruit de claquement au démarrage à froid', 'Moteur 4 cyl., souvent kilométrage élevé', 'Modérée', 'Cliquetis métallique pendant 5 à 30 secondes après démarrage à froid\nDisparaît une fois le moteur chaud', 'Tendeur de chaîne de distribution faible\nPoulie folle défectueuse\nUsure des paliers de bielle (cas plus grave)\nNiveau d\'huile bas ou huile de mauvaise qualité', 'Vérifier d\'abord le niveau et la qualité de l\'huile — solution gratuite\nInspecter la tension de la courroie accessoire\nÉcouter avec un stéthoscope mécanique pour localiser la source\nRemplacer le tendeur de chaîne avant la chaîne complète', null],
      ['Vibration au freinage', 'Tous véhicules', 'Modérée', 'Volant qui tremble lors du freinage à haute vitesse\nPédale de frein qui pulse', 'Disques de frein voilés (souvent par surchauffe)\nPlaquettes inégales ou collées\nÉtriers grippés\nRoulement de roue endommagé', 'Mesurer le voilage des disques avec un comparateur (économique)\nUsiner les disques au tour si l\'épaisseur le permet — moitié prix d\'un remplacement\nNettoyer et regraisser les coulisses d\'étriers\nRemplacer uniquement si nécessaire', null],
      ['Démarrage difficile à chaud', 'Injection essence', 'Modérée', 'Le moteur peine à démarrer après un arrêt court par temps chaud\nDémarrage normal à froid', 'Sonde de température moteur défectueuse\nRégulateur de pression d\'essence qui fuit\nInjecteurs qui gouttent\nProblème de masse électrique', 'Tester la sonde CTS avec un multimètre — souvent une simple correction\nVérifier la pression résiduelle du circuit essence\nNettoyer les masses moteur (gratuit !)\nTest d\'injecteurs si nécessaire', null],
      ['Surchauffe moteur intermittente', 'Tous véhicules', 'Élevée', 'Température qui monte en circulation lente\nRetour à la normale en autoroute\nVentilateur qui ne se déclenche pas systématiquement', 'Thermostat partiellement bloqué\nVentilateur électrique défectueux\nRadiateur encrassé extérieurement\nPompe à eau en fin de vie', 'Tester le fonctionnement du ventilateur en pontant le relais — diagnostic gratuit\nNettoyer le radiateur à l\'air comprimé avant remplacement\nRincer le circuit de refroidissement\nRemplacer le thermostat avant la pompe (10× moins cher)', null],
      ['Boîte automatique qui patine', 'Boîte automatique conventionnelle', 'Élevée', 'Régime moteur qui monte sans accélération proportionnelle\nPassages de vitesses brutaux ou inexistants\nFluide ATF noir ou brûlé', 'Niveau d\'ATF bas ou contaminé\nFiltre de transmission colmaté\nÉlectrovannes (solénoïdes) défectueuses\nUsure interne avancée', 'Vérifier le niveau et l\'état de l\'ATF en premier — réparation potentielle à 50 $\nVidange + filtre avant tout autre intervention\nDiagnostic électronique pour identifier la solénoïde en cause\nÉviter le rinçage complet si fluide noir (peut aggraver)', null]
    ];
    for (var i = 0; i < diagnostics.length; i++) {
      const d = diagnostics[i];
      await db.run('INSERT INTO diagnostics (title, vehicle_type, severity, symptoms, causes, solutions, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)', d);
    }
  }

  const procCount = await db.get('SELECT COUNT(*)::int AS c FROM procedures');
  if (procCount.c === 0) {
    const procs = [
      ['Vidange d\'huile moteur complète', 'Vidange standard avec remplacement du filtre. Procédure de base à maîtriser parfaitement.', 'Facile', 30, 'Clé à filtre, bac de vidange, cric ou pont, chandelles, entonnoir, clé carrée 8 mm ou 3/8 po, gants', '1. Faire tourner le moteur 2-3 minutes pour fluidifier l\'huile\n2. Lever le véhicule et sécuriser sur chandelles\n3. Placer le bac sous le bouchon de vidange\n4. Dévisser le bouchon avec précaution (huile chaude)\n5. Laisser couler 10 minutes minimum\n6. Remplacer le joint du bouchon si nécessaire\n7. Resserrer le bouchon au couple constructeur\n8. Retirer l\'ancien filtre à huile\n9. Lubrifier le joint du nouveau filtre avec de l\'huile neuve\n10. Visser le nouveau filtre à la main + 3/4 de tour\n11. Remplir avec la quantité spécifiée d\'huile neuve\n12. Faire tourner le moteur 1 minute et vérifier les fuites\n13. Couper le moteur, attendre 5 minutes et vérifier le niveau à la jauge\n14. Compléter si nécessaire\n15. Réinitialiser l\'indicateur de vidange sur le tableau de bord', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778485221/tapavis_tenant_mecano-tech/build_mecano-tech_1778485221583.png', ''],
      ['Remplacement des plaquettes de frein avant', 'Procédure complète pour des freins avant à disque ventilé. Inspection des disques incluse.', 'Moyen', 60, 'Cric, chandelles, clé à roue, clés Allen ou Torx, repousse-piston, lubrifiant céramique haute température, pinceau, brosse métallique', '1. Desserrer les écrous de roue avant de lever le véhicule\n2. Lever et sécuriser sur chandelles\n3. Retirer la roue complètement\n4. Inspecter l\'état des plaquettes et du disque\n5. Retirer les vis de l\'étrier (généralement 2)\n6. Soulever l\'étrier et le suspendre — ne pas laisser pendre par le flexible\n7. Retirer les anciennes plaquettes\n8. Repousser le piston d\'étrier avec l\'outil approprié\n9. Vérifier le niveau de liquide de frein (risque de débordement)\n10. Nettoyer la cage de l\'étrier à la brosse\n11. Appliquer du lubrifiant sur les points de contact\n12. Installer les nouvelles plaquettes\n13. Remettre l\'étrier et serrer au couple\n14. Remonter la roue et serrer à la main\n15. Pomper la pédale plusieurs fois avant de rouler', null, ''],
      ['Remplacement des bougies d\'allumage', 'Procédure pour moteur 4 cylindres en ligne. Manipulation délicate des bobines individuelles.', 'Facile', 45, 'Douille à bougie avec aimant, rallonge, cliquet, jauge d\'écartement, antigrippant haute température', '1. Moteur froid obligatoire\n2. Débrancher la batterie (négatif)\n3. Localiser et déclipper les bobines individuelles\n4. Retirer les vis de fixation des bobines\n5. Extraire chaque bobine avec précaution\n6. Nettoyer l\'orifice à l\'air comprimé pour éviter chute de débris\n7. Dévisser l\'ancienne bougie avec la douille aimantée\n8. Vérifier l\'écartement de la nouvelle bougie\n9. Appliquer une fine couche d\'antigrippant sur le filetage\n10. Visser à la main puis serrer au couple (généralement 18-25 N·m)\n11. Réinstaller la bobine\n12. Répéter pour chaque cylindre\n13. Rebrancher la batterie\n14. Démarrer et vérifier le bon fonctionnement', null, ''],
      ['Remplacement de la courroie de distribution', 'Procédure expert. Le timing doit être parfait — toute erreur peut endommager le moteur.', 'Expert', 240, 'Outils de calage moteur, clé dynamométrique, kit complet de distribution, support moteur, douilles longues', '1. Étudier le manuel constructeur — chaque moteur est différent\n2. Débrancher la batterie\n3. Lever le véhicule et déposer la roue avant droite\n4. Retirer le carter de protection inférieur\n5. Soutenir le moteur par dessous\n6. Déposer le support moteur supérieur\n7. Retirer les caches de distribution\n8. Mettre le moteur au PMH en alignant les repères de calage\n9. Installer les outils de calage pour bloquer arbres à cames et vilebrequin\n10. Détendre puis retirer l\'ancienne courroie\n11. Remplacer le tendeur et la pompe à eau (recommandé)\n12. Installer la nouvelle courroie en respectant le sens\n13. Régler la tension selon les spécifications\n14. Tourner le moteur à la main sur 2 tours pour vérifier le calage\n15. Remonter dans l\'ordre inverse et tester', null, ''],
      ['Purge du circuit de freinage', 'Purge en circuit fermé pour évacuer l\'air après intervention sur les freins.', 'Moyen', 45, 'Clé à purger, tuyau transparent, bouteille de récupération, liquide de frein DOT neuf, assistant ou outil de purge sous vide', '1. Vérifier le type de liquide spécifié par le constructeur\n2. Remplir le bocal de maître-cylindre à niveau MAX\n3. Commencer par l\'étrier le plus éloigné du maître-cylindre\n4. Brancher le tuyau sur la vis de purge\n5. Faire pomper la pédale 3-4 fois par l\'assistant\n6. Maintenir la pédale enfoncée\n7. Ouvrir la vis de purge — laisser couler\n8. Refermer avant de relâcher la pédale\n9. Répéter jusqu\'à liquide propre sans bulles\n10. Surveiller constamment le niveau dans le bocal\n11. Passer à l\'étrier suivant dans l\'ordre\n12. Terminer par l\'étrier le plus proche\n13. Vérifier la fermeté de la pédale\n14. Compléter le niveau au repère MAX\n15. Test routier en zone sécurisée', null, '']
    ];
    for (var i = 0; i < procs.length; i++) {
      await db.run('INSERT INTO procedures (title, description, difficulty, duration_min, tools_needed, steps, image_url, video_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', procs[i]);
    }
  }

  const partCount = await db.get('SELECT COUNT(*)::int AS c FROM parts');
  if (partCount.c === 0) {
    const parts = [
      ['Plaquettes de frein avant céramique', 'BP-2245-A', 'Freinage', 'Plaquettes céramique haute performance, faible production de poussière, freinage progressif. Compatibles avec la plupart des berlines compactes.', 'Matériau: composé céramique\nÉpaisseur neuve: 12 mm\nÉpaisseur mini: 3 mm\nIndicateur d\'usure intégré', 89.99, 18, 'https://res.cloudinary.com/duhp69meg/image/upload/v1778485225/tapavis_tenant_mecano-tech/build_mecano-tech_1778485225071.png'],
      ['Filtre à huile moteur premium', 'FT-9921', 'Moteur', 'Filtre à huile spin-on avec valve anti-retour et media synthétique. Filtration jusqu\'à 99% à 25 microns.', 'Filtration: 99% à 25 μm\nCapacité: 14 g de contaminants\nValve anti-retour: oui', 12.50, 45, null],
      ['Capteur d\'oxygène aval universel', 'O2-AVAL-4F', 'Échappement', 'Capteur lambda 4 fils pour position aval (après catalyseur). Compatible OBD-II. Économique vs. pièces d\'origine.', 'Type: chauffé 4 fils\nTension: 0,1-0,9 V\nTemps de chauffe: <15 s\nFil universel à raccorder', 65.00, 9, null],
      ['Bougies d\'allumage iridium (jeu de 4)', 'IR-PLT-04', 'Allumage', 'Jeu de 4 bougies à pointe iridium longue durée (jusqu\'à 100 000 km). Démarrage facile, économie de carburant améliorée.', 'Type: iridium fine pointe\nÉcartement: 0,80 mm pré-réglé\nLongévité: 100 000 km\nCouple de serrage: 22 N·m', 48.00, 22, null],
      ['Tendeur de courroie accessoire', 'TC-2188', 'Moteur', 'Tendeur automatique à ressort pour courroie serpentine. Remplacement recommandé tous les 100 000 km ou avec la courroie.', 'Type: automatique à ressort\nDiamètre poulie: 70 mm\nFiletage: M10 × 1,5\nMatière: acier estampé', 56.75, 7, null],
      ['Filtre à air moteur haute performance', 'FA-5572', 'Admission', 'Filtre à air panel haute capacité. Compatible avec la plupart des moteurs 4 cylindres récents.', 'Surface filtrante: 280 cm²\nEfficacité: 98% à 10 μm\nLavable: non\nIntervalle: 24 000 km', 24.99, 28, null],
      ['Joint de bouchon de vidange (sachet de 10)', 'JT-CRUSH-10', 'Vidange', 'Joints écrasables en cuivre/aluminium pour bouchon de vidange. À remplacer à chaque vidange.', 'Matière: aluminium recuit\nDiamètre intérieur: 14 mm\nÉpaisseur: 1,5 mm', 4.50, 120, null]
    ];
    for (var i = 0; i < parts.length; i++) {
      await db.run('INSERT INTO parts (name, part_number, category, description, specs, price, stock, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', parts[i]);
    }
  }

  const postCount = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (postCount.c === 0) {
    const posts = [
      ['5 astuces pour économiser sur les réparations de freinage', 'Astuces économiques', 'Avant de remplacer un système de freinage complet, vérifiez si le voilage des disques peut être corrigé par un simple usinage au tour. Mesurez l\'épaisseur résiduelle avec un micromètre — si elle est supérieure à la cote mini constructeur + 1 mm, l\'usinage est possible. Économie potentielle: 60% sur le coût pièces. Pensez aussi à nettoyer et regraisser les coulisses d\'étriers avant tout diagnostic — un grippage est souvent confondu avec une usure prématurée des plaquettes.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778485225/tapavis_tenant_mecano-tech/build_mecano-tech_1778485225605.png', 1],
      ['Comment lire un code OBD-II comme un pro', 'Diagnostics', 'Un code défaut ne vous dit jamais quoi remplacer — il vous dit où chercher. Le code P0420 (rendement catalyseur faible) ne signifie pas systématiquement un catalyseur défectueux. Dans 40% des cas, c\'est le capteur O2 aval qui est en cause. Toujours croiser le code avec les données en temps réel: tension du capteur O2 aval, températures, ratés d\'allumage. Un bon scanner avec graphique vaut son pesant d\'or — comptez 200-400 $ pour un appareil semi-pro.', null, 1],
      ['L\'importance du couple de serrage', 'Techniques', 'Le couple de serrage n\'est pas une suggestion — c\'est une science. Un boulon sous-serré peut se desserrer en service; un boulon trop serré peut fluer ou casser. Investissez dans une clé dynamométrique de qualité (75-150 $) et un schéma de couples adapté à votre marché. Les bougies, les écrous de roue et les boulons de chapeau de palier sont les pièces les plus critiques. Sur l\'aluminium, méfiez-vous: 5 N·m de trop suffisent à arracher un filet.', null, 1],
      ['Pourquoi vos clients reviennent pour la même panne', 'Astuces économiques', 'La satisfaction client passe par la prévention. Quand vous remplacez une pièce, prenez 2 minutes pour expliquer la cause réelle et les signes à surveiller. Un client qui comprend revient pour de l\'entretien préventif — pas pour des pannes répétées. Documentez chaque intervention avec photos avant/après. Ça vous protège juridiquement et démontre votre professionnalisme.', null, 1]
    ];
    for (var i = 0; i < posts.length; i++) {
      await db.run('INSERT INTO posts (title, category, content, image_url, published) VALUES ($1,$2,$3,$4,$5)', posts[i]);
    }
  }

  const invCount = await db.get('SELECT COUNT(*)::int AS c FROM inventaire');
  if (invCount.c === 0) {
    const inv = [
      ['Huile moteur 5W-30 synthétique (5L)', 'INV-OIL-5W30-5L', 36, 'Allée A, étagère 1', 'Castrol', 38.50, null],
      ['Liquide de frein DOT 4 (1L)', 'INV-BRK-DOT4-1L', 22, 'Allée A, étagère 2', 'NAPA', 12.75, null],
      ['Antigel longue durée (4L)', 'INV-COOL-LL-4L', 14, 'Allée A, étagère 3', 'Prestone', 24.99, null],
      ['Liquide de transmission ATF Dexron VI (1L)', 'INV-ATF-DEX6-1L', 18, 'Allée A, étagère 2', 'Mobil', 14.50, null],
      ['Graisse haute température (cartouche)', 'INV-GRS-HT', 12, 'Allée B, étagère 1', 'Mobilgrease', 8.99, null],
      ['Nettoyant frein aérosol (500 ml)', 'INV-CLN-BRK', 28, 'Allée B, étagère 2', 'CRC', 6.50, null],
      ['Joints toriques assortis (kit 200 pcs)', 'INV-ORG-KIT', 4, 'Allée C, tiroir 1', 'Générique', 18.00, null],
      ['Colliers de serrage métalliques (boîte 50)', 'INV-CLP-50', 8, 'Allée C, tiroir 2', 'Oetiker', 22.00, null]
    ];
    for (var i = 0; i < inv.length; i++) {
      await db.run('INSERT INTO inventaire (item_name, sku, quantity, location, supplier, unit_price, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)', inv[i]);
    }
  }
};
