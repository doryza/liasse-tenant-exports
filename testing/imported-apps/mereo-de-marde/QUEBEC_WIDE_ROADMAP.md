# Météo d'marde — Québec-wide (provincial) roadmap

Scoping notes from 2026-07-03. Parked deliberately — revisit when we decide to scale
the app beyond the Laurentides + couronne nord.

## Core insight

The architecture is already fully data-driven: a "city" is just a `villages` row
(nom, slug, lat/lng, altitude, microclimat, image, ordre). Both weather providers
work for any coordinate — Open-Meteo takes raw lat/lng; the ECCC fallback has a
dynamic bbox resolver for villages not in the hand-verified `ECCC_SITES` map.
**Adding a city is an INSERT, not a feature.** The city "research" is the cheap,
scriptable part (Wikipedia/GeoNames, or `place-id-fetcher`).

## Where the real work lives (in cost order)

### 1. The voice, not the data
The product's soul is the joual *microclimat topo* per city ("le congélateur des
Laurentides", "l'îlot de chaleur officiel"). That's writing × N cities. AI can
draft (with regional flavor — the Saguenay deserves its « là là »), but a human
must curate the voice. Caricature images: the `image-swap-tool` pipeline generates
these at scale for near-zero cost (proven with the nuit share card) — each deserves
a review glance.

### 2. API budget forces one architecture change
Homepage fans out one Open-Meteo call per village per cold render (10-min cache):
13 cities ≈ 1,900 calls/day. At 60+ cities that blows past the free tier (10k/day).
Levers:
- Open-Meteo documents **batched multi-coordinate requests** (several lat/lngs in
  one call) — NOT yet verified live (API was down when scoped). Verify first; it
  collapses the problem alone.
- Lengthen the cache.
- Licensing: Open-Meteo free tier is **non-commercial only**. Productizing is the
  moment to either pay Open-Meteo (Standard plan) or flip **ECCC to primary**
  (free commercial use with attribution; 175 QC citypage sites cover a provincial
  roster — mapping them by name from
  `dd.weather.gc.ca/today/citypage_weather/docs/site_list_provinces_en.csv` is a
  script, not research). ECCC usage threshold: 86,400 req/day.

### 3. Navigation is the real redesign
A flat 13-card grid works; 80 doesn't. Provincial needs:
- `region` column on villages (small migration + admin field)
- region-grouped homepage or region pages
- search/autocomplete; ideally « ma météo » geolocation
- marker clustering on the carte

This is the largest genuine build item — a UX pass, not plumbing.

### 4. Rebrand is nearly free — with one trap
Name/tagline/hero/about are `admin_settings`; "Laurentides pis couronne nord"
appears in seed + the value-guarded migrations UPDATEs. **Keep the
`mereo-de-marde` slug** — it's the tenant identity (admin JWT slug check, cookies,
Cloudinary folders, start_url). Change display branding only.

## Effort tiers

| Tier | Scope | Effort |
|---|---|---|
| A | ~40 cities grouped by region headers, batch fetch, AI-drafted topos + generated caricatures, copy swap | a day or two, mostly curation |
| B | Full provincial IA: region pages, search, geolocation, map clustering, ECCC map expansion | +2–4 days |
| C | Productization: domain, commercial data licensing decision, per-region push alerts, per-city SEO | separate conversation |

Recommendation: Tier A first — already *feels* provincial, and defers the only
strategic decision (pay Open-Meteo vs. ECCC-primary) until there's traction.

## Invariants to respect when we do this

- Honest failure state: views gate on `m.ok` — never let a fallback condition
  render as a real reading.
- `ECCC_SITES` stays hand-verified (ECCC site coords are too sloppy for
  nearest-match); extend it by name from the site list, resolver as backstop.
- `/api/meteo-tous` uses raw `T.meteo_indispo` (not admin-overridable) — the carte
  InfoWindow concatenates unescaped HTML.
- New conditions need the hardcoded `COND` pill map in `admin-shell.ejs` updated.
- migrations.sql: idempotent, no semicolons inside strings, value-guarded UPDATEs
  (and beware the platform `migrationSqlRewriter` bug with value guards on the
  MA-update path).
