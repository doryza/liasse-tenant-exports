# VendVite homepage pricing test

Experiment: `homepage-price-v1` (tenant 433). Production baseline: generation 47.

- A (`visible`): $599/year + taxes before the form.
- B (`gated`): says pricing follows the form; the server returns the same annual offer immediately after successful submission, before activation/payment.
- Same content and form in both versions. FR and EN. Responsive at 320px and up.
- Preview: `/?vv_preview=visible` or `/?vv_preview=gated`, with optional `&lang=en`. Preview submissions return a demonstration response without writing an application or sending messages.
- Admin: `/admin/conversions`, protected by the existing tenant admin check.

## Measurement and automatic priority

Anonymous HttpOnly, SameSite=Lax browser cookie; stable 180-day assignment persisted in tenant Postgres. Start 50/50. Client-visible exposures, form starts and CTA clicks are idempotent; a newly persisted broker is attributed server-side. Repeat applications do not count. Known bots, logged-in admins and previews are excluded. The browser identifier is not an identity: clearing cookies or using another device can create another visitor. No fingerprinting or IP storage is added.

Primary objective is unique paid subscribers per exposed visitor. Join broker IDs to real, positive live subscription invoices. Exclude sandbox, extra mailing purchases and repeat invoices. The dashboard also shows lead conversion and cumulative paid conversion.

Decisions use a 14-day conversion window, with equal fully matured cohorts. Eight preplanned looks per arm: 250, 500, 1k, 2k, 4k, 8k, 16k, 32k. Each look is consumed once, even when inconclusive. Require 20 total paid conversions and non-overlapping Wilson intervals (z=3; conservative Bonferroni adjustment across eight looks and two arms, approximate binomial coverage). Checks run at most hourly on traffic or dashboard visits. No decision is based on repeated peeking at raw lead rates. New visitors move to 90/10 when a winner is established; existing assignments stay stable. After eight inconclusive looks, remain 50/50; a future test needs a new experiment key rather than resetting this one. This deliberately favors evidence over selecting a winner from a few leads.

## Validation

`node --test qa/homepage.test.cjs`: isolated PGlite/Postgres-compatible DB and Express route integration. Assignment persistence, no initial gated price, safe previews, validation, duplicates, payment exclusions, attribution, protected admin route, tenant path mounting, mature cohorts, winner logic.

`node qa/harness.cjs`, then `node qa/browser.cjs`: local previews; 12 Playwright scenarios at 320/390/1440px in FR/EN, both variants, validation, keyboard focus, price reveal, no overflow or JS errors. Email transport is stubbed. Screenshots remain local in qa (gitignored).

Dependencies resolve from the installed Liasse platform node_modules; no production dependency is added.

## Deployment / rollback

Apply only the additive homepage table statements in schema.sql (same statements are appended to migrations.sql) in the `tenant_vendvite` schema. The existing Push-to-Live importer does not execute migrations. Confirm live generation still matches the captured baseline before deploying. Use the existing Liasse operator import-from-testing endpoint; it creates a restore point and updates files/cache/storage through the standard pipeline. Rollback uses that restore generation. The additive tables can remain after rollback; do not delete measured data.
