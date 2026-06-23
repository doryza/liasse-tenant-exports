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
INSERT INTO admin_settings (key, value) VALUES ('_p_nav_logo_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232049/redboxpoulet/site/logo_red.png') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_footer_logo_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232049/redboxpoulet/site/logo_white.png') ON CONFLICT (key) DO NOTHING;

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
