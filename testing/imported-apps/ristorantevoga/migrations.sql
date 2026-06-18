-- Ristorante Voga — migrations. Re-applied on every Push-to-Live /
-- re-materialization. Keep every statement idempotent and NON-destructive of
-- operator overrides.
--
-- Platform image slots are stored BARE (no Cloudinary transform segment — the
-- f_auto,q_auto,w_… transform is injected at render time). ON CONFLICT DO
-- NOTHING so an operator's later upload / inline-editor swap survives a
-- re-materialization (an upsert would clobber it).

INSERT INTO admin_settings (key, value) VALUES ('_p_nav_logo_url', 'https://res.cloudinary.com/duhp69meg/image/upload/ristorantevoga/site/voga_logo.png') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/ristorantevoga/site/hero_rigatoni.jpg') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_story_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/ristorantevoga/site/interior_banquettes.jpg') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_atmosphere_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/ristorantevoga/site/interior_room.jpg') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_wine_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/ristorantevoga/gallery/g12.jpg') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_tasting_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/ristorantevoga/gallery/g06.jpg') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_promo_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/ristorantevoga/site/capellini_dish.jpg') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_location_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/ristorantevoga/gallery/g30.jpg') ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_reservation_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/ristorantevoga/site/cocktail_flame.jpg') ON CONFLICT (key) DO NOTHING;
