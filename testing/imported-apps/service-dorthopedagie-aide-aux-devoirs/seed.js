module.exports = async function(db) {
  const settings = [
    ['business_name', 'Johanne Archambault - Orthopédagogie'],
    ['tagline', 'Accompagner chaque enfant vers sa réussite'],
    ['hero_title', 'L\'apprentissage, une étincelle à allumer'],
    ['hero_subtitle', 'Service d\'orthopédagogie et aide aux devoirs pour les enfants en difficulté d\'apprentissage. Une approche bienveillante, personnalisée et créative.'],
    ['hero_cta', 'Prendre rendez-vous'],
    ['about_title', 'À propos de Johanne'],
    ['about_text', 'Passionnée par l\'éducation depuis plus de 20 ans, je suis Johanne Archambault, orthopédagogue spécialisée auprès des enfants présentant des difficultés d\'apprentissage. Mon approche est unique: je crois fermement que chaque enfant possède en lui une étincelle qui ne demande qu\'à s\'allumer. Mon rôle est de l\'aider à découvrir ses forces, à surmonter ses défis et à reprendre confiance en lui à travers des stratégies adaptées, ludiques et efficaces.'],
    ['about_mission', 'Ma mission est d\'offrir un accompagnement personnalisé qui respecte le rythme de chaque enfant, tout en collaborant étroitement avec les parents et les enseignants pour assurer une cohérence dans les apprentissages.'],
    ['services_title', 'Mes services'],
    ['services_subtitle', 'Des solutions adaptées pour aider votre enfant à s\'épanouir'],
    ['cta_title', 'Prêt à allumer l\'étincelle?'],
    ['cta_subtitle', 'Réservez une consultation gratuite pour discuter des besoins de votre enfant.'],
    ['contact_title', 'Contactez-moi'],
    ['contact_subtitle', 'Une question? Une demande de rendez-vous? Je vous réponds rapidement.'],
    ['testimonials_title', 'Ce que disent les parents'],
    ['blog_title', 'Conseils et articles'],
    ['blog_subtitle', 'Ressources et astuces pour soutenir votre enfant'],
    ['faq_title', 'Questions fréquentes'],
    ['footer_text', 'Accompagnement personnalisé pour les enfants en difficulté d\'apprentissage.'],
    ['mascot_name', 'Lumi'],
    ['mascot_intro', 'Bonjour! Je suis Lumi, et je vais t\'aider à briller!']
  ];
  if (db.config && db.config.contactEmail) settings.push(['contact_email', db.config.contactEmail]);
  if (db.config && db.config.contactPhone) settings.push(['contact_phone', db.config.contactPhone]);
  if (db.config && db.config.businessAddress) settings.push(['business_address', db.config.businessAddress]);
  for (const [k, v] of settings) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769035/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769035289.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769063/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769063657.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_cta_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769050/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769050576.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");

  const services = [
    ['Évaluation orthopédagogique', 'Évaluation complète des besoins et difficultés de votre enfant.', 'Une évaluation approfondie permet d\'identifier les forces et les défis de votre enfant. À partir de cette analyse, je conçois un plan d\'intervention personnalisé qui répond précisément à ses besoins. L\'évaluation comprend des entretiens, des observations et des tâches spécifiques.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769060/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769060603.png', '🔍', 'Sur consultation', '90 minutes', 1, 1],
    ['Rééducation des troubles d\'apprentissage', 'Soutien spécialisé pour la dyslexie, dysorthographie et autres.', 'J\'accompagne les enfants présentant un trouble d\'apprentissage (dyslexie, dysorthographie, dysgraphie) à travers des stratégies adaptées et des outils concrets. Chaque séance combine apprentissage structuré et activités ludiques.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769041/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769041211.png', '📚', 'Sur consultation', '60 minutes', 1, 2],
    ['Soutien en mathématiques', 'Aide spécialisée pour la dyscalculie et difficultés en maths.', 'Pour les enfants qui éprouvent des difficultés avec les mathématiques, j\'utilise une approche multisensorielle qui rend les concepts abstraits concrets et compréhensibles. Manipulation, jeux et résolution de problèmes au programme.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769043/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769043740.png', '🔢', 'Sur consultation', '60 minutes', 1, 3],
    ['Aide aux devoirs', 'Encadrement et soutien quotidien pour les devoirs scolaires.', 'Un service flexible pour soutenir votre enfant dans ses devoirs et leçons. Au-delà de la simple aide, je transmets des stratégies d\'étude et d\'organisation qui rendront votre enfant plus autonome.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769042/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769042499.png', '✏️', 'Sur consultation', '60 minutes', 0, 4],
    ['Stratégies d\'attention et concentration', 'Outils pratiques pour les enfants ayant un TDAH ou des difficultés d\'attention.', 'Je propose des techniques concrètes pour aider votre enfant à mieux gérer son attention, son organisation et sa motivation. Approche positive et axée sur les forces.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769042/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769042499.png', '🎯', 'Sur consultation', '60 minutes', 0, 5],
    ['Consultation parents', 'Soutien et conseils pour accompagner votre enfant à la maison.', 'Une rencontre dédiée aux parents pour discuter des stratégies à mettre en place à la maison, des inquiétudes et des questions concernant le parcours scolaire de votre enfant.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769060/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769060603.png', '👨‍👩‍👧', 'Gratuite (première fois)', '45 minutes', 0, 6]
  ];
  for (const s of services) {
    await db.run('INSERT INTO services (name, description, details, image_url, icon, price, duration, featured, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', s);
  }

  const testimonials = [
    ['Marie L.', 'Maman de Léa, 9 ans', 'Johanne a transformé la relation de ma fille avec l\'école. En quelques mois, sa confiance en elle est revenue et ses notes se sont améliorées. Je la recommande sans hésitation!', 5],
    ['Stéphane B.', 'Papa de Thomas, 11 ans', 'Mon fils est dyslexique et nous étions désemparés. Johanne nous a donné des outils concrets et son approche bienveillante a fait toute la différence. Merci infiniment!', 5],
    ['Caroline T.', 'Maman de Maxime, 8 ans', 'Une professionnelle exceptionnelle qui sait s\'adapter à chaque enfant. Maxime adore ses séances et progresse à grands pas.', 5],
    ['Julie M.', 'Maman de Sophie, 10 ans', 'Sophie avait perdu toute motivation pour les maths. Avec Johanne, elle a redécouvert le plaisir d\'apprendre. Une vraie magicienne!', 5]
  ];
  for (const t of testimonials) {
    await db.run('INSERT INTO testimonials (author, role, content, rating) VALUES ($1,$2,$3,$4)', t);
  }

  const posts = [
    ['5 astuces pour aider votre enfant dyslexique à la maison', 'La dyslexie ne définit pas votre enfant. Avec les bonnes stratégies, vous pouvez l\'aider à surmonter ses défis quotidiens. Voici 5 astuces concrètes: 1) Utilisez des supports visuels colorés pour faciliter la mémorisation. 2) Lisez à voix haute ensemble pour modéliser la fluidité. 3) Découpez les tâches longues en petites étapes. 4) Célébrez chaque petit progrès. 5) Maintenez une routine stable et prévisible.', 'Découvrez 5 stratégies pratiques pour soutenir votre enfant dyslexique au quotidien.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769041/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769041211.png', 'Stratégies'],
    ['Comment reconnaître les signes d\'un trouble d\'apprentissage', 'Certains signes peuvent indiquer qu\'un enfant fait face à un trouble d\'apprentissage: difficultés persistantes en lecture ou en écriture, fatigue importante après les devoirs, refus d\'aller à l\'école, baisse d\'estime de soi. Si vous observez plusieurs de ces signes, n\'hésitez pas à consulter un professionnel. Une intervention précoce fait toute la différence.', 'Identifier rapidement les signes d\'un trouble d\'apprentissage permet d\'agir tôt.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769060/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769060603.png', 'Conseils'],
    ['L\'importance du jeu dans l\'apprentissage', 'Le jeu est un outil pédagogique puissant. Il permet aux enfants d\'apprendre sans pression, de développer leur créativité et de consolider leurs acquis. Que ce soit à travers des jeux de société, des manipulations ou des activités sensorielles, le jeu rend l\'apprentissage joyeux et durable.', 'Apprendre en jouant: une approche efficace et motivante pour les enfants.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769043/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769043740.png', 'Pédagogie'],
    ['Bien préparer la rentrée scolaire avec un enfant TDAH', 'La rentrée peut être source d\'anxiété pour les enfants TDAH. Préparez-la en douceur: visitez l\'école avant, établissez une routine claire, organisez un coin devoirs calme, communiquez avec l\'enseignant. Une bonne préparation favorise une transition harmonieuse et une année réussie.', 'Conseils pratiques pour une rentrée sereine avec un enfant TDAH.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769042/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769042499.png', 'Conseils'],
    ['Renforcer l\'estime de soi de votre enfant', 'Un enfant en difficulté scolaire peut rapidement perdre confiance en lui. Pour renforcer son estime: valorisez ses efforts plus que les résultats, célébrez ses talents en dehors de l\'école, écoutez ses émotions sans jugement, fixez-lui des défis atteignables. Une bonne estime de soi est la base de tous les apprentissages.', 'Des clés concrètes pour aider votre enfant à croire en lui.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778769050/tapavis_tenant_service-dorthopedagie-aide-aux-devoirs/build_service-dorthopedagie-aide-aux-devoirs_1778769050576.png', 'Bien-être']
  ];
  for (const p of posts) {
    await db.run('INSERT INTO posts (title, content, excerpt, image_url, category) VALUES ($1,$2,$3,$4,$5)', p);
  }

  const faqs = [
    ['Qu\'est-ce qu\'une orthopédagogue?', 'Une orthopédagogue est une spécialiste de l\'apprentissage qui aide les enfants présentant des difficultés ou des troubles d\'apprentissage. Elle évalue, intervient et conseille pour favoriser la réussite scolaire.', 1],
    ['À quel âge consulter une orthopédagogue?', 'Il est possible de consulter dès l\'âge préscolaire jusqu\'à l\'adolescence. Plus l\'intervention est précoce, meilleurs sont les résultats. Si vous avez des inquiétudes, n\'hésitez pas.', 2],
    ['Combien de temps dure un suivi?', 'La durée varie selon les besoins de chaque enfant. En général, un suivi s\'étend sur quelques mois à une année scolaire. Les séances hebdomadaires sont les plus efficaces.', 3],
    ['Faut-il une référence du médecin?', 'Non, aucune référence médicale n\'est nécessaire pour consulter une orthopédagogue. Vous pouvez prendre rendez-vous directement.', 4],
    ['Les services sont-ils couverts par les assurances?', 'Plusieurs assurances privées remboursent partiellement ou totalement les services orthopédagogiques. Renseignez-vous auprès de votre assureur.', 5],
    ['Comment se déroule la première rencontre?', 'La première rencontre est une consultation gratuite de 45 minutes. Nous discutons des besoins de votre enfant, je réponds à vos questions et nous établissons un plan d\'action ensemble.', 6]
  ];
  for (const f of faqs) {
    await db.run('INSERT INTO faqs (question, answer, display_order) VALUES ($1,$2,$3)', f);
  }
};