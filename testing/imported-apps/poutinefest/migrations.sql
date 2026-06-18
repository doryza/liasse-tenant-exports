-- LePoutineFest et Ramen T Fest — migrations. Re-applied on every Push-to-Live /
-- re-materialization. Splits on ';', no transaction — keep statements single-row
-- and free of embedded semicolons.
--
-- Real business facts pulled from Google Places (place-id-fetcher) on 2026-06-18:
--   1000 Bd Lachapelle, Saint-Jérôme, QC J7Z 7M4 · (450) 516-0044
--   Mon–Thu 11:00–21:00 · Fri–Sat 11:00–23:00 · Sun 11:00–21:00
--
-- These keys INTENTIONALLY OVERWRITE the stale/blank live values (DO UPDATE):
-- we are correcting incorrect data, not seeding blanks, so operator-edit-wins
-- (DO NOTHING) would silently no-op against the existing rows.

INSERT INTO admin_settings (key, value) VALUES ('contact_phone', '(450) 516-0044')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

INSERT INTO admin_settings (key, value) VALUES ('hours_json', '[{"day":"mon","open":"11:00","close":"21:00","closed":false},{"day":"tue","open":"11:00","close":"21:00","closed":false},{"day":"wed","open":"11:00","close":"21:00","closed":false},{"day":"thu","open":"11:00","close":"21:00","closed":false},{"day":"fri","open":"11:00","close":"23:00","closed":false},{"day":"sat","open":"11:00","close":"23:00","closed":false},{"day":"sun","open":"11:00","close":"21:00","closed":false}]')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

INSERT INTO admin_settings (key, value) VALUES ('hours', E'Lun-Jeu : 11h - 21h\nVen-Sam : 11h - 23h\nDim : 11h - 21h')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
