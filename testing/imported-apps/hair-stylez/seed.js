module.exports = async function(db) {
  const settings = [
    ['business_name', 'Hair Stylez'],
    ['tagline', 'L\'art de la coiffure, redéfini'],
    ['tagline_en', 'The art of hair styling, redefined'],
    ['hero_title', 'Révélez votre meilleure version'],
    ['hero_title_en', 'Reveal your best self'],
    ['hero_subtitle', 'Un salon où l\'expertise rencontre l\'élégance. Prenez rendez-vous avec nos coiffeurs experts.'],
    ['hero_subtitle_en', 'A salon where expertise meets elegance. Book an appointment with our expert stylists.'],
    ['hero_cta', 'Réserver maintenant'],
    ['hero_cta_en', 'Book now'],
    ['about_title', 'Notre philosophie'],
    ['about_title_en', 'Our philosophy'],
    ['about_text', 'Chez Hair Stylez, nous croyons que chaque chevelure raconte une histoire unique. Notre équipe de professionnels passionnés combine technique, créativité et soin du détail pour sublimer votre style. Dans un cadre épuré et raffiné, nous vous offrons une expérience sur mesure, du conseil initial à la touche finale.'],
    ['about_text_en', 'At Hair Stylez, we believe every head of hair tells a unique story. Our team of passionate professionals combines technique, creativity, and attention to detail to elevate your style. In a refined and minimal setting, we offer a tailored experience, from initial consultation to the final touch.'],
    ['services_title', 'Nos services'],
    ['services_title_en', 'Our services'],
    ['team_title', 'Notre équipe'],
    ['team_title_en', 'Our team'],
    ['booking_title', 'Réservation'],
    ['booking_title_en', 'Booking'],
    ['booking_intro', 'Choisissez votre service, votre coiffeur et votre créneau préféré. Le paiement se fait sur place au moment du rendez-vous.'],
    ['booking_intro_en', 'Choose your service, stylist, and preferred time slot. Payment is made on-site at the time of your appointment.'],
    ['contact_title', 'Contact'],
    ['contact_title_en', 'Contact'],
    ['footer_text', 'Hair Stylez — Salon de coiffure professionnel'],
    ['footer_text_en', 'Hair Stylez — Professional hair salon'],
    ['instagram_handle', '@hairstylez'],
    ['instagram_url', 'https://instagram.com/'],
    ['payment_note', 'Paiement sur place au moment du rendez-vous (argent comptant, carte de débit ou crédit).'],
    ['payment_note_en', 'Payment on-site at the time of your appointment (cash, debit, or credit card).'],
    ['opening_hours', 'Lun-Ven: 9h-19h • Sam: 9h-17h • Dim: Fermé'],
    ['opening_hours_en', 'Mon-Fri: 9am-7pm • Sat: 9am-5pm • Sun: Closed'],
    ['google_place_id', '']
  ];
  for (const [k, v] of settings) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }

  await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167118/tapavis_tenant_hair-stylez/build_hair-stylez_1779167118089.png']);
  await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', ['_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167121/tapavis_tenant_hair-stylez/build_hair-stylez_1779167121921.png']);

  const existingServices = await db.get('SELECT COUNT(*) as c FROM services');
  if (!existingServices || existingServices.c == 0) {
    const services = [
      ['Coupe Femme', 'Women\'s Cut', 'Coupe personnalisée incluant shampooing, coupe technique et coiffage. Notre coiffeur prend le temps de comprendre votre style de vie et vos préférences.', 'Personalized cut including shampoo, technical cut, and styling. Our stylist takes the time to understand your lifestyle and preferences.', 60, 75, 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167118/tapavis_tenant_hair-stylez/build_hair-stylez_1779167118067.png', 'Coupe', 1],
      ['Coupe Homme', 'Men\'s Cut', 'Coupe précise et soignée incluant shampooing et finition. Style classique ou contemporain selon vos envies.', 'Precise and polished cut including shampoo and finishing. Classic or contemporary style based on your preferences.', 45, 45, 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167118/tapavis_tenant_hair-stylez/build_hair-stylez_1779167118067.png', 'Coupe', 1],
      ['Coloration complète', 'Full Color', 'Coloration uniforme sur toute la chevelure avec produits de qualité professionnelle. Conseil personnalisé sur la nuance idéale.', 'Uniform color throughout the hair with professional-grade products. Personalized advice on the ideal shade.', 120, 140, 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167123/tapavis_tenant_hair-stylez/build_hair-stylez_1779167123861.png', 'Coloration', 1],
      ['Balayage', 'Balayage', 'Technique d\'éclaircissement à main levée pour un effet naturel et lumineux. Idéal pour un look sophistiqué.', 'Freehand lightening technique for a natural, luminous effect. Ideal for a sophisticated look.', 150, 180, 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167123/tapavis_tenant_hair-stylez/build_hair-stylez_1779167123861.png', 'Coloration', 1],
      ['Brushing & Coiffage', 'Blowout & Styling', 'Mise en forme professionnelle pour une chevelure brillante et structurée. Parfait avant un événement.', 'Professional styling for shiny, structured hair. Perfect before an event.', 45, 55, 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167114/tapavis_tenant_hair-stylez/build_hair-stylez_1779167114754.png', 'Coiffage', 0],
      ['Soin profond', 'Deep Conditioning', 'Traitement nourrissant adapté à votre type de cheveux pour restaurer brillance et vitalité.', 'Nourishing treatment tailored to your hair type to restore shine and vitality.', 45, 65, 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167115/tapavis_tenant_hair-stylez/build_hair-stylez_1779167115523.png', 'Soin', 0]
    ];
    for (let i = 0; i < services.length; i++) {
      const s = services[i];
      await db.run('INSERT INTO services (name, name_en, description, description_en, duration_minutes, price, image_url, category, featured, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [...s, i]);
    }
  }

  const existingStylists = await db.get('SELECT COUNT(*) as c FROM stylists');
  if (!existingStylists || existingStylists.c == 0) {
    const stylists = [
      ['Camille Laurent', 'Coiffeuse senior • Spécialiste coloration', 'Senior Stylist • Color Specialist', 'Avec plus de 12 ans d\'expérience, Camille est une experte de la coloration et du balayage. Elle a travaillé pour des maisons de mode à Paris et Montréal.', 'With over 12 years of experience, Camille is an expert in color and balayage. She has worked for fashion houses in Paris and Montreal.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167127/tapavis_tenant_hair-stylez/build_hair-stylez_1779167127346.png', '@camille.hair', 0],
      ['Julien Tremblay', 'Coiffeur senior • Coupe homme & femme', 'Senior Stylist • Men\'s & Women\'s Cuts', 'Julien excelle dans les coupes précises et les transformations. Sa technique allie tradition et modernité pour des résultats impeccables.', 'Julien excels at precision cuts and transformations. His technique blends tradition and modernity for impeccable results.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167116/tapavis_tenant_hair-stylez/build_hair-stylez_1779167116604.png', '@julien.cuts', 1],
      ['Sophie Mercier', 'Coloriste créative', 'Creative Colorist', 'Spécialiste des techniques de coloration avancées, Sophie crée des nuances uniques inspirées par l\'art et la mode contemporaine.', 'Specializing in advanced color techniques, Sophie creates unique shades inspired by art and contemporary fashion.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167117/tapavis_tenant_hair-stylez/build_hair-stylez_1779167117016.png', '@sophie.color', 2]
    ];
    for (const s of stylists) {
      const r = await db.run('INSERT INTO stylists (name, title, title_en, bio, bio_en, image_url, instagram, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', s);
      const sid = r.lastInsertRowid;
      const schedule = [[1,'09:00','19:00'],[2,'09:00','19:00'],[3,'09:00','19:00'],[4,'09:00','19:00'],[5,'09:00','19:00'],[6,'09:00','17:00']];
      for (const [dow, st, et] of schedule) {
        await db.run('INSERT INTO stylist_availability (stylist_id, day_of_week, start_time, end_time) VALUES ($1,$2,$3,$4)', [sid, dow, st, et]);
      }
    }
  }

  const existingPosts = await db.get('SELECT COUNT(*) as c FROM posts');
  if (!existingPosts || existingPosts.c == 0) {
    const posts = [
      ['Les tendances coiffure de la saison', 'This Season\'s Hair Trends', 'Cette saison célèbre la naturalité et la texture. Du balayage caramel aux coupes effilées, découvrez les looks qui dominent.', 'This season celebrates naturalness and texture. From caramel balayage to layered cuts, discover the looks dominating the scene.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167119/tapavis_tenant_hair-stylez/build_hair-stylez_1779167119106.png', 'Tendances'],
      ['Comment préserver votre coloration', 'How to Preserve Your Color', 'Quelques conseils essentiels pour prolonger l\'éclat de votre couleur entre vos rendez-vous au salon.', 'Essential tips to extend the brilliance of your color between salon visits.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167123/tapavis_tenant_hair-stylez/build_hair-stylez_1779167123861.png', 'Conseils'],
      ['Le rituel cheveux de l\'automne', 'The Fall Hair Ritual', 'L\'automne demande une attention particulière. Voici notre routine recommandée pour des cheveux sains et brillants.', 'Fall requires special attention. Here is our recommended routine for healthy, shiny hair.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167115/tapavis_tenant_hair-stylez/build_hair-stylez_1779167115523.png', 'Soins'],
      ['Préparer son rendez-vous: nos conseils', 'Preparing for Your Appointment', 'Quelques bonnes pratiques avant votre visite pour optimiser le résultat de votre coupe ou coloration.', 'Best practices before your visit to optimize the result of your cut or color.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1779167121/tapavis_tenant_hair-stylez/build_hair-stylez_1779167121921.png', 'Conseils']
    ];
    for (const p of posts) {
      await db.run('INSERT INTO posts (title, title_en, content, content_en, image_url, category) VALUES ($1,$2,$3,$4,$5,$6)', p);
    }
  }
};
