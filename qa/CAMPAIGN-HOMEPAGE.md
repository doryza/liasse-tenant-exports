# Campaign builder homepage

Tenant 433 (`vendvite`), baseline generation 53. The French and English homepages give equal prominence to the precision targeting campaign builder and personalized lead-capture system. A responsive HTML/SVG illustration shows the actual studio's location, radius, volume, property filter, address exclusions and review step using a clearly labelled 300-address example. It loads no maps, broker data or new dependencies.

The shared copy explains launching hundreds of letters, the included annual 150-letter campaign, separately billed additional letters, and the fulfillment center's printing, folding, envelopes, postage and Canada Post handoff. The post-form offer repeats the same benefits. Both pricing variants receive identical content; the existing experiment key, assignments, data and winner rules remain intact. This release is a shared content change within the existing pricing experiment, not a new experiment.

The builder anchor scrolls in place, preserving language, variant and safe preview context on the platform's base-URL mount. Versioned copy-module and asset URLs avoid stale tenant caches.

Validation:

- `node --test qa/homepage.test.cjs` — existing experiment integration, attribution, gating and payment rules.
- `node qa/harness.cjs`, then `node qa/campaign-homepage-browser.cjs` — both variants in FR/EN at 320/390/1440px, layout, content, builder link, preview-only submissions, CTA focus, form validation and price reveal.
- Set `PREVIEW_BASE=https://vendvite.app/` to run the same safe preview checks live. Screenshots remain local and gitignored.

Publish only VendVite through the scoped Liasse import-from-testing endpoint after verifying generation 53 and its exact files. No migrations. The importer creates a restore point. All existing studio, authentication and payment files are preserved; routes.js changes only the copy-module import.
