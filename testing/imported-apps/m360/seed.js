module.exports = async function(db){
  const setDN = async (k,v)=>{ await db.run(`INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING`,[k, v==null?'':String(v)]); };
  const setIMG = async (k,v)=>{ await db.run(`INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,[k,v]); };
  await setDN('meta_desc', `M360, garage mécanique. Diagnostic honnête et service rapide. Réservez en ligne et consultez nos taux.`);
  await setDN('stat_avg_delay', '45');
  await setDN('stat_years', '18');
  await setDN('stat_reviews', '4.9');
  await setDN('booking_slot_minutes', '60');
  await setIMG('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519808.png');
  await setIMG('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519585.png');

  const bh = await db.get(`SELECT COUNT(*) c FROM business_hours`);
  if(Number(bh.c)===0){
    const hrs=[[0,null,null,1],[1,'08:00','18:00',0],[2,'08:00','18:00',0],[3,'08:00','18:00',0],[4,'08:00','18:00',0],[5,'08:00','18:00',0],[6,'09:00','13:00',0]];
    for(const h of hrs){ await db.run(`INSERT INTO business_hours (day_of_week,open_time,close_time,closed,created_at,updated_at) VALUES ($1,$2,$3,$4,NOW(),NOW())`,[h[0],h[1],h[2],h[3]]); }
  }

  const sc = await db.get(`SELECT COUNT(*) c FROM services`);
  if(Number(sc.c)===0){
    const svc=[
      [`Diagnostic électronique`, `Lecture des codes, test des capteurs et rapport clair avant toute réparation.`, 65, 'flat', 45, `Diagnostic`, 1, 1],
      [`Changement d'huile et filtre`, `Huile synthétique, filtre neuf et inspection visuelle en 30 minutes.`, 55, 'flat', 30, `Entretien`, 1, 2],
      [`Remplacement des freins`, `Plaquettes neuves et inspection des disques, par essieu.`, 189, 'from', 90, `Freins`, 1, 3],
      [`Alignement 4 roues`, `Réglage de la géométrie sur banc laser avec rapport avant/après.`, 99, 'flat', 60, `Direction`, 0, 4],
      [`Pneus et balancement`, `Montage, balancement et valve pour un jeu de 4 pneus.`, 80, 'flat', 45, `Pneus`, 0, 5],
      [`Mise au point complète`, `Bougies, filtres et vérification des systèmes clés.`, 149, 'flat', 90, `Entretien`, 0, 6],
      [`Inspection pré-achat`, `Évaluation complète avant l'achat d'un véhicule usagé.`, 120, 'flat', 60, `Diagnostic`, 0, 7],
      [`Main-d'oeuvre générale`, `Taux horaire pour diagnostics et réparations sur mesure.`, 110, 'hourly', 60, `Atelier`, 0, 8]
    ];
    for(const s of svc){ await db.run(`INSERT INTO services (name,description,price,price_type,duration_min,category,featured,sort_order,published,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1,NOW(),NOW())`,[s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7]]); }
  }

  const gc = await db.get(`SELECT COUNT(*) c FROM gallery`);
  if(Number(gc.c)===0){
    const g=[
      [`Aire de diagnostic`, '1', `Banc de diagnostic électronique`, 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519558.png', 1],
      [`Levage lourd`, '2', `Pont élévateur 4 tonnes`, 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519732.png', 2],
      [`Atelier de freins`, '3', `Poste de rectification`, 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519332.png', 3],
      [`Montage de pneus`, '4', `Équilibreuse numérique`, 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519773.png', 4],
      [`Banc d'alignement`, '5', `Système de géométrie laser`, 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519486.png', 5],
      [`Comptoir client`, '6', `Accueil et suivi en direct`, 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106518/tapavis_tenant_m360/build_m360_1788106518405.png', 6]
    ];
    for(const x of g){ await db.run(`INSERT INTO gallery (title,bay_number,equipment,image_url,sort_order,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,[x[0],x[1],x[2],x[3],x[4]]); }
  }

  const pc = await db.get(`SELECT COUNT(*) c FROM posts`);
  if(Number(pc.c)===0){
    const posts=[
      [`Nouveau banc d'alignement laser`, `On vient d'installer un banc d'alignement laser dernière génération. Résultat: une géométrie plus précise et un rapport avant/après remis à chaque client. Prenez rendez-vous pour vérifier l'usure de vos pneus.`, `Équipement`, 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519486.png'],
      [`Préparez votre véhicule pour l'hiver`, `Batterie, pneus, liquide lave-glace et freins: quatre points à vérifier avant les premiers froids. Réservez une inspection saisonnière, on s'occupe du reste.`, `Conseil`, 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519332.png'],
      [`Pourquoi nos taux sont affichés`, `Un garage rapide n'a rien à cacher. Nos taux sont publics et la durée estimée aussi. Vous savez à quoi vous attendre avant même d'arriver.`, `Nouvelle`, 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519585.png'],
      [`Le diagnostic honnête, notre signature`, `Avant toute réparation, on lit les codes et on vous explique clairement le problème. Aucune surprise sur la facture, aucune réparation inutile.`, `Nouvelle`, 'https://res.cloudinary.com/duhp69meg/image/upload/v1788106519/tapavis_tenant_m360/build_m360_1788106519558.png']
    ];
    for(const p of posts){ await db.run(`INSERT INTO posts (title,content,category,image_url,published,created_at,updated_at) VALUES ($1,$2,$3,$4,1,NOW(),NOW())`,[p[0],p[1],p[2],p[3]]); }
  }
};
