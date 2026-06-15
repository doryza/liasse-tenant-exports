module.exports = async function(db){
  async function setS(k,v){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[k,v]); }
  async function setImg(k,v){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[k,v]); }

  await setS('business_name','Jean-Sébastien Faubert');
  await setS('tagline','Auteur-compositeur-interprète');
  await setS('hero_eyebrow','Nouvel album · Lueurs de minuit');
  await setS('hero_title','Jean-Sébastien Faubert');
  await setS('hero_subtitle','Des chansons folk-pop écrites à la nuit tombée, quelque part entre le silence d’une chambre et la rumeur de la ville.');
  await setS('latest_label','À l’écoute en ce moment');
  await setS('about_title','Le parcours');
  await setS('about_text','Jean-Sébastien Faubert compose depuis l’adolescence, d’abord seul avec une guitare prêtée, puis entouré de musiciens rencontrés au fil des scènes du Québec. Sa musique mêle la chaleur du folk à la précision de la pop, avec des textes qui s’attardent sur les petites choses : une lumière laissée allumée, un trajet de nuit, une conversation qui n’a jamais eu lieu.\n\nAprès plusieurs spectacles intimes et deux EP autoproduits, il présente aujourd’hui « Lueurs de minuit », un album enregistré presque entièrement entre 22 h et l’aube. On y entend le grain des prises live, le souffle des amplis et cette impression rare d’assister à une chanson au moment exact où elle se forme.');
  await setS('about_quote','J’écris pour les heures où tout le monde dort. C’est là que les vraies chansons arrivent.');
  await setS('booking_intro','Une scène, un festival, une collaboration ? Écrivons la suite ensemble.');
  await setS('contact_intro','Pour la programmation, la presse, ou simplement pour dire bonjour — j’ai hâte de vous lire.');
  await setS('footer_text','Des chansons écrites pour la nuit, enregistrées quand la ville se tait.');
  await setS('contact_email','j-s.faubert@hotmail.com');
  await setImg('_p_hero_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1781489415/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489415248.png');
  await setImg('_p_about_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1781489416/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489416723.png');

  var tc=await db.get('SELECT COUNT(*) c FROM tracks');
  if(parseInt(tc.c)==0){
    var tracks=[
      ['Lueurs de minuit','Lueurs de minuit','A',1,'La pièce-titre, écrite d’un trait au retour d’une nuit blanche.','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3','https://res.cloudinary.com/duhp69meg/image/upload/v1781489416/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489416553.png','3:52','2024-09-20',1],
      ['Rue Saint-Maurice','Lueurs de minuit','A',2,'Une marche imaginaire dans une ville endormie.','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3','https://res.cloudinary.com/duhp69meg/image/upload/v1781489416/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489416374.png','4:10','2024-09-20',1],
      ['Le dernier métro','Lueurs de minuit','A',3,'Sur ces conversations qui n’ont jamais eu lieu.','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3','https://res.cloudinary.com/duhp69meg/image/upload/v1781489415/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489415549.png','3:28','2024-09-20',0],
      ['Comme une marée','Lueurs de minuit','B',1,'Le morceau le plus lumineux de l’album, enregistré en une seule prise.','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3','https://res.cloudinary.com/duhp69meg/image/upload/v1781489416/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489416553.png','4:35','2024-09-20',1],
      ['Photographie','Lueurs de minuit','B',2,'Une chanson murmurée, presque sans batterie.','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3','https://res.cloudinary.com/duhp69meg/image/upload/v1781489416/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489416374.png','3:05','2024-09-20',0],
      ['On verra demain','Lueurs de minuit','B',3,'La dernière chanson, et la première écrite du disque.','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3','https://res.cloudinary.com/duhp69meg/image/upload/v1781489415/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489415549.png','5:02','2024-09-20',1]
    ];
    for(var i=0;i<tracks.length;i++){ await db.run('INSERT INTO tracks (title,album,side,track_no,description,audio_url,image_url,duration,release_date,featured,published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1)',tracks[i]); }
  }

  var sc=await db.get('SELECT COUNT(*) c FROM shows');
  if(parseInt(sc.c)==0){
    await db.run(`INSERT INTO shows (title,venue,city,description,show_date,show_time,price,image_url,sold_out,published) VALUES ($1,$2,$3,$4, CURRENT_DATE + INTERVAL '14 days', $5,$6,$7,0,1)`,['Lancement de Lueurs de minuit','Salle J.-Antonio-Thompson','Trois-Rivières','Soirée de lancement avec quartet complet, première partie surprise.','20h00','34 $','https://res.cloudinary.com/duhp69meg/image/upload/v1781489416/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489416587.png']);
    await db.run(`INSERT INTO shows (title,venue,city,description,show_date,show_time,price,image_url,sold_out,published) VALUES ($1,$2,$3,$4, CURRENT_DATE + INTERVAL '28 days', $5,$6,$7,1,1)`,['Soirée intime','Le Ministère','Montréal','Concert en formule trio, format intimiste.','20h30','28 $','']);
    await db.run(`INSERT INTO shows (title,venue,city,description,show_date,show_time,price,image_url,sold_out,published) VALUES ($1,$2,$3,$4, CURRENT_DATE + INTERVAL '45 days', $5,$6,$7,0,1)`,['En première partie de la nuit','Le Cercle','Québec','Nouvelles chansons et reprises revisitées.','21h00','30 $','']);
    await db.run(`INSERT INTO shows (title,venue,city,description,show_date,show_time,price,image_url,sold_out,published) VALUES ($1,$2,$3,$4, CURRENT_DATE + INTERVAL '62 days', $5,$6,$7,0,1)`,['Au coin du feu','La Petite Boîte Noire','Sherbrooke','Spectacle acoustique, voix et guitare.','20h00','26 $','']);
    await db.run(`INSERT INTO shows (title,venue,city,description,show_date,show_time,price,image_url,sold_out,published) VALUES ($1,$2,$3,$4, CURRENT_DATE - INTERVAL '34 days', $5,$6,$7,1,1)`,['Concert d’automne','Maison des arts','Drummondville','','20h00','25 $','']);
  }

  var pc=await db.get('SELECT COUNT(*) c FROM posts');
  if(parseInt(pc.c)==0){
    var posts=[
      ['Lueurs de minuit est enfin disponible','Sortie','https://res.cloudinary.com/duhp69meg/image/upload/v1781489417/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489417579.png','Après deux ans de travail nocturne, le premier album est maintenant en ligne sur toutes les plateformes. Six chansons enregistrées presque entièrement entre 22 h et l’aube, dans un petit studio de la Mauricie.\n\nMerci à tous ceux qui ont suivi le projet depuis le tout premier extrait. La meilleure façon de l’écouter ? Tard, au casque, lumières tamisées.'],
      ['Dans les coulisses du studio','Studio','https://res.cloudinary.com/duhp69meg/image/upload/v1781489416/tapavis_tenant_j-s-faubert/build_j-s-faubert_1781489416587.png','On a choisi de tout enregistrer en prises live, à quelques musiciens dans la même pièce. Pas de clic, pas de filet. On voulait garder le souffle des amplis et les petites imperfections qui rendent une chanson vivante.\n\nVoici quelques images et anecdotes de ces nuits passées à chercher le bon son.'],
      ['Les dates de la tournée d’automne','Tournée','','La tournée s’étend de Trois-Rivières à Sherbrooke, en passant par Montréal et Québec. Certaines salles affichent déjà complet — surveillez la page Spectacles et activez les notifications pour ne rien manquer.'],
      ['La chanson derrière « On verra demain »','Actualité','','C’est la première chanson écrite pour l’album, et la dernière de la liste. Une façon de boucler la boucle. Je vous raconte d’où elle vient et pourquoi elle a failli ne jamais voir le jour.']
    ];
    for(var j=0;j<posts.length;j++){ await db.run('INSERT INTO posts (title,category,image_url,content,published) VALUES ($1,$2,$3,$4,1)',posts[j]); }
  }
};
