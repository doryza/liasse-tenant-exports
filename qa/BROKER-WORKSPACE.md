# Accepted broker workspace

The homepage links to `/connexion`. Marked native broker links and signout controls handle clicks before the platform SDK, whose document-level login keyword matching would otherwise divert them into the generic platform login. An authenticated browser goes straight to `/espace`; otherwise the broker requests a sign-in email using the invitation address. Public profile email edits never change the sign-in identity.

## Access model

- Approved statuses: invited, active, cancelled, expired. Workspace access survives subscription expiry so brokers can manage membership and existing requests. Publishing and paid operations retain their separate payment checks. Applied/refused accounts cannot sign in.
- Initial invitation: 72 hours. Self-service login: 1 hour. Random 256-bit credentials are stored as SHA-256 hashes. GET/HEAD only show confirmation; a cookie-bound POST atomically consumes the credential and creates the session. Email scanners cannot consume it with a preview.
- Random opaque session in `vv_broker_session`, HttpOnly, Secure on HTTPS, SameSite=Lax. Server-side hash, device label and expiration are stored in `broker_sessions`. Every authenticated visit renews a 30-day idle window, capped at 90 days from sign-in. Cookies persist across browser restarts.
- Clicking a previously used invitation while signed in opens the workspace, including more than ten clicks. A new device or signed-out browser needs a fresh email credential. Reusable bearer links are deliberately avoided.
- Account page lists active device sessions. Sign out one device or all. Refusal revokes sessions/tokens. All-device signout/refusal also invalidate old signed cookies using `auth_valid_after`; migration accepts only authentic legacy signatures under the real platform secret, never the old `vv` fallback.
- Sign-in request limits are stored in Postgres: 30/IP/hour; 5/email/hour with 60 seconds between requests. Bucket keys are hashed. Known/unknown/unaccepted addresses get the same response. Failed mail delivery revokes that token; logs omit email/token contents.
- Mutations require a session-bound CSRF token and origin checks. Chromium form posts from no-referrer pages send `Origin: null`; this is allowed only with `Sec-Fetch-Site: same-origin` plus the unpredictable cookie-bound token.
- Auth/workspace responses enforce private/no-store, no-referrer, and the platform's service-worker cache exclusion header. Authentication/DB failures return a recovery page or 503 JSON and fail closed.

## Workspace behavior

Overview shows page visibility, membership, incoming requests and the next setup action. Separate pages cover profile, mailing, requests, membership and account. All new copy is FR/EN; navigation supports narrow screens.

Profile updates validate required identity/contact information and use a database revision for optimistic concurrency. A stale tab gets 409 `PROFILE_CONFLICT` without overwriting the stored profile. A validated profile save completes personalization without publishing. Publishing also records completion; existing published pages count as personalized. Publishing retains the active-membership check. Portraits use unique asset names, a revision check, and an 8 MB original-file limit. Failed/conflicting uploads may leave an unreferenced asset; they never replace another tab's existing portrait.

Save and network errors are visible. Drafts remain in the current page; leaving warns of unsaved changes. After an expired session, sign in in another tab and retry; CSRF refresh only replays a request rejected before mutation. Lead writes are serialized per row and show saved/error/retry feedback; lead ownership and allowed statuses are checked server-side. Search and status filters operate on the latest 200 displayed requests.

## Verification

`node --test qa/broker-access.test.cjs qa/homepage.test.cjs`

Isolated PGlite database, real Express routes, mocked mail/payment/cloud services. Covers scanner visits, atomic concurrent redemption, 12 reused invitation clicks, idle/absolute expiry, tampering, legacy migration/revocation, approved-only access, rate limits, CSRF, profile conflicts, upload size, lead ownership/status, tenant alias mounting, DB outages and existing homepage A/B behavior.

`node qa/broker-browser.cjs`

Playwright: homepage login request, sign-in confirmation, six workspace pages at 1440/390/320 pixels in both languages, profile saves/conflicts, failed lead saves/retry, filtering, old invitation reuse and signout. Screenshots stay local and no real emails or payments are sent.

## Deploy and rollback

Apply the additive block labelled `Persistent broker access and optimistic profile saving` in schema.sql to `tenant_vendvite` before importing files. The Liasse importer does not run migrations. Baseline before this change: generation 50. Keep the automatic import restore point. The added tables/columns may remain after a code rollback.

Liasse can retain nested required modules across tenant updates. Version the auth helper filename whenever changing its exports in a subsequent deployment. No new runtime package is required.

## Save and publish visibility

The editor presents save, preview and publication controls above the fields. The toolbar stays at the top of the viewport while scrolling. Published pages show their live status, save action and public page link; unpublishing remains a secondary action at the bottom.

For active members with a private page, the overview puts publication above the summary cards and permits publishing the saved profile directly. Preview pages link back to the editor toolbar. Unpaid editors save first and continue to membership; publication never starts a payment itself.

`node qa/publish-browser.cjs` exercises FR/EN at 1440×800, 390×568 and 320×568: initial/sticky control visibility, validation, personalization completion on save, no implicit publication, version conflicts blocking publication, preview navigation, publication from editor and overview, legacy live pages, and the unpaid membership handoff. All data is isolated in PGlite with external requests blocked.
