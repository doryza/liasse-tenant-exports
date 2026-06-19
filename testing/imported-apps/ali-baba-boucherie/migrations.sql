-- Ali Baba Grillades — tenant image settings.
-- Slug: ali-baba-boucherie
--
-- IMPORTANT: ON CONFLICT DO NOTHING (not DO UPDATE) on the _p_*_image_url
-- rows so tenant-side customizations (e.g. operator's dashboard icon upload,
-- which writes _p_nav_logo_url via setPwaIconAndMirror) survive the next
-- cache-invalidation cycle. runTenantSchemaIfNeeded re-applies this whole
-- file every time the tenant dir is re-materialized, so an upsert would
-- silently clobber operator overrides on every re-render.
--
-- _p_*_image_url values are stored BARE (the f_auto,q_auto,w_1280,c_limit
-- transform segment is injected at render time by subscriberPwaRouter, never
-- stored). Hero + about reuse the business's own charcoal-grill photos from
-- the Liasse Restaurants ordering menu (business 296).

INSERT INTO admin_settings (key, value) VALUES ('_p_nav_logo_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1771379528/tapavis_logos/ali-baba-boucherie/o2n6ufhn1givosddjvgc.png')
  ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781898959/tapavis_menu/296/l6qrlo9ykavj0wszyh2c.jpg')
  ON CONFLICT (key) DO NOTHING;
INSERT INTO admin_settings (key, value) VALUES ('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1781898961/tapavis_menu/296/zkpkruhfiq2vqdzvisx0.jpg')
  ON CONFLICT (key) DO NOTHING;
