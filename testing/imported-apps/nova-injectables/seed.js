module.exports = async function(db) {
  const cfg = (typeof arguments[1] === 'object' && arguments[1]) ? arguments[1] : {};
  const defaults = [
    ['tagline', 'L\'art de la beauté médicale'],
    ['hero_title', 'Révélez votre éclat naturel'],
    ['hero_subtitle', 'Soins esthétiques de pointe — PRP, agents de comblement et plus. Expertise médicale, résultats raffinés.'],
    ['hero_cta', 'Prendre rendez-vous'],
    ['about_title', 'L\'expertise au service de votre beauté'],
    ['about_text', 'Nova Injectables est une clinique d\'esthétique médicale dédiée à révéler votre beauté naturelle. Notre équipe d\'infirmières et médecins certifiés combine expertise scientifique et sens artistique pour offrir des résultats raffinés et harmonieux. Chaque traitement est personnalisé selon votre morphologie et vos objectifs, dans un environnement chaleureux et confidentiel.'],
    ['about_mission', 'Sublimer votre beauté avec délicatesse, sécurité et excellence.'],
    ['contact_email', 'nina.novainjectables@gmail.com'],
    ['contact_phone', ''],
    ['business_name', 'Nova Injectables'],
    ['business_address', ''],
    ['business_hours', 'Mar-Sam : 9h à 18h • Dim-Lun : Fermé'],
    ['booking_intro', 'Réservez votre soin en quelques étapes. Un acompte sécurisé confirme votre rendez-vous.'],
    ['booking_policy', 'L\'acompte est non-remboursable mais transférable à un autre rendez-vous si annulé 48h avant. Le solde est réglé en clinique.'],
    ['payment_default_fr', 'Un acompte sécurisé par Stripe est requis pour confirmer votre rendez-vous. Le solde est payable en clinique le jour du soin (cartes acceptées).'],
    ['payment_default_en', 'A secure Stripe deposit is required to confirm your appointment. The balance is paid at the clinic on the day of treatment (cards accepted).'],
    ['footer_about', 'Clinique d\'esthétique médicale dédiée à votre éclat naturel. Soins PRP, agents de comblement, anti-âge.'],
    ['instagram_url', ''],
    ['facebook_url', '']
  ];
  for (const [k, v] of defaults) {
    await db.run("INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", [k, v]);
  }
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460320/tapavis_tenant_nova-injectables/build_nova-injectables_1778460320501.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460316/tapavis_tenant_nova-injectables/build_nova-injectables_1778460316328.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");

  const sv = await db.get('SELECT COUNT(*) AS c FROM services');
  if (parseInt(sv.c)==0) {
    const services = [
      ['PRP Visage', 'prp-visage', 'Rajeunissement du visage par plasma riche en plaquettes', 'Le PRP (Plasma Riche en Plaquettes) utilise les facteurs de croissance de votre propre sang pour régénérer la peau, atténuer les rides et redonner éclat et fermeté. Idéal pour le visage, le cou et le décolleté. Résultats progressifs et naturels sur 3 à 6 mois. Aucune éviction sociale.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460315/tapavis_tenant_nova-injectables/build_nova-injectables_1778460315531.png', 60000, 10000, 75, 'PRP', 1, 1],
      ['PRP Cheveux', 'prp-cheveux', 'Stimulation capillaire par plasma autologue', 'Traitement capillaire de référence pour densifier la chevelure et freiner la chute. Injections de PRP directement dans le cuir chevelu pour stimuler les follicules. Protocole recommandé : 3 séances espacées de 4 semaines, puis entretien annuel.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460320/tapavis_tenant_nova-injectables/build_nova-injectables_1778460320647.png', 50000, 10000, 60, 'PRP', 1, 1],
      ['Lèvres sublimées', 'agents-comblement-levres', 'Volume et hydratation des lèvres à l\'acide hyaluronique', 'Sublimer vos lèvres avec délicatesse — volume, contour, hydratation. Utilisation d\'agents de comblement à base d\'acide hyaluronique de dernière génération pour un résultat naturel et harmonieux. Anesthésie topique pour un confort optimal.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460318/tapavis_tenant_nova-injectables/build_nova-injectables_1778460318726.png', 55000, 10000, 45, 'Agents de comblement', 1, 1],
      ['Sculpting visage', 'agents-comblement-visage', 'Volumisation et contour du visage', 'Restauration des volumes du visage : pommettes, mâchoire, sillons, vallée des larmes. Technique artistique pour rehausser la structure et adoucir les traits du temps. Effet immédiat, résultats durant 9 à 18 mois.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460324/tapavis_tenant_nova-injectables/build_nova-injectables_1778460324246.png', 70000, 15000, 60, 'Agents de comblement', 0, 1],
      ['Botox / Neuromodulation', 'neuromodulation', 'Lissage des rides d\'expression', 'Traitement de référence pour atténuer les rides du front, de la patte d\'oie et de la glabelle. Approche subtile pour conserver une expression naturelle. Résultats visibles sous 7 à 14 jours, durée moyenne de 4 mois.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460320/tapavis_tenant_nova-injectables/build_nova-injectables_1778460320729.png', 35000, 7500, 30, 'Anti-âge', 1, 1],
      ['Skin Booster', 'skin-booster', 'Hydratation profonde et éclat', 'Microinjections d\'acide hyaluronique non volumateur pour une hydratation en profondeur. Peau repulpée, lumineuse, plus ferme. Recommandé en cure de 2 à 3 séances espacées de 3 semaines. Idéal en préparation événement.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460328/tapavis_tenant_nova-injectables/build_nova-injectables_1778460328624.png', 45000, 10000, 45, 'Anti-âge', 0, 1]
    ];
    for (const s of services) {
      await db.run('INSERT INTO services (name, slug, short_description, description, image_url, price_cents, deposit_cents, duration_minutes, category, featured, published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', s);
    }
  }

  const tc = await db.get('SELECT COUNT(*) AS c FROM testimonials');
  if (parseInt(tc.c)==0) {
    const tests = [
      ['Sophie L.', 'Cliente fidèle', 'Une expérience exceptionnelle. Nina a su comprendre exactement ce que je voulais — un résultat naturel, élégant. Je rayonne de confiance depuis. Mon salon de beauté de référence à Montréal.', null, 5],
      ['Marie-Claude D.', 'Première visite', 'Accueil chaleureux, conseils honnêtes et professionnalisme impeccable. Le PRP visage a transformé ma peau en 3 mois. Je recommande à toutes mes amies!', null, 5],
      ['Catherine T.', 'Cliente régulière', 'Nova c\'est l\'élégance et la confiance. Chaque rendez-vous est un moment privilégié et les résultats parlent d\'eux-mêmes. Merci pour votre art!', null, 5],
      ['Émilie R.', 'Mariée comblée', 'J\'avais besoin d\'être à mon meilleur pour mon mariage. Le skin booster et la touche subtile de Nina ont fait toute la différence. Résultats sublimes et naturels.', null, 5]
    ];
    for (const t of tests) {
      await db.run('INSERT INTO testimonials (author, role, content, image_url, rating, published) VALUES ($1,$2,$3,$4,$5,1)', t);
    }
  }

  const pc = await db.get('SELECT COUNT(*) AS c FROM posts');
  if (parseInt(pc.c)==0) {
    const posts = [
      ['PRP : la science derrière le rajeunissement naturel', 'Le Plasma Riche en Plaquettes (PRP) est devenu en quelques années l\'un des soins esthétiques les plus prisés. Et pour cause : il utilise les facteurs de croissance présents dans votre propre sang pour stimuler la régénération cellulaire. Le résultat? Une peau plus ferme, lumineuse, et un effet rajeunissement progressif et naturel.\n\nLe protocole est simple : nous prélevons une petite quantité de sang, que nous centrifugeons pour isoler le plasma riche en plaquettes. Ce plasma est ensuite réinjecté en microponctions dans les zones à traiter — visage, cou, décolleté, cuir chevelu.\n\nPour des résultats optimaux, nous recommandons une cure de 3 séances espacées de 4 semaines, puis un entretien annuel.', 'Le PRP utilise vos propres facteurs de croissance pour régénérer la peau de l\'intérieur.', null, 'Conseils experts', 1],
      ['Bien préparer son rendez-vous d\'injection', 'Quelques règles simples pour optimiser vos résultats et minimiser les ecchymoses : évitez l\'alcool 48h avant, les anti-inflammatoires (Advil, Aspirine) 5 jours avant, et hydratez-vous bien. Le jour J, venez démaquillée. Après l\'injection, évitez le sport intense, le sauna et l\'exposition solaire pendant 48h.', 'Les 5 règles d\'or pour des résultats optimaux et un confort maximal.', null, 'Conseils experts', 1],
      ['Lèvres sublimées : trouver le bon équilibre', 'L\'art des lèvres réside dans la subtilité. Chez Nova, notre philosophie est claire : sublimer sans dénaturer. Nous étudions la morphologie de chaque visage, les proportions, et travaillons par couches légères pour un résultat harmonieux. Oubliez les lèvres « bouche de canard » — place à des lèvres pulpeuses, naturelles, parfaitement intégrées à votre sourire.', 'L\'art subtil des lèvres pulpeuses qui restent naturelles.', null, 'Tendances', 1]
    ];
    for (const p of posts) {
      await db.run('INSERT INTO posts (title, content, excerpt, image_url, category, published) VALUES ($1,$2,$3,$4,$5,$6)', p);
    }
  }

  const gc = await db.get('SELECT COUNT(*) AS c FROM gallery');
  if (parseInt(gc.c)==0) {
    await db.run("INSERT INTO gallery (title, description, image_url, category, published) VALUES ('Notre univers', 'Un cocon de raffinement', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460322/tapavis_tenant_nova-injectables/build_nova-injectables_1778460322821.png', 'Clinique', 1)");
    await db.run("INSERT INTO gallery (title, description, image_url, category, published) VALUES ('Expérience Nova', 'Le luxe d''un soin sur mesure', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460315/tapavis_tenant_nova-injectables/build_nova-injectables_1778460315166.png', 'Soins', 1)");
    await db.run("INSERT INTO gallery (title, description, image_url, category, published) VALUES ('PRP signature', 'Notre protocole de référence', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460315/tapavis_tenant_nova-injectables/build_nova-injectables_1778460315531.png', 'Soins', 1)");
    await db.run("INSERT INTO gallery (title, description, image_url, category, published) VALUES ('Lèvres sublimées', 'L''art du naturel', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778460318/tapavis_tenant_nova-injectables/build_nova-injectables_1778460318726.png', 'Résultats', 1)");
  }
};