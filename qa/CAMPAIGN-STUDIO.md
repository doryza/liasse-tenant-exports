# VendVite campaign studio

The campaign workspace opens with a Québec overview, controls on the left and an interactive map on the right. Desktop keeps the map available while scrolling; phones place it between the search and address list. The letter is loaded only when its preview dialog opens.

## Targeting and data semantics

- Search a Québec address, neighbourhood or city, choose a radius (400 m–5 km), then click “Find addresses”. One circle shows the search area; panning the map never changes it. No polygon drawing, map-picking mode, property-type filter, dwelling-count filter or source filter is presented.
- Retain at most the closest 4,000 candidate addresses; select 1–1,200 letters. Default selection uses the nearest mapped addresses regardless of property attributes. Estimated/interpolated numbers remain available for deliberate selection, visibly marked for verification.
- Search within the address list by street or civic number. Remove or restore one address from its row, map popup or address card. Bulk actions, undo and address CSV export remain available. Filling the target and rescanning preserve explicit exclusions for addresses still in the result set.
- Selected markers are gold; removed markers are grey. The list and summary show addresses and letter counts, with no incomplete building or dwelling statistics.
- Old polygon drafts restore their exact saved addresses and exclusions. The polygon is discarded in the editor and is not applied to future radius searches. Subsequent saves persist an empty polygon for compatibility.
- One selected civic/unit address equals one letter. Apartment numbers are never invented or multiplied from building counts. Postal distribution is still verified by the operator.

## Dependencies and coverage

Leaflet remains vendored under `public/vendor/leaflet`. Visible map tiles come from OpenStreetMap with attribution and normal browser caching. Photon provides location search. Bounded, cancellable Overpass queries find addresses and interpolation ranges, with a fallback mirror. Failed or incomplete searches preserve the current selection. The targeting page no longer requests building footprints or Montréal property enrichment.

Existing server-side property analysis helpers and historical data remain available for compatibility, but the targeting flow does not rely on their coverage. No new external service, API key or database migration is required.

## Persistence and billing

Drafts are private per broker, with the existing durable session and CSRF protection. A compare-and-swap revision rejects stale writes. Autosave has local recovery, retry and an explicit choice to open the saved draft after a conflict. Refresh and another device restore exact selections/exclusions. Checkout requires a successful draft save. Paid-order references allow recovery and completed drafts clear only after the server confirms the matching campaign was paid.

Quotes and orders use the exact selected quantity with integer-cent pricing and server-side recalculation. The included campaign is up to 150 letters, once per membership year; sending fewer consumes that campaign without rolling over the balance. Additional letters retain the existing $1.59 before taxes rate. Resumed pending campaigns retain their own reserved credit. A changed expected price requires another review, and a changed order payload gets a different PayPal idempotency key. Unit counts never affect billing.

## Validation

- `node qa/campaign-studio.test.cjs`: OSM/assessment semantics, duplicate record handling, missing counts, municipality/suffix/parity rejection, interpolation and polygon filtering; auth/CSRF, private drafts, revision races, exclusions, caching, exact quotes and mocked PayPal order creation/repricing.
- `node qa/campaign-browser.cjs`: local Playwright with source fixtures, map right/Québec overview, individual selection/removal/undo, address search, exact quote, cross-device draft restoration and conflict resolution, CSV export, lazy letter dialog, French/English at 1440/390/320 px. No real emails or payments.
- `node qa/radius-browser.cjs`: address-only Saguenay fixtures; radius bounds, legacy polygon removal, exclusion persistence on rescan/reload, failed-search recovery, new-draft reset, no enrichment requests, and 1440/390/320 px layouts.
- Existing `qa/broker-access.test.cjs`, `qa/broker-browser.cjs` and `qa/homepage.test.cjs` cover authentication/workspace and homepage experiment regressions.
- Real-source read check: one bounded 800 m OSM query and one 80-address assessment batch. 72/80 addresses matched official records in that sample. This sample is not a province-wide coverage estimate.

## Deployment

Radius simplification baseline: tenant 433 `vendvite`, generation 62. No migration is required. Verify the exact live generation/files against the captured baseline before importing VendVite through the scoped Liasse operator endpoint. Retain its automatic restore point and verify the served campaign JavaScript and CSS. The earlier save/publish visibility fix is preserved.
