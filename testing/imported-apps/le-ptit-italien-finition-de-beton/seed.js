module.exports = async function(db){
  try {
    await db.run("INSERT INTO admin_settings (key,value) VALUES ('service_area','Partout au Québec') ON CONFLICT (key) DO NOTHING");
    await db.run("INSERT INTO admin_settings (key,value) VALUES ('_p_hero_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1781544019/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544019853.png') ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()");
    await db.run("INSERT INTO admin_settings (key,value) VALUES ('_p_about_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1781544019/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544019729.png') ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()");

    var pc = await db.get('SELECT COUNT(*) c FROM projects');
    if(Number(pc.c)===0){
      var projects = [
        ["Plancher de béton poli — Garage résidentiel", "Polissage haute brillance d'un plancher de garage neuf, fini à la flatteuse pour une surface dure et facile d'entretien.", "https://res.cloudinary.com/duhp69meg/image/upload/v1781544020/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544019941.png", "", "Béton poli", "Trois-Rivières", 1, 1],
        ["Fini terrazzo — Hall commercial", "Terrazzo poli aux agrégats de marbre pour l'entrée d'un édifice commercial : élégant et increvable.", "https://res.cloudinary.com/duhp69meg/image/upload/v1781544020/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544020209.png", "", "Terrazzo", "Shawinigan", 1, 2],
        ["Acrylique de couleur — Patio extérieur", "Fini acrylique texturé et teinté sur un patio résidentiel, pour une surface antidérapante et durable.", "https://res.cloudinary.com/duhp69meg/image/upload/v1781544020/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544020543.png", "", "Acrylique", "Bécancour", 0, 3],
        ["Plancher poli — Sous-sol résidentiel", "Sous-sol transformé avec un plancher de béton poli au fini mat, sobre et moderne.", "https://res.cloudinary.com/duhp69meg/image/upload/v1781544020/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544020056.png", "", "Béton poli", "Trois-Rivières", 0, 4],
        ["Réparation et crépi de solage", "Réparation et parge d'un solage extérieur fissuré, suivies d'un crépi protecteur uniforme.", "https://res.cloudinary.com/duhp69meg/image/upload/v1781544019/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544019247.png", "", "Solage", "Grand-Mère", 0, 5],
        ["Entrée et trottoir en béton", "Coulée et finition d'une entrée de garage et d'un trottoir, finis proprement à la flatteuse.", "https://res.cloudinary.com/duhp69meg/image/upload/v1781544020/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544020168.png", "", "Extérieur", "Nicolet", 0, 6]
      ];
      for(var i=0;i<projects.length;i++){ await db.run('INSERT INTO projects (title,description,image_url,video_url,category,location,featured,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', projects[i]); }
    }

    var sc = await db.get('SELECT COUNT(*) c FROM services');
    if(Number(sc.c)===0){
      var svcs = [
        ["Finition de plancher de béton", "Finition à la flatteuse et polissage pour un plancher lisse, dur et durable — garages, sous-sols, entrepôts et planchers commerciaux.", "concrete", "Estimation gratuite", 1, 1],
        ["Fini terrazzo", "Le classique italien : agrégats de marbre et de verre polis en surface pour un plancher unique, élégant et increvable.", "terrazzo", "Estimation gratuite", 1, 2],
        ["Acrylique sur murs — toutes les couleurs", "Pose d'acrylique décoratif et protecteur sur les murs, dans la couleur de votre choix, pour un fini moderne et facile d'entretien.", "acrylic", "", 0, 3],
        ["Plâtrage et crépi", "Plâtrage de murs et plafonds, crépis et finitions de surface exécutés proprement par un artisan d'expérience.", "plaster", "", 0, 4],
        ["Réparation de solage extérieur", "Réparation, parge et étanchéité des solages et fondations extérieures pour protéger votre bâtiment des intempéries.", "foundation", "", 0, 5],
        ["Trottoirs, entrées et stationnements", "Coulée et finition de trottoirs, entrées de garage et stationnements en béton, finis à la flatteuse ou au balai.", "exterior", "", 0, 6]
      ];
      for(var j=0;j<svcs.length;j++){ await db.run('INSERT INTO services (name,description,icon,price_note,featured,sort_order) VALUES ($1,$2,$3,$4,$5,$6)', svcs[j]); }
    }

    var tc = await db.get('SELECT COUNT(*) c FROM testimonials');
    if(Number(tc.c)===0){
      var tms = [
        ["Jean Tremblay", "Propriétaire, Trois-Rivières", "Mon plancher de garage est magnifique et solide comme le roc. Travail propre, ponctuel, et la garantie n'est pas juste des paroles.", 5, 1],
        ["Sylvie Bergeron", "Propriétaire, Shawinigan", "Le fini terrazzo dans notre entrée fait l'envie de tous les visiteurs. Un vrai artisan qui aime son métier.", 5, 1],
        ["Marc Lefebvre", "Entrepreneur général", "Je fais affaire avec Mario sur plusieurs chantiers. Fiable, méticuleux et toujours à temps. Je recommande sans hésiter.", 5, 0],
        ["Caroline Dubé", "Propriétaire, Bécancour", "Notre patio en acrylique a changé du tout au tout. Belle couleur, fini impeccable et un excellent rapport qualité-prix.", 5, 0],
        ["Robert Gagnon", "Promoteur immobilier", "Des planchers de béton poli livrés dans les délais et au-delà de mes attentes. Un partenaire de confiance.", 5, 0]
      ];
      for(var k=0;k<tms.length;k++){ await db.run('INSERT INTO testimonials (author,role,content,rating,featured) VALUES ($1,$2,$3,$4,$5)', tms[k]); }
    }

    var poc = await db.get('SELECT COUNT(*) c FROM posts');
    if(Number(poc.c)===0){
      var posts = [
        ["Pourquoi réserver vos travaux de béton avant les vacances de la construction", "La demande pour la finition de béton n'est pas la même toute l'année. Elle démarre avec l'été et grimpe en flèche dans les semaines qui précèdent les vacances de la construction.\n\nRéserver tôt vous garantit votre date, évite les délais et vous laisse le temps de bien planifier votre projet. Les meilleurs créneaux partent souvent dès le printemps.\n\nUn conseil : appelez dès que vous avez une idée de votre échéancier. Même une réservation provisoire vaut mieux que d'attendre la dernière minute.", "https://res.cloudinary.com/duhp69meg/image/upload/v1781544024/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544024121.png", "Conseils"],
        ["Le béton poli : durabilité et élégance pour votre plancher", "Le béton poli combine résistance industrielle et fini raffiné. Une fois poli à la flatteuse, le plancher devient extrêmement dur, résiste à l'usure et se nettoie d'un simple coup de vadrouille.\n\nIdéal pour les garages, sous-sols, ateliers et espaces commerciaux, il offre un look moderne sans entretien lourd.\n\nLe secret d'un bon béton poli, c'est la préparation et la main de l'artisan. C'est là que des décennies d'expérience font toute la différence.", "https://res.cloudinary.com/duhp69meg/image/upload/v1781544020/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544020000.png", "Béton"],
        ["Le terrazzo, l'art italien du plancher qui traverse les décennies", "Le terrazzo n'est pas une mode : c'est une tradition italienne centenaire. Des agrégats de marbre et de verre noyés dans une matrice, puis polis jusqu'à obtenir une surface miroir.\n\nLe résultat est un plancher unique, élégant et pratiquement indestructible. Chaque terrazzo est différent — c'est ce qui en fait une pièce d'artisanat.\n\nParfait pour une entrée qui en impose ou un espace qui doit durer une vie.", "https://res.cloudinary.com/duhp69meg/image/upload/v1781544020/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544020209.png", "Terrazzo"],
        ["Acrylique extérieur : protéger et embellir avant le retour du froid", "L'acrylique appliqué sur les surfaces extérieures protège contre l'eau, le gel et l'usure tout en offrant un fini coloré et soigné.\n\nLe meilleur moment pour ces travaux, c'est la fin de l'été et le début de l'automne, quand les températures sont stables et avant les premiers froids.\n\nUne couche d'acrylique de qualité, posée par un artisan, prolonge la vie de vos surfaces de plusieurs années.", "https://res.cloudinary.com/duhp69meg/image/upload/v1781544020/tapavis_tenant_le-ptit-italien-finition-de-beton/build_le-ptit-italien-finition-de-beton_1781544020543.png", "Acrylique"]
      ];
      for(var p=0;p<posts.length;p++){ await db.run('INSERT INTO posts (title,content,image_url,category,published) VALUES ($1,$2,$3,$4,1)', posts[p]); }
    }
  } catch(e){ console.error('seed', e.message); }
};
