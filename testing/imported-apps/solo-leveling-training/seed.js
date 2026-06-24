module.exports = async function(db) {
  const settings = [
    ['tagline', "Réveille le chasseur en toi."],
    ['hero_subtitle', "Suis le protocole d'ascension. Une routine hebdomadaire qui se régénère chaque semaine pour forger le chasseur en toi."],
    ['about_text', "ASCENSION transforme ton entraînement en un protocole de montée en puissance inspiré des chasseurs. Chaque semaine, le Système te confie sept quêtes. Complète-les, gagne de l'expérience et grimpe les rangs, du rang E jusqu'au légendaire rang S."],
    ['business_name', "ASCENSION"]
  ];
  for (const s of settings) { await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [s[0], s[1]]); }
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782260716/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260716069.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782260715/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260715016.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");

  const dcount = await db.get('SELECT COUNT(*)::int AS c FROM routine_days');
  if (!dcount || dcount.c === 0) {
    const days = [
      [0, "Éveil de la Force", "Haut du corps", "Active les muscles du haut du corps pour bâtir une base solide de chasseur.", "Donjon de rang E", 60, "https://res.cloudinary.com/duhp69meg/image/upload/v1782260716/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260716698.png"],
      [1, "Course du Chasseur", "Cardio & endurance", "Augmente ton endurance pour survivre aux donjons les plus longs.", "Donjon de rang D", 55, "https://res.cloudinary.com/duhp69meg/image/upload/v1782260713/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260713586.png"],
      [2, "Forge des Jambes", "Bas du corps", "Forge des jambes capables de te propulser hors du danger.", "Donjon de rang D", 65, "https://res.cloudinary.com/duhp69meg/image/upload/v1782260716/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260716163.png"],
      [3, "Récupération Active", "Mobilité & souplesse", "Régénère ton corps avec mobilité, étirements profonds et respiration.", "Repos actif", 30, "https://res.cloudinary.com/duhp69meg/image/upload/v1782260713/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260713853.png"],
      [4, "Noyau de Mana", "Gainage & abdos", "Renforce ton noyau — la source de toute ta puissance.", "Donjon de rang C", 60, "https://res.cloudinary.com/duhp69meg/image/upload/v1782260715/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260715843.png"],
      [5, "Raid du Boss", "Corps entier · HIIT", "Affronte le boss de la semaine : un entraînement complet et intense.", "Donjon de rang B", 80, "https://res.cloudinary.com/duhp69meg/image/upload/v1782260716/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260716121.png"],
      [6, "Repos du Monarque", "Récupération totale", "Le Monarque se repose. Hydratation, sommeil et préparation mentale.", "Sanctuaire", 20, "https://res.cloudinary.com/duhp69meg/image/upload/v1782260713/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260713853.png"]
    ];
    for (const d of days) { await db.run('INSERT INTO routine_days (day_index, title, focus, description, rank_label, base_xp, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)', d); }

    const EX = {
      0: [
        ["Protocole Alpha", [["Pompes classiques","4","12-15",60,15,"Corps gainé, descends jusqu'à frôler le sol."],["Tractions assistées","4","6-10",90,20,"Tire avec le dos, contrôle la descente."],["Dips sur chaise","3","10-12",60,15,"Coudes vers l'arrière, épaules basses."],["Pompes piquées","3","8-10",60,15,"Bassin haut, vise les épaules."]]],
        ["Protocole Bêta", [["Pompes diamant","4","10-12",60,15,"Mains rapprochées, cible les triceps."],["Rowing élastique","4","12",60,15,"Serre les omoplates en fin de mouvement."],["Pompes inclinées","3","15",45,12,"Mains surélevées pour plus de volume."],["Élévations latérales","3","15",45,12,"Mouvement lent, sans élan."]]],
        ["Protocole Gamma", [["Pompes larges","4","12",60,15,"Mains plus larges que les épaules."],["Tractions négatives","4","5",90,20,"Descends en 5 secondes."],["Pompes archer","3","6/côté",75,18,"Transfère le poids d'un bras à l'autre."],["Curl biceps élastique","3","15",45,12,"Coudes fixes le long du corps."]]]
      ],
      1: [
        ["Protocole Alpha", [["Course continue","1","25 min",0,25,"Allure modérée, respiration régulière."],["Jumping jacks","4","40s",30,12,"Rythme soutenu et constant."],["Montées de genoux","4","30s",30,12,"Genoux à hauteur de hanches."],["Burpees","3","10",60,18,"Explosif à la montée."]]],
        ["Protocole Bêta", [["Corde à sauter","5","2 min",45,18,"Sauts légers sur l'avant des pieds."],["Sprints sur place","6","20s",40,15,"Vitesse maximale sur chaque sprint."],["Mountain climbers","4","30s",30,12,"Gainage constant, rythme rapide."],["Squats sautés","3","15",45,15,"Réception souple, genoux alignés."]]],
        ["Protocole Gamma", [["Intervalles 30/30","10","30s effort",30,22,"30s intense puis 30s récup, 10 fois."],["Talons-fesses","4","30s",30,12,"Garde la cadence élevée."],["Fentes sautées","4","12",40,15,"Change de jambe en l'air."],["Gainage dynamique","3","40s",30,12,"Alterne planche haute et basse."]]]
      ],
      2: [
        ["Protocole Alpha", [["Squats au poids du corps","4","20",60,18,"Descends sous la parallèle, dos droit."],["Fentes avant","4","12/jambe",60,18,"Genou arrière vers le sol."],["Mollets debout","4","20",45,12,"Amplitude maximale en haut."],["Chaise murale","3","45s",60,15,"Cuisses parallèles au sol."]]],
        ["Protocole Bêta", [["Squats bulgares","4","10/jambe",75,20,"Pied arrière surélevé."],["Soulevé jambes tendues","4","12",60,18,"Dos plat, pousse les hanches en arrière."],["Fentes latérales","3","12/côté",60,15,"Grand transfert de poids latéral."],["Sauts groupés","3","12",60,15,"Ramène les genoux à la poitrine."]]],
        ["Protocole Gamma", [["Squats sumo","4","15",60,18,"Pieds larges, pointes vers l'extérieur."],["Pont fessier","4","15",45,12,"Contracte les fessiers en haut."],["Step-ups","4","12/jambe",60,15,"Pousse avec la jambe sur le banc."],["Squats sautés","3","15",60,15,"Explose vers le haut."]]]
      ],
      3: [
        ["Flux du serpent", [["Salutation au soleil","3","1 cycle",30,8,"Enchaîne les postures en respirant."],["Étirement ischio-jambiers","2","45s/jambe",20,6,"Dos droit, penche depuis les hanches."],["Rotation thoracique","2","10/côté",20,6,"Ouvre la poitrine à chaque rotation."],["Posture de l'enfant","2","60s",20,6,"Relâche le bas du dos."]]],
        ["Flux du dragon", [["Mobilité hanches 90/90","3","45s",20,8,"Alterne les côtés lentement."],["Étirement chat-vache","2","15",20,6,"Synchronise avec la respiration."],["Étirement quadriceps debout","2","40s/jambe",20,6,"Garde le bassin neutre."],["Respiration profonde","1","5 min",0,6,"Inspire 4s, expire 6s."]]]
      ],
      4: [
        ["Protocole Alpha", [["Planche","4","45s",45,15,"Corps aligné, abdos serrés."],["Relevés de jambes","4","15",45,15,"Bas du dos collé au sol."],["Russian twists","4","20",45,12,"Rotation contrôlée du tronc."],["Gainage latéral","3","30s/côté",30,12,"Hanches hautes."]]],
        ["Protocole Bêta", [["Crunchs","4","20",45,12,"Décolle les omoplates, pas la nuque."],["Hollow hold","4","30s",45,15,"Bas du dos plaqué au sol."],["Bicyclette","4","20",30,12,"Coude vers le genou opposé."],["Planche dynamique","3","40s",45,12,"Monte et descends sur les avant-bras."]]],
        ["Protocole Gamma", [["V-ups","4","12",45,15,"Touche les pieds en haut."],["Mountain climbers","4","40s",30,12,"Rythme rapide et gainé."],["Planche commando","3","12",45,15,"Alterne avant-bras et mains."],["Superman","3","15",30,12,"Décolle bras et jambes ensemble."]]]
      ],
      5: [
        ["Raid Alpha", [["Burpees","5","12",45,20,"Enchaîne sans pause."],["Squats sautés","5","15",40,18,"Explosif à chaque répétition."],["Pompes","5","12",45,18,"Tempo régulier."],["Mountain climbers","5","40s",30,15,"Maintiens le gainage."],["Gainage","3","60s",45,15,"Termine fort."]]],
        ["Raid Bêta", [["Thrusters élastique","5","12",45,20,"Squat puis poussée au-dessus de la tête."],["Fentes sautées","5","16",40,18,"Change de jambe en l'air."],["Pompes piquées","5","10",45,18,"Cible les épaules."],["Burpees sautés","4","10",50,18,"Saut maximal à la fin."],["Planche","3","60s",45,15,"Gainage strict."]]],
        ["Raid Gamma", [["Squat-press","5","12",45,20,"Coordonne jambes et bras."],["Jumping lunges","5","16",40,18,"Atterris en douceur."],["Renegade rows","4","12",45,18,"Gainage anti-rotation."],["High knees","5","40s",30,15,"Genoux hauts, rapide."],["Hollow hold","3","40s",45,15,"Tiens la position."]]]
      ],
      6: [
        ["Rituel du Monarque", [["Marche légère","1","20 min",0,8,"Récupération active, allure tranquille."],["Étirements complets","1","10 min",0,6,"Cible tous les groupes musculaires."],["Méditation & respiration","1","8 min",0,6,"Recentre ton mental pour la semaine."]]]
      ]
    };
    for (const di in EX) {
      const variations = EX[di];
      for (let vi = 0; vi < variations.length; vi++) {
        const label = variations[vi][0];
        const items = variations[vi][1];
        for (let oi = 0; oi < items.length; oi++) {
          const it = items[oi];
          await db.run('INSERT INTO exercises (day_index, variation_index, variation_label, name, sets, reps, rest_seconds, xp_reward, notes, order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [parseInt(di,10), vi, label, it[0], it[1], it[2], it[3], it[4], it[5], oi]);
        }
      }
    }
  }

  const pcount = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (!pcount || pcount.c === 0) {
    const posts = [
      ["Le Système t'a choisi", "Bienvenue, Joueur.\n\nTu viens d'être éveillé. À partir d'aujourd'hui, ton entraînement n'est plus une corvée : c'est une série de quêtes. Chaque jour de la semaine ouvre une nouvelle porte, et chaque quête complétée te rapporte de l'expérience.\n\nTon objectif est simple : ne jamais refuser une quête. La régularité est la seule véritable arme du chasseur.", "Annonce", "https://res.cloudinary.com/duhp69meg/image/upload/v1782260716/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260716704.png"],
      ["Comment fonctionne la montée en rang", "Ton niveau augmente avec l'XP que tu accumules en complétant des quêtes.\n\nLes rangs vont de E (Éveillé) à S (Monarque). Chaque palier de niveau te fait progresser dans la hiérarchie des chasseurs. Plus tu es constant, plus ta série de jours grandit — et avec elle, ta discipline.\n\nVise un palier à la fois. Le rang S n'est pas un sprint, c'est une ascension.", "Conseil", "https://res.cloudinary.com/duhp69meg/image/upload/v1782260713/tapavis_tenant_solo-leveling-training/build_solo-leveling-training_1782260713798.png"],
      ["Nutrition du chasseur : le carburant du mana", "Aucun chasseur ne progresse sans énergie. Hydrate-toi avant, pendant et après chaque quête.\n\nPrivilégie des protéines à chaque repas pour réparer tes muscles, des glucides complexes pour soutenir l'effort, et des légumes pour la récupération. Le sommeil reste ta meilleure potion de régénération : vise 7 à 8 heures par nuit.", "Conseil", null],
      ["Mise à jour : les variations hebdomadaires", "Le Système a évolué. Chaque jour possède désormais plusieurs protocoles (Alpha, Bêta, Gamma...).\n\nLa structure de ta semaine reste la même, mais les exercices tournent automatiquement d'une semaine à l'autre. Résultat : tu ne fais jamais exactement le même entraînement deux semaines de suite, et ton corps continue de progresser.", "Mise à jour", null],
      ["Récit : la première porte", "La première porte est toujours la plus lourde à franchir.\n\nLe premier jour, chaque répétition semble impossible. Le deuxième, un peu moins. Au bout d'une semaine, le doute commence à reculer. Le chasseur n'est pas celui qui n'a jamais peur — c'est celui qui franchit la porte malgré la peur. Franchis la tienne aujourd'hui.", "Récit", null]
    ];
    for (const p of posts) { await db.run('INSERT INTO posts (title, content, category, image_url, published) VALUES ($1,$2,$3,$4,1)', [p[0], p[1], p[2], p[3]]); }
  }
};
