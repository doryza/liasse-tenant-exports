module.exports = async function(db){
 var settings=[
  ['hero_timecode','00:00:00:00'],
  ['hero_title_1',"Le montage qu'on ne voit pas."],
  ['hero_title_2',"La preuve qu'on peut voir."],
  ['hero_subtitle',"Monteur vidéo. YouTube et formats courts. Je coupe, je cale, j'exporte."],
  ['hero_cta','Voir les rushs'],
  ['contact_intro',"Dites-moi ce que vous montez. Je réponds sous 48 h."],
  ['legal_text',"© MBG. Monteur vidéo. Tous droits réservés."],
  ['meta_desc',"Monteur vidéo — montage YouTube et formats courts. Portfolio, progression du travail et demandes de projet."],
  ['contact_email',''],
  ['youtube_url',''],
  ['instagram_url',''],
  ['tiktok_url','']
 ];
 for(var i=0;i<settings.length;i++){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[settings[i][0],settings[i][1]]); }

 var vc=await db.get('SELECT COUNT(*)::int AS n FROM videos');
 if(vc.n===0){
  var vids=[
   ["Épisode 12 — Le documentaire de rue","Un montage long format : sélection des meilleurs plans, rythme au souffle, étalonnage sobre.","","Montage YouTube","00:00:12:00","14:22","https://res.cloudinary.com/duhp69meg/image/upload/v1783139714/tapavis_tenant_mbg-video/build_mbg-video_1783139714906.png",1,0],
   ["Vlog voyage — Lisbonne au petit matin","Le calme avant la ville. Coupes lentes, respiration, lumière rasante.","","Montage YouTube","00:01:24:12","11:48","https://res.cloudinary.com/duhp69meg/image/upload/v1783139712/tapavis_tenant_mbg-video/build_mbg-video_1783139712707.png",0,1],
   ["Short — Le raccord invisible","Une seule idée, quarante secondes. Le hook tombe à la première image.","","Short","00:01:41:03","0:47","https://res.cloudinary.com/duhp69meg/image/upload/v1783139715/tapavis_tenant_mbg-video/build_mbg-video_1783139715732.png",0,2],
   ["Pub — Café de quartier","Trente secondes, un produit, une émotion. Rythme calé sur la musique.","","Pub","00:02:03:19","0:30","https://res.cloudinary.com/duhp69meg/image/upload/v1783139713/tapavis_tenant_mbg-video/build_mbg-video_1783139713242.png",0,3],
   ["Podcast — Multicam trois caméras","Montage multicam propre : on suit la parole, jamais l'inverse.","","Montage YouTube","00:02:22:07","52:10","https://res.cloudinary.com/duhp69meg/image/upload/v1783139714/tapavis_tenant_mbg-video/build_mbg-video_1783139714639.png",0,4],
   ["Short — Recette express","Gestes serrés, sound design gourmand, texte animé lisible sur mobile.","","Short","00:02:39:21","0:38","https://res.cloudinary.com/duhp69meg/image/upload/v1783139714/tapavis_tenant_mbg-video/build_mbg-video_1783139714255.png",0,5]
  ];
  for(var v=0;v<vids.length;v++){ await db.run('INSERT INTO videos (title,description,youtube_url,video_type,timecode,duration,image_url,featured,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',vids[v]); }
 }

 var tc=await db.get('SELECT COUNT(*)::int AS n FROM timeline_clips');
 if(tc.n===0){
  var clips=[
   ["2022","Les débuts","2022. Je coupe trop tard. Le rythme traîne. Je le vois seulement aujourd'hui.","","","",0],
   ["2023","Le rythme","2023. J'apprends le J-cut. Le son entre avant l'image. Ça respire enfin.","","","",1],
   ["2024","L'étalonnage","2024. Je pose une vraie colorimétrie. Le raccord devient invisible.","https://res.cloudinary.com/duhp69meg/image/upload/v1783139713/tapavis_tenant_mbg-video/build_mbg-video_1783139713644.png","https://res.cloudinary.com/duhp69meg/image/upload/v1783139713/tapavis_tenant_mbg-video/build_mbg-video_1783139713481.png","",2],
   ["Aujourd'hui","Maintenant","Aujourd'hui. Je monte à l'intention. Chaque coupe a une raison.","https://res.cloudinary.com/duhp69meg/image/upload/v1783139714/tapavis_tenant_mbg-video/build_mbg-video_1783139714322.png","https://res.cloudinary.com/duhp69meg/image/upload/v1783139713/tapavis_tenant_mbg-video/build_mbg-video_1783139713345.png","",3]
  ];
  for(var c=0;c<clips.length;c++){ await db.run('INSERT INTO timeline_clips (year,title,note,before_image_url,after_image_url,image_url,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)',clips[c]); }
 }

 var pc=await db.get('SELECT COUNT(*)::int AS n FROM prestations');
 if(pc.n===0){
  var pres=[
   ["Montage long format","Je monte vos vidéos YouTube : tri des rushs, rythme, sous-titres, étalonnage.","Créateurs YouTube et chaînes documentaires.","3 à 6 jours.","Sur devis",0],
   ["Formats courts","Shorts, Reels, TikTok. Hook dès la première seconde, coupes serrées, texte animé.","Créateurs et marques sur mobile.","24 à 48 h.","Sur devis",1],
   ["Habillage & rythme","Titres, transitions, sound design. Je donne une signature stable à vos vidéos.","Chaînes qui veulent une identité claire.","Sur devis.","Sur devis",2]
  ];
  for(var p=0;p<pres.length;p++){ await db.run('INSERT INTO prestations (name,what_i_do,for_who,delay,price,sort_order) VALUES ($1,$2,$3,$4,$5,$6)',pres[p]); }
 }

 var oc=await db.get('SELECT COUNT(*)::int AS n FROM posts');
 if(oc.n===0){
  var posts=[
   ["Pourquoi le meilleur montage est invisible","Le spectateur ne doit pas sentir la coupe. Il doit sentir l'histoire. Voici comment je pense chaque transition.","Notes"],
   ["Ma checklist avant chaque export","Niveaux audio, LUT, sous-titres, format de sortie. Cinq points que je vérifie systématiquement avant de livrer.","Méthode"],
   ["3 erreurs de rythme que je faisais en 2022","Je gardais les plans trop longs. Je coupais sur l'image, pas sur le son. Retour honnête sur mes débuts.","Méthode"],
   ["Le J-cut expliqué simplement","Faire entrer le son avant l'image. Un outil simple qui change tout le confort de visionnage.","Technique"]
  ];
  for(var o=0;o<posts.length;o++){ await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,1)',posts[o]); }
 }
};
