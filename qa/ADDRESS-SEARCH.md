# Address search reliability — September 8, 2026

The screenshot shows an address scan, which requests OpenStreetMap data from public Overpass servers in the browser. No historical browser response/error was retained for the reported first failure, so its exact cause cannot be proved retrospectively.

## Findings

- The previous scan tried two providers silently, with up to 40 seconds per request. Its button continued to say “Find addresses,” and the pending-map heading inherited low-contrast dark-theme styling.
- No automatic retry remained after the two providers failed; the user had to start again. Busy responses, timeouts and incomplete Overpass results were presented alike.
- Explicit place searches had no request identity or abort control. An earlier Photon response could change the centre after a newer query or map choice. Autocomplete also left obsolete network calls running.
- Overpass documents public-instance load shedding (429/504 responses and queued requests). Public-instance availability remains an external dependency, not an availability guarantee. The manual advises a dedicated instance for production applications at scale: https://dev.overpass-api.de/overpass-doc/en/preface/commons.html

## Implemented

- Versioned `address-search-v1.js` performs sequential bounded retries for network errors, timeouts, busy/server responses, malformed JSON and incomplete results. Permanent HTTP errors and oversized responses stop immediately. Valid empty results are not retried.
- Address scans make at most three attempts, alternating the existing providers, with increasing pauses, per-provider Retry-After cooldown and a 100-second network budget. Requests have 40-second client timeouts; the Overpass execution timeout is 20 seconds, leaving room for the documented queue delay. The existing query coverage is retained.
- Explicit place search gets two attempts within 28 seconds. Autocomplete does not retry in the background. Obsolete autocomplete and explicit search requests are aborted and their results ignored.
- Uses ordinary AbortController plus cleaned-up timers/listeners instead of requiring AbortSignal.any/timeout for scan/geocode. Cancellation interrupts fetch, response reading and retry pauses. New-area/map changes invalidate prior work.
- Controls and map show a high-contrast spinner, stage, attempt and elapsed time. Buttons explicitly say searching. Reduced-motion preferences stop spinner animation. The control status is announced; duplicate map status is hidden from screen readers.
- After exhaustion, a manual retry action remains available in controls and on the map. Existing addresses/selections survive cancellation, failure and valid empty responses. No partial upstream results replace them. Oversized areas get a reduce-radius message.

## Checks

`node --test qa/address-search.test.cjs` covers provider fallback, incomplete/invalid responses, permanent errors, empty results, timeouts, cancellation during fetch/backoff, Retry-After and bounded attempts.

`node qa/address-search-browser.cjs` exercises the real UI with mocked upstream errors: geocoder retry, address-provider failover, progress states, failure/manual retry, selection preservation, cancellation and stale place responses. Desktop/mobile screenshots are inspected. Network calls are mocked; no payments or customer email.

National map and mixed-destination tax browser checks, plus campaign/draft/address/recipient tests, verify existing flows remain functional. Deployment uses the tenant importer with an exact live-generation/file baseline comparison; no database migration or infrastructure provisioning is required.
