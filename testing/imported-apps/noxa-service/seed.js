module.exports = async function(db) {
  const settings = [
    ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778467522/tapavis_tenant_noxa-service/build_noxa-service_1778467522148.png'],
    ['business_name', 'Noxa Service'],
    ['tagline', 'Service professionnel de ménage au Québec'],
    ['hero_title', 'Un ménage impeccable, à chaque fois'],
    ['hero_subtitle', 'Noxa Service offre un nettoyage professionnel après construction, commercial et avant/après déménagement. Soumission gratuite, équipe certifiée.'],
    ['contact_phone', '438-376-6883'],
    ['contact_email', 'myk.bindustrie@gmail.com'],
    ['business_address', 'Région du Grand Montréal, QC'],
    ['about_title', 'À propos de Noxa Service'],
    ['about_text', 'Noxa Service est une entreprise québécoise spécialisée dans le ménage professionnel. Depuis nos débuts, nous mettons un point d\'honneur à offrir un service rigoureux, ponctuel et adapté à chaque type d\'environnement: chantiers de construction, espaces commerciaux et résidences en transition. Notre équipe est formée, assurée et utilise des produits sécuritaires pour offrir un résultat impeccable à chaque visite.'],
    ['footer_text', 'Service de ménage professionnel pour particuliers et entreprises au Québec.'],
    ['cta_title', 'Prêt à profiter d\'un espace impeccable?'],
    ['cta_subtitle', 'Contactez-nous dès aujourd\'hui pour obtenir votre soumission gratuite sans engagement.']
  ];
  for (const [key, value] of settings) {
    const isImage = key.startsWith('_p_') && key.endsWith('_url');
    const sql = isImage
      ? 'INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()'
      : 'INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING';
    await db.run(sql, [key, value]);
  }

  const existing = await db.get('SELECT COUNT(*)::int AS c FROM services');
  if (!existing || existing.c === 0) {
    await db.run(
      'INSERT INTO services (name, slug, short_description, description, icon, image_url, display_order, published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      ['Ménage après construction', 'menage-apres-construction',
       'Nettoyage complet et minutieux après vos travaux de construction ou rénovation.',
       'Vous venez de terminer des travaux de construction ou de rénovation? Noxa Service prend en charge le nettoyage complet de votre chantier pour que vous puissiez profiter pleinement de votre nouvel espace. Nous éliminons la poussière de plâtre, les résidus de peinture, les traces de colle, les débris et les particules fines qui s\'incrustent partout après les travaux. Notre équipe utilise des équipements professionnels (aspirateurs HEPA, nettoyeurs vapeur, échelles télescopiques) pour atteindre chaque recoin: planchers, plafonds, ventilations, fenêtres, armoires, salles de bain, garages. Que ce soit pour une résidence neuve, un condo rénové ou un commerce en construction, nous vous remettons les clés d\'un espace prêt à habiter, sain et étincelant. Service offert aux entrepreneurs généraux, promoteurs immobiliers et propriétaires.',
       '🏗️', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778467516/tapavis_tenant_noxa-service/build_noxa-service_1778467516104.png', 1, 1]
    );
    await db.run(
      'INSERT INTO services (name, slug, short_description, description, icon, image_url, display_order, published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      ['Ménage commercial', 'menage-commercial',
       'Entretien régulier ou ponctuel pour bureaux, commerces et espaces professionnels.',
       'Un environnement de travail propre, c\'est une équipe productive et des clients confiants. Noxa Service offre des services d\'entretien commercial sur mesure pour bureaux, cliniques, boutiques, restaurants, centres de conditionnement physique, entrepôts et copropriétés. Nous établissons avec vous un horaire de nettoyage flexible — quotidien, hebdomadaire, bihebdomadaire ou mensuel — adapté à votre réalité opérationnelle. Nos services incluent: aspiration et lavage des planchers, désinfection des surfaces de contact, nettoyage des salles de bain et cuisinettes, vidage des poubelles, dépoussiérage des espaces de travail, nettoyage des vitres intérieures, désinfection complète selon les normes sanitaires en vigueur. Tous nos employés sont assurés, formés et discrets. Soumission personnalisée gratuite selon la superficie et la fréquence requise.',
       '🏢', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778467523/tapavis_tenant_noxa-service/build_noxa-service_1778467523628.png', 2, 1]
    );
    await db.run(
      'INSERT INTO services (name, slug, short_description, description, icon, image_url, display_order, published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      ['Ménage avant/après déménagement', 'menage-demenagement',
       'Préparez votre logement avant la livraison ou nettoyez en profondeur après votre départ.',
       'Le déménagement est déjà une période stressante — laissez-nous prendre en charge le ménage. Noxa Service offre un nettoyage en profondeur de votre logement, que ce soit avant votre emménagement (pour vous accueillir dans un espace impeccable) ou après votre départ (pour remettre les clés sans souci et récupérer votre dépôt). Nous nettoyons à fond toutes les pièces vidées: planchers, plinthes, fenêtres, armoires intérieures et extérieures, électroménagers (four, frigo, micro-ondes), salles de bain (bain, douche, toilette, lavabo, joints), cuisine (comptoirs, dosserets, hottes), lumières, ventilations, garde-robes et placards. Idéal pour locataires, propriétaires, agents immobiliers et entreprises de déménagement. Tarification au logement ou à l\'heure selon vos besoins. Soumission rapide en moins de 24h.',
       '📦', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778467527/tapavis_tenant_noxa-service/build_noxa-service_1778467527227.png', 3, 1]
    );
  }

  const existingT = await db.get('SELECT COUNT(*)::int AS c FROM testimonials');
  if (!existingT || existingT.c === 0) {
    await db.run('INSERT INTO testimonials (author, role, content, rating, published) VALUES ($1,$2,$3,$4,$5)',
      ['Sophie Bergeron', 'Propriétaire résidentielle', 'Équipe Noxa exceptionnelle! Après notre rénovation de cuisine, ils ont tout nettoyé en profondeur — pas un grain de poussière restant. Service rapide, ponctuel et très professionnel. Je recommande sans hésiter.', 5, 1]);
    await db.run('INSERT INTO testimonials (author, role, content, rating, published) VALUES ($1,$2,$3,$4,$5)',
      ['Marc-André Lavoie', 'Gestionnaire d\'immeuble', 'Nous faisons affaire avec Noxa Service pour l\'entretien hebdomadaire de notre immeuble de bureaux. Toujours impeccable, équipe discrète et fiable. Excellent rapport qualité-prix.', 5, 1]);
    await db.run('INSERT INTO testimonials (author, role, content, rating, published) VALUES ($1,$2,$3,$4,$5)',
      ['Julie Tremblay', 'Locataire', 'J\'ai fait appel à Noxa pour le ménage après mon déménagement. Mon ancien propriétaire m\'a remis mon dépôt complet — l\'appartement était plus propre qu\'à mon arrivée! Merci à toute l\'équipe.', 5, 1]);
    await db.run('INSERT INTO testimonials (author, role, content, rating, published) VALUES ($1,$2,$3,$4,$5)',
      ['Patrick Dubois', 'Entrepreneur général', 'Partenaire de confiance pour le ménage post-construction de nos projets. Toujours à l\'heure, méticuleux et respectueux des lieux. Un vrai professionnel du domaine.', 5, 1]);
  }

  const existingP = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (!existingP || existingP.c === 0) {
    await db.run('INSERT INTO posts (title, content, category, published) VALUES ($1,$2,$3,$4)',
      ['5 conseils pour un nettoyage post-construction efficace',
       'Après des travaux, la poussière s\'infiltre partout. Voici nos conseils de pros: 1) Commencez toujours du haut vers le bas. 2) Utilisez un aspirateur HEPA pour les particules fines. 3) Changez les filtres de ventilation. 4) Lavez les fenêtres en deux étapes (intérieur et extérieur). 5) Faites appel à des professionnels pour les chantiers majeurs — le temps économisé en vaut le coût.',
       'Conseils', 1]);
    await db.run('INSERT INTO posts (title, content, category, published) VALUES ($1,$2,$3,$4)',
      ['Pourquoi un entretien commercial régulier est rentable',
       'Un milieu de travail propre, c\'est moins d\'absences, plus de productivité et une meilleure image auprès de votre clientèle. Découvrez comment un contrat d\'entretien sur mesure peut transformer votre entreprise.',
       'Entreprise', 1]);
  }
};
