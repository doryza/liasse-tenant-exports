module.exports = async function(db) {
const settings = [
['_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778533218/tapavis_tenant_mes-informations-personnelles/build_mes-informations-personnelles_1778533217904.png'],
['business_name', 'Soutien AA - Yves'],
['contact_email', 'yves.gagnon70@gmail.com'],
['contact_phone', ''],
['contact_phone_display', 'Sur demande par courriel'],
['contact_availability_fr', 'Disponible tous les jours de 8h à 22h. N\'hésitez pas à laisser un message à tout moment.'],
['contact_availability_en', 'Available daily from 8am to 10pm. Feel free to leave a message anytime.'],
['contact_location_fr', 'Québec, Canada'],
['contact_location_en', 'Quebec, Canada'],
['owner_name', 'Yves G.'],
['owner_role_fr', 'Membre AA - Parrain disponible'],
['owner_role_en', 'AA Member - Sponsor available'],
['hero_title_fr', 'Vous n\'êtes pas seul'],
['hero_title_en', 'You are not alone'],
['hero_subtitle_fr', 'Un espace de soutien confidentiel pour les membres AA et ceux qui cherchent de l\'aide.'],
['hero_subtitle_en', 'A confidential support space for AA members and those seeking help.'],
['tagline_fr', 'Ensemble, un jour à la fois'],
['tagline_en', 'Together, one day at a time'],
['emergency_aa_phone', '1-866-376-6378'],
['emergency_drug_phone', '1-800-265-2626']
];
for (const [k,v] of settings) {
if (v && v.indexOf('{{IMG_') === 0) {
await db.run('INSERT INTO admin_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()', [k, v]);
} else {
await db.run('INSERT INTO admin_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', [k, v]);
}
}

const exist = await db.get('SELECT COUNT(*) as c FROM posts');
if (!exist || exist.c == 0) {
const posts = [
['Un jour à la fois', 'Anonyme', 'Quand j\'ai assisté à ma première réunion, j\'étais terrifié. Aujourd\'hui, après plusieurs années de sobriété, je peux dire que cette décision a sauvé ma vie. Le programme fonctionne si on le travaille. Un jour à la fois, parfois une heure à la fois, parfois une minute à la fois. Vous n\'êtes pas seul.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778533223/tapavis_tenant_mes-informations-personnelles/build_mes-informations-personnelles_1778533223154.png', 'Espoir', 1],
['La force de la fraternité', 'Marie L.', 'Je pensais pouvoir m\'en sortir seule. J\'avais tort. C\'est en acceptant l\'aide des autres membres que j\'ai trouvé ma véritable force. Les liens créés en salle sont précieux et durables. Aujourd\'hui, je rends ce qu\'on m\'a donné en parrainant à mon tour.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778533227/tapavis_tenant_mes-informations-personnelles/build_mes-informations-personnelles_1778533227645.png', 'Force', 1],
['Mes 24 heures', 'Yves G.', 'Chaque matin, je demande la force de rester sobre pour les prochaines 24 heures. Ce simple geste a transformé ma vie. Je ne pense plus à l\'avenir comme un fardeau, mais comme une succession de petites victoires quotidiennes.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778533233/tapavis_tenant_mes-informations-personnelles/build_mes-informations-personnelles_1778533233656.png', 'Méditation', 1],
['Les douze étapes m\'ont sauvé', 'Anonyme', 'Travailler les étapes avec mon parrain a été le voyage le plus difficile et le plus enrichissant de ma vie. La 4e étape m\'a permis de regarder en face ce que j\'évitais depuis des années. La 9e m\'a libéré du poids du passé. Je recommande à tout nouveau de prendre un parrain et de travailler les étapes sérieusement.', '', 'Étapes', 1],
['La sérénité retrouvée', 'Jean P.', 'La prière de la sérénité accompagne mes journées. Accepter ce que je ne peux changer, avoir le courage de changer ce que je peux, et la sagesse d\'en connaître la différence. C\'est devenu ma boussole.', '', 'Espoir', 1]
];
for (const p of posts) {
await db.run('INSERT INTO posts (title, author, content, image_url, category, published) VALUES ($1,$2,$3,$4,$5,$6)', p);
}
}

const er = await db.get('SELECT COUNT(*) as c FROM ressources');
if (!er || er.c == 0) {
const resources = [
['AA Québec', 'Aide et information sur les Alcooliques Anonymes au Québec. Lignes téléphoniques 24h/24.', 'https://aa-quebec.org', '1-866-376-6378', 'AA', ''],
['AA International (français)', 'Site officiel des Alcooliques Anonymes mondiaux, section francophone. Littérature, ressources et information.', 'https://www.aa.org/fr', '', 'AA', ''],
['Drogue: Aide et Référence', 'Service d\'écoute, d\'information et de référence gratuit, confidentiel et bilingue 24h/24, 7j/7.', 'https://aidedrogue.ca', '1-800-265-2626', 'Urgence', ''],
['Al-Anon Québec', 'Soutien pour les familles et amis des personnes aux prises avec l\'alcoolisme.', 'https://al-anon-quebec.org', '1-844-725-2666', 'Famille', ''],
['Info-Social 811', 'Service de consultation téléphonique psychosociale 24h/24 au Québec.', 'tel:811', '811', 'Urgence', ''],
['Le Gros Livre (Big Book) en ligne', 'Le texte de base des Alcooliques anonymes, disponible gratuitement en ligne.', 'https://www.aa.org/fr/le-gros-livre', '', 'Lecture', ''],
['Pensée du jour', 'Méditations quotidiennes pour soutenir votre rétablissement.', 'https://www.aa.org/fr/meditations-quotidiennes', '', 'Méditation', ''],
['Suicide Action Montréal', 'Soutien et écoute pour personnes en détresse et leurs proches.', 'https://suicideactionmontreal.org', '1-866-277-3553', 'Urgence', '']
];
for (const r of resources) {
await db.run('INSERT INTO ressources (title, description, url, phone, category, image_url) VALUES ($1,$2,$3,$4,$5,$6)', r);
}
}

const eu = await db.get('SELECT COUNT(*) as c FROM reunions');
if (!eu || eu.c == 0) {
const reunions = [
['Lundi', '19h30', 'Centre communautaire Saint-Joseph', '125 rue de l\'Église, Québec', 'Ouverte', 'Réunion accessible à tous, accessible aux personnes à mobilité réduite.', ''],
['Mardi', '12h00', 'Église Notre-Dame', '88 boulevard Charest, Québec', 'Discussion', 'Réunion du midi, café offert.', ''],
['Mercredi', '20h00', 'Salle paroissiale Sainte-Marie', '450 rue Principale, Québec', 'Étapes', 'Étude des 12 étapes, parfait pour les débutants.', ''],
['Jeudi', '19h00', 'Centre Jean-XXIII', '2275 chemin Sainte-Foy, Québec', 'Débutants', 'Réunion spécialement pour les nouveaux membres.', ''],
['Vendredi', '20h00', 'Église Saint-Charles', '700 boulevard Charest Est, Québec', 'Ouverte', 'Témoignages, ouverte aux proches et amis.', ''],
['Samedi', '10h00', 'Centre Durocher', '1450 boulevard Wilfrid-Hamel, Québec', 'Tradition', 'Étude des traditions AA.', ''],
['Dimanche', '11h00', 'Salle communautaire Limoilou', '2330 1re Avenue, Québec', 'Discussion', 'Réunion du dimanche matin, atmosphère chaleureuse.', '']
];
for (const r of reunions) {
await db.run('INSERT INTO reunions (day, time, location, address, type, notes, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)', r);
}
}
};