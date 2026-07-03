-- ============================================================================
-- Météo d'marde — élargissement de la couverture
-- Laurentides + couronne nord de Montréal (St-Jérôme, Blainville, Ste-Thérèse,
-- Saint-Eustache, Terrebonne, Laval, Montréal).
-- Idempotent : ON CONFLICT (slug) DO NOTHING — ne dupliquera jamais un coin déjà
-- en banque, et réinsère l'ensemble au complet peu importe l'ordre seed/migration.
-- La météo reste 100 % en direct via Open-Meteo (lat/lng de chaque coin).
-- ============================================================================

INSERT INTO villages (nom, slug, lat, lng, altitude, microclimat, image_url, ordre) VALUES
('Saint-Sauveur', 'saint-sauveur', 45.8901, -74.1699, 240, 'Le fond de vallée par excellence : l''air frette dévale les pentes le soir pis s''écrase dans le village comme d''la mélasse. Deux degrés de moins que chez le voisin d''en haut, garanti.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039814/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039814128.png', 1),
('Mont-Tremblant', 'mont-tremblant', 46.1185, -74.5962, 265, 'En bas, c''est vivable. En haut d''la montagne, enlève huit degrés, rajoute un vent qui décoiffe pis un nuage personnel accroché au sommet à l''année.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039813/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813194.png', 2),
('Val-David', 'val-david', 46.0295, -74.2153, 335, 'Coincé entre deux monts, le village ramasse les averses que les autres échappent. Quand y mouille à Sainte-Adèle, icitte y mouille à siaux.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039814/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039814020.png', 3),
('Sainte-Agathe-des-Monts', 'sainte-agathe', 46.0448, -74.2817, 395, 'Le lac des Sables joue au thermostat : y tempère l''été, mais au printemps pis à l''automne, y crache une brume épaisse comme d''la soupe aux pois.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039815/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039815220.png', 4),
('Morin-Heights', 'morin-heights', 45.9005, -74.2469, 300, 'Le corridor à neige officiel. Les nuages arrivent de l''ouest, frappent les collines pis déchargent tout leur stock icitte. Les bancs de neige ont leur propre code postal.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039813/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813490.png', 5),
('Saint-Donat', 'saint-donat', 46.3186, -74.2211, 400, 'Le congélateur des Laurentides. Perché dans le bout, encaissé entre les monts : quand la radio dit moins vingt, icitte c''est moins vingt-huit pis on n''en parle pu.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783039814/tapavis_tenant_mereo-de-marde/build_mereo-de-marde_1783039813864.png', 6),
('Saint-Jérôme', 'saint-jerome', 45.7803, -74.0037, 175, 'La porte des Laurentides : là où la plaine se transforme en montagnes. Un pied dans le trafic de la 15, l''autre dans le bois. La météo hésite entre les deux pis fait à sa tête.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783045281/managed_agent_updates/ma_update_image_1783045281491.png', 7),
('Blainville', 'blainville', 45.6706, -73.8825, 55, 'Plate comme une table de cuisine, pis fière de l''être. Pas de montagne pour casser le vent : quand y vente, ça balaye les terrains de golf pis les stationnements d''un boutte à l''autre.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783045288/managed_agent_updates/ma_update_image_1783045288464.png', 8),
('Sainte-Thérèse', 'sainte-therese', 45.6403, -73.8478, 40, 'Coincée dans la couronne nord, entre la rivière des Mille Îles pis l''autoroute. L''humidité de la rivière te colle à peau l''été, pis le smog de Montréal monte visiter de temps en temps.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783045297/managed_agent_updates/ma_update_image_1783045297149.png', 9),
('Saint-Eustache', 'saint-eustache', 45.5656, -73.9044, 30, 'Assis su''l bord du lac des Deux Montagnes : le lac garde la chaleur l''automne pis crache une brume matinale à faire disparaître l''église. Les outardes te donnent la vraie météo avant la radio.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783045305/managed_agent_updates/ma_update_image_1783045305440.png', 10),
('Terrebonne', 'terrebonne', 45.7000, -73.6333, 30, 'La rivière des Mille Îles fait la pluie pis le beau temps, littéralement. Vieux-Terrebonne ramasse l''humidité, pis les nouveaux quartiers en béton chauffent comme un BBQ l''été.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783045314/managed_agent_updates/ma_update_image_1783045314388.png', 11),
('Laval', 'laval', 45.6066, -73.7124, 30, 'Une île de béton pognée entre deux rivières : l''îlot de chaleur officiel de la couronne nord. Deux-trois degrés de plus qu''ailleurs l''été, pis l''asphalte des Galeries qui te renvoie le soleil en pleine face.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783045323/managed_agent_updates/ma_update_image_1783045323182.png', 12),
('Montréal', 'montreal', 45.5019, -73.5674, 40, 'Le gros village d''en bas : îlot de chaleur assumé, canyon de vent entre les tours, pis un mont-Royal qui fait semblant d''être une montagne. Toujours quelques degrés plus chaud qu''en haut dans le Nord — pis ça sent le bagel.', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783045330/managed_agent_updates/ma_update_image_1783045330842.png', 13)
ON CONFLICT (slug) DO NOTHING;

-- Élargit la baseline copie vers la couronne nord — SEULEMENT si le boss n'a pas
-- déjà personnalisé le texte (WHERE value = ancien défaut).
UPDATE admin_settings SET value = 'La météo des Laurentides pis d''la couronne nord, dite comme du vrai monde.', updated_at = NOW()
  WHERE key = 'tagline' AND value = 'La météo des Laurentides, dite comme du vrai monde.';
UPDATE admin_settings SET value = 'Des Laurentides jusqu''à Montréal, chaque coin a sa marde. Données en direct, vérifiées à l''oeil pis au thermomètre — pis dites comme ta matante.', updated_at = NOW()
  WHERE key = 'hero_sous' AND value = 'Microclimats vérifiés à l''oeil pis au thermomètre. La seule météo qui te parle comme ta matante.';
UPDATE admin_settings SET value = 'Météo d''marde, c''est le bulletin météo hyper-local des Laurentides pis d''la couronne nord de Montréal — de Saint-Donat jusqu''à Laval : chaque coin a son microclimat, pis on le dit sans mettre de gants blancs. Des données en direct, des expressions d''icitte, pis zéro langue de bois.', updated_at = NOW()
  WHERE key = 'about_text' AND value = 'Météo d''marde, c''est le bulletin météo hyper-local des Laurentides : chaque village a son microclimat, pis on le dit sans mettre de gants blancs. Des données fraîches, des expressions d''icitte, pis zéro langue de bois.';

-- ============================================================================
-- Condition « nuit » (ciel clair la nuit — Open-Meteo is_day). Deux expressions
-- pour le dictionnaire. Idempotent : WHERE NOT EXISTS sur l'expression.
-- ============================================================================
INSERT INTO expressions (expression, signification, exemple, condition)
SELECT 'Un ciel propre comme un char neuf', 'Une nuitte parfaitement claire, pas un nuage pour cacher les étoiles.', 'Sors le télescope, le ciel est propre comme un char neuf à soir.', 'nuit'
WHERE NOT EXISTS (SELECT 1 FROM expressions WHERE expression = 'Un ciel propre comme un char neuf');
INSERT INTO expressions (expression, signification, exemple, condition)
SELECT 'Veiller à'' belle étoile', 'Passer la soirée dehors, en dessous des étoiles, parce que le ciel est trop beau pour rentrer.', 'On a fini la veillée à'' belle étoile, enroulés dans'' doudou su''l perron.', 'nuit'
WHERE NOT EXISTS (SELECT 1 FROM expressions WHERE expression = 'Veiller à'' belle étoile');
