module.exports = async function(db) {
  const settings = [
    ['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552722/tapavis_tenant_actuoli/build_actuoli_1778552722886.png', true],
    ['tagline', "L'actualité sportive locale qui bouge", false],
    ['hero_title', 'Le sport local, vibrant et passionné', false],
    ['hero_subtitle', "Articles, entrevues, calendriers et balados — toute la scène sportive de la région réunie sur une seule plateforme.", false],
    ['hero_cta', 'Lire les dernières nouvelles', false],
    ['about_title', "À propos d'Actuoli", false],
    ['about_text', "Actuoli est la voix du sport local. Nous couvrons les équipes, les athlètes et les événements de la région avec passion. Articles, entrevues, photos et balados — restez branchés sur tout ce qui bouge dans le sport amateur et semi-professionnel.", false],
    ['contact_title', "Une histoire à raconter ?", false],
    ['contact_text', "Vous avez un tuyau, une suggestion d'article ou une entrevue à proposer ? Écrivez-nous, nous serons heureux de vous lire.", false],
    ['newsletter_title', 'Ne manquez aucune nouvelle', false],
    ['newsletter_text', "Inscrivez-vous à notre infolettre hebdomadaire pour recevoir un récapitulatif des meilleures histoires sportives locales.", false],
    ['footer_about', "Actuoli est dédié à la couverture du sport local — articles, entrevues, photos et balados.", false],
    ['social_facebook', 'https://facebook.com', false],
    ['social_instagram', 'https://instagram.com', false],
    ['social_twitter', 'https://twitter.com', false],
    ['social_youtube', 'https://youtube.com', false],
    ['business_name', 'Actuoli', false],
    ['contact_email', 'olimaurice23@hotmail.com', false]
  ];
  for (const [k, v, image] of settings) {
    const conflict = image ? 'DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()' : 'DO NOTHING';
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) ' + conflict, [k, v]);
  }

  const existing = await db.get('SELECT COUNT(*)::int AS c FROM posts');
  if (existing && existing.c > 0) return;

  const PH = function(t, c) { return 'https://placehold.co/800x500/' + (c || 'ef4444') + '/ffffff?text=' + encodeURIComponent(t); };

  const posts = [
    { title: 'Les Lions remportent la finale provinciale junior', excerpt: "Une victoire historique en prolongation contre les Aigles, devant une foule électrisée à l'aréna municipal.", content: "C'est dans un aréna comble que les Lions ont arraché la victoire en deuxième période de prolongation contre les Aigles, 4-3. Le capitaine Lucas Bernier a marqué le filet gagnant après une montée éclair en surnombre, déclenchant le délire dans les gradins.\n\n« On y croyait depuis le début de la saison », confiait le coach Laflamme aux journalistes après la rencontre. « Ces joueurs ont travaillé fort, ils méritent cette coupe à 100 %. »\n\nLes Lions terminent la saison avec un impressionnant 28 victoires en 32 parties, un record dans l'histoire récente de l'équipe. La foule en délire a accompagné les joueurs jusqu'aux vestiaires, ponctuant une saison de légende.", category: 'Hockey', author: 'Olivier Maurice', image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552723/tapavis_tenant_actuoli/build_actuoli_1778552723014.png', featured: 1, published: 1 },
    { title: 'Marie-Ève Tremblay vise les championnats nationaux', excerpt: "À 19 ans, la sprinteuse régionale enchaîne les records et prépare son grand rendez-vous estival.", content: "Avec un temps de 11,42 secondes sur 100 mètres aux qualifications régionales, Marie-Ève Tremblay s'impose comme l'une des athlètes les plus prometteuses de sa génération. Entrevue avec une jeune femme qui combine entraînement, études en kinésiologie et une volonté de fer.\n\n« Chaque matin je cours à 5h30 avant les cours. C'est ma routine depuis trois ans. Ça demande de la discipline, mais c'est ça qui me fait avancer. »\n\nElle vise désormais les championnats nationaux U-20 cet été. Son coach, Pierre Lavallée, ne tarit pas d'éloges : « Marie-Ève a tout pour réussir au plus haut niveau. Sa technique, son mental, sa préparation — c'est rare de voir ça à 19 ans. »", category: 'Entrevue', author: 'Olivier Maurice', image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552726/tapavis_tenant_actuoli/build_actuoli_1778552726101.png', featured: 1, published: 1 },
    { title: 'Le soccer féminin local en pleine effervescence', excerpt: "Inscriptions records, équipes compétitives et nouveau complexe sportif — un sport en plein essor.", content: "Les chiffres ne mentent pas : 1 200 jeunes filles inscrites cette saison, soit 30 % de plus qu'en 2022. La construction du nouveau complexe Soccer Régional, avec ses trois terrains synthétiques, a transformé l'offre locale.\n\nLa présidente Annie Vallée explique les défis et les ambitions du club : « On voulait offrir un environnement où les filles se sentent à leur place, peu importe leur niveau. Le résultat dépasse nos espérances. »\n\nL'équipe U-17 vient d'ailleurs de se qualifier pour les demi-finales provinciales — une première dans l'histoire du club.", category: 'Soccer', author: 'Sophie Lavigne', image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552720/tapavis_tenant_actuoli/build_actuoli_1778552720814.png', featured: 1, published: 1 },
    { title: "Camp d'entraînement basketball : les espoirs régionaux", excerpt: "Une cinquantaine de jeunes talents réunis pour cinq jours intenses au cégep régional.", content: "Du 12 au 16 août, le camp d'élite basketball a accueilli 52 joueurs et joueuses de 14 à 18 ans. Avec la collaboration d'anciens athlètes universitaires et de coachs U-Sports, le programme misait sur la technique, la lecture du jeu et la préparation physique.\n\nPlusieurs participants ont déjà reçu des invitations pour des essais préparatoires avec des équipes collégiales. « Ce camp est une porte d'entrée incroyable », résume le coach principal.", category: 'Basketball', author: 'Olivier Maurice', image_url: PH('Basketball', 'f97316'), featured: 0, published: 1 },
    { title: 'Cyclisme : un nouveau circuit pour les amateurs', excerpt: "Le club local inaugure 45 km de pistes balisées entre la ville et les collines.", content: "Inauguré samedi par le maire et le président du club, le nouveau circuit cyclable régional offre un défi de niveau intermédiaire avec un dénivelé total de 320 mètres sur 45 km.\n\nLes cyclistes locaux sont enchantés : « Enfin un parcours sécuritaire pour s'entraîner sans craindre la circulation », témoigne Daniel Roussel, 58 ans, membre du club depuis 12 ans.\n\nLes premières sorties officielles débutent dès le mois prochain.", category: 'Cyclisme', author: 'Sophie Lavigne', image_url: PH('Cyclisme', 'facc15'), featured: 0, published: 1 },
    { title: 'Baseball senior : le tournoi des Anciens fait son grand retour', excerpt: "Après deux années d'absence, le tournoi rassemble huit équipes régionales en fin de semaine.", content: "L'événement attire chaque année près de 2000 spectateurs au parc municipal. Cette édition met à l'honneur les anciens joueurs de la ligue régionale des années 80 et 90.\n\n« C'est plus qu'un tournoi, c'est une réunion de famille sportive », résume l'organisateur Marc Bélanger. « Plusieurs joueurs reviennent de partout au Québec juste pour cette fin de semaine. »", category: 'Baseball', author: 'Olivier Maurice', image_url: PH('Baseball', '0f172a'), featured: 0, published: 1 }
  ];
  for (const p of posts) {
    await db.run('INSERT INTO posts (title, excerpt, content, category, author, image_url, featured, published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [p.title, p.excerpt, p.content, p.category, p.author, p.image_url, p.featured, p.published]);
  }

  const events = [
    { title: 'Tournoi régional de hockey midget AAA', description: "Huit équipes s'affrontent pendant trois jours. Entrée gratuite, ambiance survoltée garantie.", sport: 'Hockey', location: 'Aréna municipal, Trois-Rivières', event_date: '2025-02-15', event_time: '09h00' },
    { title: 'Match de soccer féminin U-17 — Demi-finale', description: 'Les Étoiles affrontent les Boréales au complexe régional.', sport: 'Soccer', location: 'Complexe Soccer Régional', event_date: '2025-02-22', event_time: '14h00' },
    { title: 'Course pédestre 10 km — Au cœur de la ville', description: "Inscriptions ouvertes ! Parcours certifié, médailles pour tous les finissants. Inscription en ligne sur le site du club.", sport: 'Athlétisme', location: 'Centre-ville', event_date: '2025-03-08', event_time: '08h30' },
    { title: "Soirée portes ouvertes du club cycliste", description: "Découvrez le nouveau circuit, essayez les vélos électriques, rencontrez les coachs. Café et viennoiseries offerts.", sport: 'Cyclisme', location: 'Club cycliste régional', event_date: '2025-04-05', event_time: '13h00' },
    { title: 'Tournoi des Anciens — Baseball', description: 'Le retour très attendu du tournoi qui rassemble les légendes locales pour trois jours de matchs nostalgiques.', sport: 'Baseball', location: 'Parc municipal', event_date: '2025-05-24', event_time: '10h00' }
  ];
  for (const e of events) {
    await db.run('INSERT INTO events (title, description, sport, location, event_date, event_time) VALUES ($1,$2,$3,$4,$5,$6)', [e.title, e.description, e.sport, e.location, e.event_date, e.event_time]);
  }

  const gallery = [
    { title: 'Finale provinciale 2024', description: 'Les Lions soulèvent la coupe régionale après leur victoire en prolongation.', category: 'Hockey', image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552720/tapavis_tenant_actuoli/build_actuoli_1778552720095.png' },
    { title: 'Course du printemps', description: "Plus de 800 coureurs au départ du 10 km annuel.", category: 'Athlétisme', image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552717/tapavis_tenant_actuoli/build_actuoli_1778552717718.png' },
    { title: 'Derby de soccer U-15', description: 'Action intense lors du derby régional disputé samedi dernier.', category: 'Soccer', image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552718/tapavis_tenant_actuoli/build_actuoli_1778552718960.png' },
    { title: "Camp basketball d'été", description: 'Les jeunes talents en plein entraînement au cégep.', category: 'Basketball', image_url: PH('Basketball', 'f97316') },
    { title: 'Tournoi baseball Anciens', description: 'Les vétérans donnent encore une leçon de jeu.', category: 'Baseball', image_url: PH('Baseball', '0f172a') },
    { title: 'Sortie cycliste club', description: 'Premier tour de piste sur le nouveau circuit régional.', category: 'Cyclisme', image_url: PH('Cyclisme', 'facc15') }
  ];
  for (const g of gallery) {
    await db.run('INSERT INTO gallery (title, description, category, image_url) VALUES ($1,$2,$3,$4)', [g.title, g.description, g.category, g.image_url]);
  }

  const podcasts = [
    { title: 'Épisode 12 — La passion du hockey junior', description: "Entretien avec le coach Laflamme sur la saison des Lions, la formation des jeunes et les défis du sport amateur.", host: 'Olivier Maurice', duration: '47 min', audio_url: '', image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552728/tapavis_tenant_actuoli/build_actuoli_1778552728940.png' },
    { title: 'Épisode 11 — Marie-Ève Tremblay, sprinteuse étoile', description: 'Rencontre intime avec la jeune athlète qui vise les championnats nationaux. Discipline, ambition et famille.', host: 'Olivier Maurice', duration: '38 min', audio_url: '', image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552728/tapavis_tenant_actuoli/build_actuoli_1778552728940.png' },
    { title: 'Épisode 10 — Le soccer féminin en plein essor', description: "Table ronde avec trois figures du soccer féminin régional pour parler du boom des inscriptions et des ambitions du club.", host: 'Sophie Lavigne', duration: '52 min', audio_url: '', image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552728/tapavis_tenant_actuoli/build_actuoli_1778552728940.png' }
  ];
  for (const p of podcasts) {
    await db.run('INSERT INTO podcasts (title, description, host, duration, audio_url, image_url) VALUES ($1,$2,$3,$4,$5,$6)', [p.title, p.description, p.host, p.duration, p.audio_url, p.image_url]);
  }

  const athletes = [
    { name: 'Marie-Ève Tremblay', sport: 'Athlétisme', bio: "Sprinteuse de 19 ans, étudiante en kinésiologie. Détentrice du record régional sur 100 mètres.", achievements: "Record régional 100m (11,42s)\nMédaille d'or championnats régionaux 2024\nSélection équipe provinciale U-20", image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552725/tapavis_tenant_actuoli/build_actuoli_1778552725302.png' },
    { name: 'Lucas Bernier', sport: 'Hockey', bio: "Capitaine des Lions, 17 ans, attaquant prolifique avec 38 buts cette saison.", achievements: "Meilleur compteur de la ligue 2024\nCapitaine champion provincial\nSélection AAA tournoi national", image_url: 'https://res.cloudinary.com/duhp69meg/image/upload/v1778552724/tapavis_tenant_actuoli/build_actuoli_1778552724333.png' },
    { name: 'Annie Vallée', sport: 'Soccer', bio: "Joueuse-entraîneuse, 28 ans. Présidente du club féminin local, ancienne capitaine senior.", achievements: "Capitaine senior 2018-2022\nEntraîneuse U-15 championne régionale\nDiplôme entraîneur PNCE niveau 3", image_url: PH('Annie', 'f97316') },
    { name: 'Daniel Roussel', sport: 'Cyclisme', bio: "Vétéran du club cycliste, 58 ans. Membre fondateur du nouveau circuit régional.", achievements: "Champion provincial vétérans 2019\nPlus de 50 000 km parcourus en compétition\nMembre fondateur du nouveau circuit régional", image_url: PH('Daniel', 'facc15') }
  ];
  for (const a of athletes) {
    await db.run('INSERT INTO athletes (name, sport, bio, achievements, image_url) VALUES ($1,$2,$3,$4,$5)', [a.name, a.sport, a.bio, a.achievements, a.image_url]);
  }

  const topics = [
    { title: 'Bienvenue sur le forum Actuoli !', content: "Ce forum est l'endroit idéal pour discuter de tout ce qui touche au sport local. Soyez respectueux, passionnés et constructifs. Bonne discussion à tous !", author_name: 'Équipe Actuoli', category: 'Général' },
    { title: 'Pronostics pour la finale junior', content: "Qui pensez-vous que va l'emporter samedi prochain ? Les Lions ou les Aigles ? Donnez votre score prédictif !", author_name: 'Olivier', category: 'Hockey' },
    { title: 'Suggestions pour le tournoi des Anciens', content: "Avez-vous des suggestions pour améliorer l'organisation du tournoi cette année ? Restauration, horaire, prix ?", author_name: 'Marc', category: 'Baseball' }
  ];
  for (const t of topics) {
    await db.run('INSERT INTO forum_topics (title, content, author_name, category) VALUES ($1,$2,$3,$4)', [t.title, t.content, t.author_name, t.category]);
  }
};
