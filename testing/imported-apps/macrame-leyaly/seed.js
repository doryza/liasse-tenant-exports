module.exports = async function(db){
  async function setText(k,v){ await db.run("INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING",[k,v]); }
  async function setImg(k,v){ await db.run("INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()",[k,v]); }
  await setText("tagline","Décorations en macramé faites main par Leylou & Aly");
  await setText("hero_title","Des nœuds tissés avec le cœur");
  await setText("hero_subtitle","Chaque pièce est nouée à la main dans notre petit atelier, pour habiller vos murs de douceur et de matières naturelles.");
  await setText("hero_cta","Commander une création");
  await setText("featured_title","Coups de cœur de l’atelier");
  await setText("featured_text","Une sélection de pièces nouées avec amour, prêtes à embellir votre intérieur.");
  await setText("about_title","Leylou & Aly");
  await setText("about_text","Leyaly, c’est la rencontre de deux amies passionnées par le travail des fibres naturelles. Entre deux cafés, on noue, on tresse et on imagine des pièces uniques pour vous.");
  await setText("about_text2","Tout a commencé autour d’une table, avec des pelotes de coton et beaucoup d’idées. De nœud en nœud est née l’envie de partager nos créations. Chaque pièce est unique, faite main avec patience et tendresse.");
  await setText("about_signature","Leylou & Aly");
  await setText("gallery_intro","Des suspensions, des tentures et des accessoires noués à la main. Trouvez la pièce qui réchauffera votre intérieur.");
  await setText("journal_intro","Conseils, coulisses et petites histoires autour du macramé.");
  await setText("commande_intro","Choisissez une pièce existante ou décrivez votre projet sur mesure. On vous recontacte rapidement pour finaliser les détails.");
  await setText("contact_intro","Une question, une idée de projet ? On vous répond avec plaisir.");
  await setText("cta_title","Une idée en tête ?");
  await setText("cta_text","Parlons-en ! On adore créer des pièces sur mesure qui vous ressemblent.");
  await setImg("_p_hero_image_url","https://res.cloudinary.com/duhp69meg/image/upload/v1781898013/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898013139.png");
  await setImg("_p_about_image_url","https://res.cloudinary.com/duhp69meg/image/upload/v1781898013/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898013075.png");
  var hc = await db.get("SELECT COUNT(*) c FROM creations");
  if(!hc || Number(hc.c)===0){
    var cr=[
      ["Tenture murale Bohème","Une tenture nouée à la main avec des franges délicates et des nœuds géométriques. Elle apporte chaleur et texture à n’importe quel mur.",45,"https://res.cloudinary.com/duhp69meg/image/upload/v1781898014/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898014562.png","Suspensions murales","60 cm x 90 cm","Coton recyclé, bois de hêtre",1,1],
      ["Suspension à plante en macramé","Un porte-plante suspendu tout en finesse, idéal pour mettre en valeur vos plantes vertes près d’une fenêtre.",32,"https://res.cloudinary.com/duhp69meg/image/upload/v1781898013/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898013710.png","Suspensions à plantes","80 cm de long","Coton naturel, anneau de bois",1,1],
      ["Attrape-rêves Lune","Un attrape-rêves en forme de croissant de lune, paré de franges douces et de petites perles de bois.",38,"https://res.cloudinary.com/duhp69meg/image/upload/v1781898014/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898014451.png","Attrape-rêves","Ø 30 cm","Coton, métal doré, perles de bois",1,1],
      ["Grande tenture Cascade","Une pièce imposante aux mailles en cascade, parfaite au-dessus d’un lit ou d’un canapé.",78,"https://res.cloudinary.com/duhp69meg/image/upload/v1781898014/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898014391.png","Suspensions murales","90 cm x 130 cm","Coton recyclé, bois flotté",0,1],
      ["Porte-clés en coton","Un petit accessoire tout doux, noué à la main. Le cadeau parfait à offrir ou à s’offrir.",12,"https://res.cloudinary.com/duhp69meg/image/upload/v1781898015/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898014957.png","Accessoires","12 cm","Coton, anneau métallique",0,1],
      ["Mobile décoratif Plumes","Un mobile aérien orné de plumes en macramé, à suspendre dans une chambre ou un coin lecture.",29,"https://res.cloudinary.com/duhp69meg/image/upload/v1781898012/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898012635.png","Décorations murales","50 cm de long","Coton, perles de bois",0,1],
      ["Création sur mesure","Vous avez une idée précise ? On crée la pièce de vos rêves, à vos dimensions et dans vos couleurs.",null,"https://res.cloudinary.com/duhp69meg/image/upload/v1781898014/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898014761.png","Sur mesure","Selon votre projet","Fibres naturelles au choix",0,1]
    ];
    for(var i=0;i<cr.length;i++){ await db.run("INSERT INTO creations (name,description,price,image_url,category,dimensions,materials,featured,available) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)", cr[i]); }
  }
  var hp = await db.get("SELECT COUNT(*) c FROM posts");
  if(!hp || Number(hp.c)===0){
    var ps=[
      ["Bienvenue dans l’atelier de Leyaly","Nous sommes Leylou et Aly, deux amies réunies par une même passion : le macramé. Sur ce journal, on partagera nos créations, nos coulisses et nos petites astuces. Bienvenue dans notre univers tout doux et fait main !","https://res.cloudinary.com/duhp69meg/image/upload/v1781898013/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898013075.png","Atelier",1],
      ["Comment entretenir votre macramé","Le coton naturel mérite un peu d’attention. Dépoussiérez délicatement votre pièce avec un plumeau ou un sèche-cheveux en mode froid. En cas de tache, tamponnez doucement avec un linge humide et un peu de savon doux, sans frotter. Évitez l’exposition directe et prolongée au soleil pour garder la teinte d’origine.","https://res.cloudinary.com/duhp69meg/image/upload/v1781898014/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898014761.png","Conseils",1],
      ["Petit lexique du nœud plat","Le nœud plat est la base de presque toutes nos créations. On le réalise avec quatre fils : deux fils de travail qui entourent deux fils centraux. Répété, il forme de jolies colonnes régulières. C’est lui qui donne ce relief si reconnaissable aux tentures murales.","https://res.cloudinary.com/duhp69meg/image/upload/v1781898014/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898014562.png","Coulisses",1],
      ["Nos cordons : du coton recyclé","Nous choisissons nos matières avec soin. La majorité de nos pièces sont nouées avec du coton recyclé, doux au toucher et plus respectueux de la planète. Une façon de créer de belles choses tout en limitant notre empreinte.","https://res.cloudinary.com/duhp69meg/image/upload/v1781898015/tapavis_tenant_macrame-leyaly/build_macrame-leyaly_1781898014957.png","Atelier",1]
    ];
    for(var j=0;j<ps.length;j++){ await db.run("INSERT INTO posts (title,content,image_url,category,published) VALUES ($1,$2,$3,$4,$5)", ps[j]); }
  }
};