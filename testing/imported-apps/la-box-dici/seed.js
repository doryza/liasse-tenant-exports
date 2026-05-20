module.exports = async function(db) {
  const slug = 'la-box-dici';
  const heroToken = 'https://res.cloudinary.com/duhp69meg/image/upload/v1779305141/tapavis_tenant_la-box-dici/build_la-box-dici_1779305141310.png';
  const settings = [
    ['hero_title_fr','Un réseau social fait pour les vrais liens'],
    ['hero_title_en','A social network built for real connections'],
    ['hero_subtitle_fr',"Restez en contact avec les gens que vous connaissez, à l'abri de la désinformation et des inconnus."],
    ['hero_subtitle_en','Stay in touch with the people you actually know — far from misinformation and strangers.'],
    ['tagline_fr','Le réseau social respectueux du Québec'],
    ['tagline_en','The respectful social network of Quebec'],
    ['about_text_fr',"La Box d'Ici est née d'une idée simple : redonner aux Québécois un espace en ligne où les conversations restent civilisées, où les relations sont vraies, et où la désinformation n'a pas sa place.\n\nNous croyons que les réseaux sociaux devraient rapprocher les gens, pas les diviser. C'est pourquoi notre plateforme est fermée : seules les personnes que vous connaissez personnellement peuvent vous rejoindre, via un code d'invitation."],
    ['about_text_en',"La Box d'Ici was born from a simple idea: give Quebecers an online space where conversations stay civil, relationships are genuine, and misinformation has no place.\n\nWe believe social networks should bring people together, not divide them. That's why our platform is closed: only people you personally know can join you, through an invitation code."],
    ['mission_fr','Construire un espace numérique québécois respectueux, sécuritaire et authentique pour toutes les générations.'],
    ['mission_en','Build a respectful, safe, authentic Quebec digital space for every generation.'],
    ['footer_text_fr','© ' + new Date().getFullYear() + " La Box d'Ici. Fait avec soin au Québec."],
    ['footer_text_en','© ' + new Date().getFullYear() + " La Box d'Ici. Made with care in Quebec."],
    ['contact_intro_fr','Une question, une suggestion ou un signalement urgent ? Écrivez-nous, nous répondons en français.'],
    ['contact_intro_en','A question, a suggestion or an urgent report? Write to us, we reply in French and English.']
  ];
  for (const [k,v] of settings) {
    await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[k,v]);
  }
  await db.run("INSERT INTO admin_settings (key,value) VALUES ('_p_hero_image_url',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()",[heroToken]);

  const posts = [
    ['Bienvenue sur La Box d’Ici','Notre réseau ouvre ses portes à toute personne invitée par un membre actuel. Si vous lisez ceci, c’est que vous faites partie de ceux qui veulent un Internet plus humain. Merci d’être ici.','Annonces'],
    ['Nos engagements en matière de confidentialité','Aucune donnée vendue. Aucun profil partagé à l’extérieur. Vos publications restent visibles uniquement par les amis que vous avez vous-même acceptés.','Confidentialité'],
    ['Modération humaine, basée au Québec','Tous les signalements sont examinés par une équipe humaine au Québec, en français. Nous ne sous-traitons pas la modération.','Sécurité'],
    ['Contrôles parentaux simples','Les comptes des jeunes de moins de 16 ans sont liés à un parent. Le parent voit les demandes d’amis et peut ajuster qui peut leur écrire en quelques clics.','Famille'],
    ['Petites améliorations cette semaine','Nouveau bouton de blocage rapide depuis les publications, traduction améliorée et un nouvel onglet pour les invitations en attente.','Mises à jour']
  ];
  for (const [t,c,cat] of posts) {
    await db.run('INSERT INTO posts (title,content,category) VALUES ($1,$2,$3)',[t,c,cat]);
  }

  const invites = [
    ['BIENVENUE-2024','Code de bienvenue pour les premiers membres'],
    ['VOISIN-QC-001','Invitation pour les voisins du quartier'],
    ['FAMILLE-001','Invitation famille']
  ];
  for (const [code,note] of invites) {
    await db.run('INSERT INTO invites (code,note) VALUES ($1,$2) ON CONFLICT (code) DO NOTHING',[code,note]);
  }
};