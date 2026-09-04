# VendVite campaign studio

The campaign workspace opens with a Québec overview, controls on the left and an interactive map on the right. Desktop keeps the map available while scrolling; phones place it between the search and address list. The letter is loaded only when its preview dialog opens.

## Targeting and data semantics

- Search a Québec location, place a map centre, or draw a polygon. Radius: 400 m–5 km. Retain at most the closest 4,000 candidate addresses; select 1–1,200 letters.
- Default selection uses mapped addresses and skips explicit non-residential properties and interpolated numbers. Interpolated numbers remain available for deliberate selection, visibly marked for verification.
- Filter by building type, documented dwelling count, street and address source. Remove or restore one address from its row, map popup or property card. Bulk actions, undo and CSV export are available. Filling the target preserves explicit exclusions.
- One selected civic/unit address equals one letter. Building dwelling counts never create apartment numbers or multiply the mailing quantity. Postal distribution is still verified by the operator.
- OSM building tags supply mapped type, dwelling count, storeys and construction year when present. Missing `building:flats` stays unknown, even for a house. Storeys never imply dwellings.
- Montréal assessment data enriches exact normalized street/civic/municipality matches, with unit matching when supplied. Civic suffixes and ambiguous borough street names are conservatively rejected; even/odd ranges respect street side. Condominium records are aggregated only for complete query results. The property card identifies assessment scope; this is not a certified mailbox inventory. Shared assessment IDs are counted once in the summary.

## Dependencies and coverage

Leaflet 1.9.4 is vendored under `public/vendor/leaflet` with its BSD license. It was already the map dependency; no new npm package or API key is needed.

- Visible map tiles: https://tile.openstreetmap.org/ — attribution retained, origin-only referrer, normal browser caching, no offline/bulk prefetch. Policy: https://operations.osmfoundation.org/policies/tiles/
- Place lookup: Photon public API at https://photon.komoot.io/ (debounced search and explicit map reverse lookup).
- Address/building queries: Overpass public mirrors, client-side, bounded queries, timeout/cancel and fallback mirror. Failed or incomplete searches preserve the current selection.
- Official enrichment: https://donnees.montreal.ca/dataset/unites-evaluation-fonciere — CKAN resource `2b9dfc3d-91d3-48de-b32c-a2a6d9417079`. Server-side, no owner identity fields queried. Street and municipality ranges bound each batch; query capped at 2,001 records, with no derived counts if truncated. Analysis cache: 7 days for matches, 1 day for complete no-match results. Source failures are not cached as absence. Batched database writes; 75 enrichment requests/broker/minute, max 100 addresses/request.

Public services do not provide an SLA or complete province-wide property/unit coverage. For higher traffic, provision a supported tile/geocoder service or self-host; for wider authoritative Québec property coverage, add an indexed MAMH assessment import or a licensed property provider. These upgrades are optional future infrastructure and have not been purchased or provisioned.

## Persistence and billing

Drafts are private per broker, with the existing durable session and CSRF protection. A compare-and-swap revision rejects stale writes. Autosave has local recovery, retry and an explicit choice to open the saved draft after a conflict. Refresh and another device restore exact selections/exclusions. Checkout requires a successful draft save. Paid-order references allow recovery and completed drafts clear only after the server confirms the matching campaign was paid.

Quotes and orders use the exact selected quantity with integer-cent pricing and server-side recalculation. The included campaign is up to 150 letters, once per membership year; sending fewer consumes that campaign without rolling over the balance. Additional letters retain the existing $1.59 before taxes rate. Resumed pending campaigns retain their own reserved credit. A changed expected price requires another review, and a changed order payload gets a different PayPal idempotency key. Unit counts never affect billing.

## Validation

- `node qa/campaign-studio.test.cjs`: OSM/assessment semantics, duplicate record handling, missing counts, municipality/suffix/parity rejection, interpolation and polygon filtering; auth/CSRF, private drafts, revision races, exclusions, caching, exact quotes and mocked PayPal order creation/repricing.
- `node qa/campaign-browser.cjs`: local Playwright with source fixtures, map right/Québec overview, individual selection/removal/undo, filters, exact quote, cross-device draft restoration and conflict resolution, CSV export, lazy letter dialog, French/English at 1440/390/320 px. No real emails or payments.
- Existing `qa/broker-access.test.cjs`, `qa/broker-browser.cjs` and `qa/homepage.test.cjs` cover authentication/workspace and homepage experiment regressions.
- Real-source read check: one bounded 800 m OSM query and one 80-address assessment batch. 72/80 addresses matched official records in that sample. This sample is not a province-wide coverage estimate.

## Deployment

Baseline: tenant 433 `vendvite`, generation 52. Apply the three additive campaign table statements in both schema.sql and migrations.sql to `tenant_vendvite` before importing; Liasse's importer does not run migrations. Tables: `broker_campaign_drafts`, `campaign_property_cache`, `campaign_request_limits`. Verify the exact live generation/files against the captured baseline first. Import only VendVite from the testing branch using the scoped operator endpoint, verify both custom domain and platform mount, and retain its automatically created restore point. Rollback does not require dropping the additive tables.
