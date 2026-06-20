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

-- ---------------------------------------------------------------------------
-- Real business facts from Google Places (place_id ChIJF4-Q7NnXyEwRTorFpzfVkmc),
-- fetched 2026-06-20 via place-id-fetcher. Populate-if-blank: fills missing or
-- empty values on the LIVE tenant (seed.js is first-install only) WITHOUT
-- clobbering later operator edits in Admin (DO UPDATE guarded on blank/NULL).
-- hours_json drives the footer hours table; the `hours` string is the
-- human-readable fallback. Hours: Wed-Sun 09:00-19:00, Mon-Tue closed.
-- ---------------------------------------------------------------------------
INSERT INTO admin_settings (key, value) VALUES ('contact_phone', '(450) 420-0003')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';
INSERT INTO admin_settings (key, value) VALUES ('business_address', '1185 Bd Curé-Labelle, Local 3, Blainville, QC J7C 4K6')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';
INSERT INTO admin_settings (key, value) VALUES ('hours', E'Mer-Dim : 9h - 19h\nLun-Mar : Fermé')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';
INSERT INTO admin_settings (key, value) VALUES ('hours_json', '[{"day":"mon","open":"","close":"","closed":true},{"day":"tue","open":"","close":"","closed":true},{"day":"wed","open":"09:00","close":"19:00","closed":false},{"day":"thu","open":"09:00","close":"19:00","closed":false},{"day":"fri","open":"09:00","close":"19:00","closed":false},{"day":"sat","open":"09:00","close":"19:00","closed":false},{"day":"sun","open":"09:00","close":"19:00","closed":false}]')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';
INSERT INTO admin_settings (key, value) VALUES ('google_place_id', 'ChIJF4-Q7NnXyEwRTorFpzfVkmc')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';
INSERT INTO admin_settings (key, value) VALUES ('map_embed_url', 'https://www.google.com/maps?q=1185%20Bd%20Cur%C3%A9-Labelle%20Local%203%2C%20Blainville%2C%20QC%20J7C%204K6%2C%20Canada&output=embed')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE admin_settings.value IS NULL OR admin_settings.value = '';
