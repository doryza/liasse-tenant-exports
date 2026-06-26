module.exports = async function(db){
  const S = [
    ['business_name','AMS Auto Services'],
    ['tagline','Le garage qui vient à vous'],
    ['hero_kicker','Mécanique mobile · à domicile'],
    ['hero_title','La mécanique vient à vous.'],
    ['hero_subtitle','Changement d’huile, freins, entretien préventif et lavage complet — réalisés directement dans votre entrée, sans déplacement au garage.'],
    ['why_title','Pourquoi choisir le service à domicile'],
    ['promise_1','Aucun déplacement : nous venons à votre domicile ou au travail, à l’heure qui vous convient.'],
    ['promise_2','Prix clairs annoncés d’avance : pas de surprise sur la facture.'],
    ['promise_3','Travail soigné et garanti par un mécanicien expérimenté de confiance.'],
    ['about_title','Une inspection transparente, point par point'],
    ['about_text','AMS Auto Services, c’est l’atelier qui se déplace. Chaque intervention suit une fiche d’inspection claire : on vous explique l’état de votre véhicule avec un code couleur simple — vert (tout va bien), ambre (à surveiller), indigo (esthétique) — et on n’effectue que ce qui est nécessaire. Vous gardez le contrôle, et votre véhicule reste fiable saison après saison.'],
    ['service_area','Service mobile dans la Mauricie et les environs'],
    ['hours','Lundi au samedi · 8 h à 18 h'],
    ['contact_email','breebok7@gmail.com'],
    ['contact_phone',''],
    ['contact_address',''],
    ['cta_title','Prêt à réserver votre rendez-vous ?'],
    ['cta_text','Réservez en quelques secondes. On vient à vous, vous reprenez la route l’esprit tranquille.'],
    ['booking_intro','Remplissez la fiche ci-dessous et nous vous confirmons votre rendez-vous rapidement.'],
    ['footer_text','© '+new Date().getFullYear()+' AMS Auto Services · Mécanique mobile à domicile']
  ];
  for(const row of S){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[row[0],row[1]]); }
  const IMG = [['_p_hero_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1782479720/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479720877.png'],['_p_about_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1782479723/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479723501.png']];
  for(const row of IMG){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[row[0],row[1]]); }

  const sc = Number((await db.get('SELECT COUNT(*) c FROM services')).c);
  if(sc===0){
    const services = [
      ['Changement d’huile synthétique','Vidange complète avec huile synthétique de qualité, remplacement du filtre à huile, vérification des niveaux et inspection visuelle rapide.','À partir de 89 $','45 min','entretien','https://res.cloudinary.com/duhp69meg/image/upload/v1782479722/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479722165.png',1,1],
      ['Inspection & entretien préventif','Inspection multipoint complète : freins, pneus, fluides, batterie, courroies. On vous remet une fiche claire de l’état du véhicule.','À partir de 69 $','1 h','entretien','https://res.cloudinary.com/duhp69meg/image/upload/v1782479722/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479722218.png',1,2],
      ['Remplacement de freins','Remplacement des plaquettes et inspection des disques avant ou arrière. Pièces de qualité installées chez vous, en toute sécurité.','À partir de 199 $','1 h 30','reparation','https://res.cloudinary.com/duhp69meg/image/upload/v1782479722/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479722698.png',1,3],
      ['Diagnostic & réparation mineure','Lecture des codes, diagnostic du problème et réparations mécaniques mineures réalisées sur place lorsque possible.','Sur devis','Variable','reparation','https://res.cloudinary.com/duhp69meg/image/upload/v1782479722/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479722218.png',0,4],
      ['Lavage & esthétique intérieur','Nettoyage en profondeur de l’habitacle : aspirateur, tableau de bord, vitres, sièges et tapis. Votre intérieur comme neuf.','À partir de 79 $','1 h','esthetique','https://res.cloudinary.com/duhp69meg/image/upload/v1782479721/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479721592.png',1,5],
      ['Lavage & cire extérieur','Lavage extérieur complet, jantes, et application d’une cire protectrice pour un fini brillant et durable.','À partir de 59 $','45 min','esthetique','https://res.cloudinary.com/duhp69meg/image/upload/v1782479721/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479721592.png',1,6]
    ];
    for(const s of services){ await db.run('INSERT INTO services (name,description,price,duration,category,image_url,featured,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',s); }
  }

  const pc = Number((await db.get('SELECT COUNT(*) c FROM posts')).c);
  if(pc===0){
    const posts = [
      ['Quand changer l’huile de son moteur ?','La fréquence dépend de votre véhicule et de votre conduite. Avec une huile synthétique, comptez généralement entre 8 000 et 12 000 km.\n\nSi vous faites beaucoup de courts trajets ou conduisez l’hiver, rapprochez les intervalles. Une huile négligée s’encrasse, perd ses propriétés et use prématurément le moteur.\n\nNotre conseil : gardez une trace de votre dernier changement. Lors de chaque rendez-vous à domicile, nous vous indiquons le prochain kilométrage recommandé.','https://res.cloudinary.com/duhp69meg/image/upload/v1782479720/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479720499.png','Entretien',1],
      ['5 signes que vos freins doivent être remplacés','1. Un grincement ou un crissement métallique au freinage.\n2. Une pédale qui vibre ou descend plus bas que d’habitude.\n3. Une distance de freinage qui s’allonge.\n4. Un voyant de frein allumé au tableau de bord.\n5. Une usure visible des plaquettes (moins de 3 mm).\n\nDès qu’un de ces signes apparaît, faites inspecter vos freins sans tarder — votre sécurité en dépend.','https://res.cloudinary.com/duhp69meg/image/upload/v1782479719/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479719814.png','Sécurité',1],
      ['Préparer sa voiture pour l’hiver québécois','L’hiver met votre véhicule à rude épreuve. Avant les grands froids, vérifiez la batterie, le liquide lave-glace antigel, l’état des pneus d’hiver et les essuie-glaces.\n\nUne inspection préventive à l’automne évite bien des pannes par -25 °C. Nous nous déplaçons chez vous pour tout vérifier avant la première tempête.','https://res.cloudinary.com/duhp69meg/image/upload/v1782479722/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479722218.png','Hiver',1],
      ['Pourquoi l’entretien préventif vous fait économiser','Un petit entretien régulier coûte beaucoup moins cher qu’une grosse réparation imprévue. Changer un filtre, surveiller les fluides et inspecter les freins prolonge la vie de votre véhicule.\n\nNotre fiche d’inspection multipoint vous montre exactement où en est votre auto, sans jargon et sans pression.','','Entretien',1],
      ['Garder l’intérieur de votre auto impeccable','Un habitacle propre, c’est plus agréable et meilleur pour la valeur de revente. Aspirez régulièrement, protégez le tableau de bord du soleil et traitez rapidement les taches.\n\nPour un grand nettoyage, notre service d’esthétique intérieur redonne à votre voiture un fini comme neuf, directement dans votre entrée.','https://res.cloudinary.com/duhp69meg/image/upload/v1782479721/tapavis_tenant_ams-auto-services/build_ams-auto-services_1782479721592.png','Esthétique',1]
    ];
    for(const p of posts){ await db.run('INSERT INTO posts (title,content,image_url,category,published) VALUES ($1,$2,$3,$4,$5)',p); }
  }

  const tc = Number((await db.get('SELECT COUNT(*) c FROM testimonials')).c);
  if(tc===0){
    const t = [
      ['Marie L.','Honda Civic 2018','Alexis est venu changer mon huile dans mon entrée pendant que je travaillais. Ponctuel, propre et très professionnel. Je recommande à 100 %.',5,''],
      ['Jean-François B.','Ford F-150 2016','Remplacement de freins fait à la maison, prix annoncé d’avance respecté. Aucun déplacement au garage, un vrai gain de temps.',5,''],
      ['Sophie T.','Toyota RAV4 2020','Le lavage intérieur était impeccable, ma voiture sentait le neuf. Service courtois et minutieux.',5,''],
      ['Marc-André G.','Mazda 3 2019','Inspection préventive très complète avec explications claires. On comprend enfin l’état de son auto.',4,'']
    ];
    for(const x of t){ await db.run('INSERT INTO testimonials (author,vehicle,content,rating,image_url) VALUES ($1,$2,$3,$4,$5)',x); }
  }

  const bc = Number((await db.get('SELECT COUNT(*) c FROM bookings')).c);
  if(bc===0){
    await db.run('INSERT INTO bookings (name,phone,email,vehicle,service,preferred_date,address,notes,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',['Lucie Tremblay','819 555-0142','lucie@exemple.com','Subaru Outback 2017','Changement d’huile synthétique','14 juin, avant-midi','120 rue des Érables','Stationnement dans l’entrée','confirme']);
    await db.run('INSERT INTO bookings (name,phone,email,vehicle,service,preferred_date,address,notes,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',['Patrick Roy','819 555-0188','','Mazda 3 2019','Remplacement de freins','À confirmer','','Bruit de frein à l’avant','nouveau']);
  }

  const mc = Number((await db.get('SELECT COUNT(*) c FROM messages')).c);
  if(mc===0){
    await db.run('INSERT INTO messages (name,email,phone,message) VALUES ($1,$2,$3,$4)',['Isabelle Caron','isabelle@exemple.com','819 555-0177','Bonjour, est-ce que vous desservez le secteur de Trois-Rivières pour un changement d’huile ? Merci !']);
  }
};
