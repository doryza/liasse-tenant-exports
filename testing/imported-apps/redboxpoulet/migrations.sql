-- RED BOX — Poulet Nashville. Page imagery.
-- Slug: redboxpoulet
--
-- Re-applied on every Push-to-Live (runTenantSchemaIfNeeded re-materializes the
-- tenant dir). The _p_*_image_url rows use ON CONFLICT DO NOTHING (NOT DO
-- UPDATE) so an operator's later image upload via the admin dashboard survives
-- the next cache-invalidation cycle. URLs are stored BARE — the f_auto,q_auto,
-- w_… transform is injected at render time by cimg(), never baked into storage.
--
-- Image provenance: original redboxpoulet.ca brand assets re-hosted to
-- Cloudinary (logo_red, logo_white, hero, vibe, packaging, action + the 4 page
-- header banners) + Gemini-generated Nashville-tender product shots for the
-- menu (box_3/4/6filets, burger_solo, fries, texas_toast, slaw, sauce) and the
-- promise "gold standard" macro (tenders_macro).

-- Brand marks
-- Logo: force-restore the original full-size brand logos. A smaller logo was
-- uploaded via the dashboard and overwrote these; DO UPDATE (not DO NOTHING)
-- restores the originals on Push-to-Live. (Remove the force if a new logo is wanted.)
INSERT INTO admin_settings (key, value) VALUES ('_p_nav_logo_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232049/redboxpoulet/site/logo_red.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO admin_settings (key, value) VALUES ('_p_footer_logo_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232049/redboxpoulet/site/logo_white.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Home page imagery
INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232050/redboxpoulet/site/hero.png') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_story_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232050/redboxpoulet/site/vibe.png') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_feature_family_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232051/redboxpoulet/site/packaging.png') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_feature_burger_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232052/redboxpoulet/site/action.png') ON CONFLICT (key) DO NOTHING;

-- Notre Promesse — "gold standard" macro
INSERT INTO admin_settings (key, value) VALUES ('_p_promise_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232188/redboxpoulet/site/tenders_macro_1782232188334.png') ON CONFLICT (key) DO NOTHING;

-- Franchise — flagship store-in-store
INSERT INTO admin_settings (key, value) VALUES ('_p_flagship_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232050/redboxpoulet/site/vibe.png') ON CONFLICT (key) DO NOTHING;

-- Interior page header banners
INSERT INTO admin_settings (key, value) VALUES ('_p_header_menu_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232053/redboxpoulet/headers/header_menu.png') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_header_promise_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232053/redboxpoulet/headers/header_promise.png') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_header_franchise_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232054/redboxpoulet/headers/header_franchise.png') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_header_contact_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232055/redboxpoulet/headers/header_contact.png') ON CONFLICT (key) DO NOTHING;

-- ===========================================================================
-- Menu publish (idempotent). Guarantees the categories + items are present on
-- every Push-to-Live, even on a live tenant where seed.js (which only fills an
-- EMPTY menu) will not re-run. Categories upsert by unique slug; items insert only
-- if a row with the same name_fr is absent, so re-runs never duplicate.
-- Mirrors seed.js. We never UPDATE existing rows, so operator edits via the
-- admin backend survive.
-- ===========================================================================
INSERT INTO menu_categories (slug,name_fr,name_en,served_note_fr,served_note_en,position) VALUES ('solo','Les Boîtes Solo','The Solo Boxes','Servies avec frites ondulées, Texas toast et sauce signature RED BOX.','Served with wavy fries, Texas toast and signature RED BOX sauce.',1) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (slug,name_fr,name_en,served_note_fr,served_note_en,position) VALUES ('grosse','La Grosse Boîte','The Big Box','Le repas familial. Conçu pour partager.','The family meal. Built to share.',2) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (slug,name_fr,name_en,served_note_fr,served_note_en,position) VALUES ('burgers','Les Burgers & Extras','Burgers & Extras','','',3) ON CONFLICT (slug) DO NOTHING;

INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT 'Boîte 3 Filets','3-Tender Box','3 filets croustillants, frites ondulées, 1 Texas toast, 1 sauce.','3 crispy tenders, wavy fries, 1 Texas toast, 1 sauce.',12.99,'solo','https://res.cloudinary.com/duhp69meg/image/upload/v1782232169/redboxpoulet/menu/box_3filets_1782232169349.png',1,0,0
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='Boîte 3 Filets');
INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT 'Boîte 4 Filets','4-Tender Box','4 filets croustillants, frites ondulées, 1 Texas toast, 1 sauce.','4 crispy tenders, wavy fries, 1 Texas toast, 1 sauce.',14.99,'solo','https://res.cloudinary.com/duhp69meg/image/upload/v1782232169/redboxpoulet/menu/box_4filets_1782232168971.png',2,1,0
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='Boîte 4 Filets');
INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT 'Boîte 6 Filets','6-Tender Box','6 filets croustillants, frites ondulées, 1 Texas toast, 2 sauces.','6 crispy tenders, wavy fries, 1 Texas toast, 2 sauces.',18.99,'solo','https://res.cloudinary.com/duhp69meg/image/upload/v1782232169/redboxpoulet/menu/box_6filets_1782232169238.png',3,0,0
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='Boîte 6 Filets');
INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT 'La Grosse Boîte','The Big Box','Conçue pour partager. Poulet d''un côté, frites de l''autre, sauces au milieu. 12 filets croustillants, une montagne de frites ondulées, 4 Texas toasts beurrés et 4 sauces RED BOX.','Built to share. Chicken on one side, fries on the other, sauces in the middle. 12 crispy tenders, a mountain of wavy fries, 4 buttered Texas toasts and 4 RED BOX sauces.',36.99,'grosse','https://res.cloudinary.com/duhp69meg/image/upload/v1782232051/redboxpoulet/site/packaging.png',1,0,0
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='La Grosse Boîte');
INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT 'Burger Red Box Solo','Red Box Burger Solo','3 filets premium empilés dans un pain brioché, avec salade de chou fraîche et sauce maison.','Three premium tenders stacked in a brioche bun with fresh coleslaw and house sauce.',9.99,'burgers','https://res.cloudinary.com/duhp69meg/image/upload/v1782232169/redboxpoulet/menu/burger_solo_1782232169368.png',1,0,0
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='Burger Red Box Solo');
INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT 'Frites Ondulées','Wavy Fries','Portion régulière.','Regular portion.',3.99,'burgers','https://res.cloudinary.com/duhp69meg/image/upload/v1782232179/redboxpoulet/menu/fries_1782232179220.png',2,0,1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='Frites Ondulées');
INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT 'Texas Toast','Texas Toast','Beurre à l''ail, grillé.','Garlic butter, grilled.',1.99,'burgers','https://res.cloudinary.com/duhp69meg/image/upload/v1782232179/redboxpoulet/menu/texas_toast_1782232178583.png',3,0,1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='Texas Toast');
INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT 'Salade de Chou','Coleslaw','Crémeuse et fraîche.','Creamy & fresh.',2.49,'burgers','https://res.cloudinary.com/duhp69meg/image/upload/v1782232177/redboxpoulet/menu/slaw_1782232177035.png',4,0,1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='Salade de Chou');
INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT 'Sauce Red Box Signature','Red Box Signature Sauce','La sauce secrète (extra).','The secret sauce (extra).',0.50,'burgers','https://res.cloudinary.com/duhp69meg/image/upload/v1782232179/redboxpoulet/menu/sauce_1782232178894.png',5,0,1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='Sauce Red Box Signature');
INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT '1 Filet Extra','Extra Tender','','',3.49,'burgers',NULL,6,0,1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='1 Filet Extra');
INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra)
SELECT 'Boissons','Drinks','Fontaine, thé glacé, limonade.','Fountain, iced tea, lemonade.',2.49,'burgers',NULL,7,0,1
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name_fr='Boissons');

-- ===========================================================================
-- Contact ("Nous rejoindre") coordinates — address, phone, email. The contact
-- page + footer only render each field when its admin_settings row is non-empty
-- (and the map is derived from the address), so a missing/blank row hides the
-- whole block. Fill-if-empty: publish these values on Push-to-Live when the row
-- is absent or empty, but never overwrite a non-empty value an operator set.
-- ===========================================================================
INSERT INTO admin_settings (key, value) VALUES ('business_address', '110-2790 Boul. de la Pinière, Terrebonne, QC J6X 0G4')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';
INSERT INTO admin_settings (key, value) VALUES ('contact_phone', '(514) 886-4545')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';
INSERT INTO admin_settings (key, value) VALUES ('contact_email', 'info@redboxpoulet.ca')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';

-- ===========================================================================
-- Hero slider default — curated from our existing brand visuals (hero scene,
-- ambiance, action, gold-standard tenders macro), one BARE Cloudinary URL per
-- line. The home hero crossfades through these; cimg() injects the transform at
-- render. Fill-if-empty so the slider ships populated, but an operator's own
-- slide list (set in Admin → Bannière défilante) is never overwritten.
-- ===========================================================================
INSERT INTO admin_settings (key, value) VALUES ('hero_slides', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232050/redboxpoulet/site/hero.png
https://res.cloudinary.com/duhp69meg/image/upload/v1782232050/redboxpoulet/site/vibe.png
https://res.cloudinary.com/duhp69meg/image/upload/v1782232052/redboxpoulet/site/action.png
https://res.cloudinary.com/duhp69meg/image/upload/v1782232188/redboxpoulet/site/tenders_macro_1782232188334.png')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';

-- Native ordering host (linked Liasse Restaurants business #657). /commander +
-- the order-status pill call this host. Fill-if-empty so it publishes without
-- overwriting an operator override.
INSERT INTO admin_settings (key, value) VALUES ('order_base_url', 'https://redboxpoulet.liasse.tech')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';
