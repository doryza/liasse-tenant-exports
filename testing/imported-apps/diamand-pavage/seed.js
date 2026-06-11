module.exports = async function(db, services) {
  var cfg = (services && services.config) ? services.config : {};
  var phone = cfg.contactPhone || '4384356829';
  var email = cfg.contactEmail || 'dory@liasse.tech';
  var bname = cfg.businessName || cfg.displayName || 'Pavage Diamand';
  var addr = cfg.businessAddress || '';
  async function set(key, value, force) {
    if (value === null || value === undefined || value === '') return;
    if (force) await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [key, value]);
    else await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [key, value]);
  }
  await set('business_name', bname);
  await set('contact_phone', phone);
  await set('contact_email', email);
  if (addr) await set('business_address', addr);
  await set('hours', 'Lun – Sam : 7 h à 18 h');
  await set('service_area', 'Laurentides, QC');
  await set('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194221/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194221622.png', true);
  await set('_p_team_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194221/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194221270.png', true);

  var c = await db.get('SELECT COUNT(*)::int AS n FROM services');
  if (!c || Number(c.n) === 0) {
    await db.run('INSERT INTO services (name, description, price_from, image_url, featured, sort_order) VALUES ($1,$2,$3,$4,$5,$6)', ['Pavage d’asphalte', 'Entrées de cour, agrandissements et resurfaçage. Asphalte étendu et compacté à la machine pour une surface uniforme qui résiste aux hivers des Laurentides.', 'Soumission gratuite sur place', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194219/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194219232.png', 1, 1]);
    await db.run('INSERT INTO services (name, description, price_from, image_url, featured, sort_order) VALUES ($1,$2,$3,$4,$5,$6)', ['Nettoyage à pression', 'Lavage haute pression d’entrées, trottoirs, murets et surfaces de béton. Élimine la mousse, les taches d’huile et les saletés incrustées.', 'À partir de 149 $', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194221/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194221807.png', 0, 2]);
    await db.run('INSERT INTO services (name, description, price_from, image_url, featured, sort_order) VALUES ($1,$2,$3,$4,$5,$6)', ['Scellant d’asphalte', 'Application de scellant de calibre commercial qui protège contre l’eau, les UV et le calcium. Prolonge la vie de votre asphalte de plusieurs années.', 'À partir de 0,25 $ / pi²', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194221/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194221677.png', 1, 3]);
    await db.run('INSERT INTO services (name, description, price_from, image_url, featured, sort_order) VALUES ($1,$2,$3,$4,$5,$6)', ['Réparation de fissures', 'Colmatage des fissures au caoutchouc liquide appliqué à chaud avant le scellant, pour empêcher l’infiltration d’eau et le gel.', 'À partir de 89 $', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194222/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194222021.png', 0, 4]);
  }

  c = await db.get('SELECT COUNT(*)::int AS n FROM gallery');
  if (!c || Number(c.n) === 0) {
    await db.run('INSERT INTO gallery (title, description, category, image_url) VALUES ($1,$2,$3,$4)', ['Entrée résidentielle — Saint-Sauveur', 'Pavage neuf, environ 950 pi².', 'Pavage', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194219/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194219909.png']);
    await db.run('INSERT INTO gallery (title, description, category, image_url) VALUES ($1,$2,$3,$4)', ['Scellant fraîchement appliqué — Blainville', 'Deux couches de scellant, fini lustré.', 'Scellant', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194220/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194219972.png']);
    await db.run('INSERT INTO gallery (title, description, category, image_url) VALUES ($1,$2,$3,$4)', ['Nettoyage haute pression — Sainte-Adèle', 'Avant / après sur dalle de béton.', 'Nettoyage à pression', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194221/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194221328.png']);
    await db.run('INSERT INTO gallery (title, description, category, image_url) VALUES ($1,$2,$3,$4)', ['Resurfaçage complet — Saint-Jérôme', 'Ancienne surface arrachée et repavée.', 'Pavage', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194221/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194221339.png']);
    await db.run('INSERT INTO gallery (title, description, category, image_url) VALUES ($1,$2,$3,$4)', ['Allée double avec bordures — Mirabel', 'Pavage double largeur, bordures nettes.', 'Pavage', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194221/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194221102.png']);
  }

  c = await db.get('SELECT COUNT(*)::int AS n FROM pricing_packages');
  if (!c || Number(c.n) === 0) {
    await db.run('INSERT INTO pricing_packages (name, description, price, features, category, popular, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)', ['Scellant — Entrée simple', 'Idéal pour une entrée jusqu’à 600 pi².', 'À partir de 249 $', 'Nettoyage haute pression inclus\nColmatage des fissures mineures\nScellant commercial, 1 couche\nSéchage en 24 à 48 h', 'Scellant', 0, 1]);
    await db.run('INSERT INTO pricing_packages (name, description, price, features, category, popular, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)', ['Scellant — Entrée double', 'Pour une entrée double jusqu’à 1 200 pi².', 'À partir de 349 $', 'Nettoyage haute pression inclus\nColmatage des fissures\nScellant commercial, 2 couches\nFini lustré uniforme', 'Scellant', 1, 2]);
    await db.run('INSERT INTO pricing_packages (name, description, price, features, category, popular, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)', ['Nettoyage — Entrée et trottoir', 'Lavage en profondeur des surfaces extérieures.', 'À partir de 179 $', 'Entrée d’auto complète\nTrottoirs et marches\nDégraissage des taches d’huile\nRinçage final', 'Nettoyage à pression', 0, 3]);
    await db.run('INSERT INTO pricing_packages (name, description, price, features, category, popular, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)', ['Forfait Protection complète', 'Le traitement complet : laver, réparer, sceller.', 'Soumission sur mesure', 'Nettoyage haute pression\nRéparation des fissures à chaud\nScellant 2 couches\nGarantie écrite sur le travail', 'Forfait', 0, 4]);
    await db.run('INSERT INTO pricing_packages (name, description, price, features, category, popular, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)', ['Pavage neuf / resurfaçage', 'Entrée neuve ou surface repavée au complet.', 'Sur soumission', 'Excavation et fondation au besoin\nAsphalte compacté à la machine\nBordures droites et nettes\nGarantie sur la pose', 'Pavage', 0, 5]);
  }

  c = await db.get('SELECT COUNT(*)::int AS n FROM team_members');
  if (!c || Number(c.n) === 0) {
    await db.run('INSERT INTO team_members (name, role, bio, image_url, sort_order) VALUES ($1,$2,$3,$4,$5)', ['Marc Diamand', 'Fondateur & chef d’équipe', 'Plus de 15 ans de pavage résidentiel dans les Laurentides. C’est lui qui fait chaque évaluation sur place.', '', 1]);
    await db.run('INSERT INTO team_members (name, role, bio, image_url, sort_order) VALUES ($1,$2,$3,$4,$5)', ['Antoine Lacroix', 'Opérateur — pavage', 'Spécialiste du rouleau compacteur et de la finition des bordures. Un œil de lynx pour les pentes de drainage.', '', 2]);
    await db.run('INSERT INTO team_members (name, role, bio, image_url, sort_order) VALUES ($1,$2,$3,$4,$5)', ['Samuel Bergeron', 'Spécialiste scellant & nettoyage', 'Responsable du lavage haute pression et de l’application du scellant. Méthodique, propre, efficace.', '', 3]);
    await db.run('INSERT INTO team_members (name, role, bio, image_url, sort_order) VALUES ($1,$2,$3,$4,$5)', ['Karine Dubois', 'Coordination & service client', 'Elle planifie les chantiers et vous rappelle dans les 24 h ouvrables. Votre premier contact chez Diamand.', '', 4]);
  }

  c = await db.get('SELECT COUNT(*)::int AS n FROM posts');
  if (!c || Number(c.n) === 0) {
    await db.run('INSERT INTO posts (title, content, image_url, category, published) VALUES ($1,$2,$3,$4,$5)', ['Quand appliquer un scellant d’asphalte ?', 'Le meilleur moment pour sceller votre asphalte est entre la fin mai et la mi-septembre, quand les nuits restent au-dessus de 10 °C. Un asphalte neuf doit d’abord durcir de 12 à 18 mois avant la première application. Ensuite, un scellant aux 2 à 3 ans suffit pour garder une surface noire, souple et protégée contre le calcium.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194221/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194221677.png', 'Conseils', 1]);
    await db.run('INSERT INTO posts (title, content, image_url, category, published) VALUES ($1,$2,$3,$4,$5)', ['5 signes que votre entrée a besoin d’un resurfaçage', 'Des fissures en toile d’araignée, des flaques qui restent après la pluie, des bords qui s’effritent, une surface grise et poreuse ou des nids-de-poule : si vous cochez deux de ces cases ou plus, une réparation locale ne suffira probablement pas. Un resurfaçage redonne une base solide pour 15 à 20 ans.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194221/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194221339.png', 'Conseils', 1]);
    await db.run('INSERT INTO posts (title, content, image_url, category, published) VALUES ($1,$2,$3,$4,$5)', ['Préparer son asphalte pour l’hiver des Laurentides', 'Avant les premières gelées : colmatez les fissures pour empêcher l’eau de s’y infiltrer et de faire éclater la surface au gel. Évitez le calcium pur sur un asphalte non scellé et privilégiez le sable ou un déglaçant doux. Au printemps, un bon lavage à pression révèle l’état réel de la surface.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194222/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194222021.png', 'Conseils', 1]);
    await db.run('INSERT INTO posts (title, content, image_url, category, published) VALUES ($1,$2,$3,$4,$5)', ['Pourquoi laver à pression avant de sceller ?', 'Un scellant appliqué sur une surface sale n’adhère pas : il pèle en quelques mois. Le lavage haute pression retire la poussière, la mousse et les résidus d’huile pour que le scellant pénètre dans les pores de l’asphalte. C’est l’étape qui fait la différence entre un fini d’un an et un fini de trois ans.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781194221/tapavis_tenant_diamand-pavage/build_diamand-pavage_1781194221807.png', 'Conseils', 1]);
  }
};
