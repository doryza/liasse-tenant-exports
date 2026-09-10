# VendVite operations admin

Navigation is now tracking/conversions, solicitation batches, agents and postal orders, with payment settings in the footer. Editorial tools and subscription-plan creation are absent from the operations UI; historical records and legacy subscription processing are retained. PayPal readiness for mailing operations requires the client ID and secret, not an annual plan. No live payment mode or credentials are changed by this release.

## Tracking

`agent_page_activity` separates invitation-page activity from residents following issued mailer QR links. Server-issued random tokens and a first-party HttpOnly browser cookie bind events to the actual rendered page. Raw GET requests do not count. The browser starts counting only while visible and sends a heartbeat every 30 seconds; active requires the last heartbeat within two minutes and a visible-state flag. Known bots, preview links, administrators and browsers carrying broker-session cookies do not participate. This is browser activity, not verified human identity or a bot-proof audience measurement. No IP address, third-party analytics or geolocation is stored.

The dashboard refreshes every 20 seconds while visible, retains a timestamp, and marks failures rather than presenting stale values as live. Visits can be filtered by date, batch and agent; recently visited invitation pages sort first. Solicitation rows paginate by 200. Organic accounts have a separate table (most recent 200). Claimed pages are registrations linked to invitations, not a promise of verified email identity. Paid conversions count non-test, non-sandbox, paid, non-cancelled mailer orders. The claimed/invited headline counts only agents in solicitation batches marked sent (`sent_at` present), including claims from that same cohort. Other totals are cumulative, and visitor periods are labelled separately. Historic raw request totals remain on batch detail pages explicitly labelled as old requests; they are not backfilled into new visitor metrics.

## Manual postal workflow

A paid/confirmed campaign supplies a UTF-8 CSV with exact columns:

`address_id,house_number,street,unit,city,province,postal_code`

The downloaded file is the real sample/template for that order; the UI also shows an example structure. Retain the `address_id` and civic location, add postal codes, and repeat a building's original ID with one returned unit per row. No calls are made to external postal services. Import size is capped at 3 MB and 12,000 rows. Unknown identifiers, changed buildings and duplicate units reject the whole import without changing existing preparation. Postal format and province must match; that check does not certify deliverability.

Preparation is stored separately in `broker_campaigns.production`; the original paid addresses, quantity and frozen tax snapshot remain unchanged. Available building/dwelling analysis and explicit unit numbers identify multi-unit cases. Missing analysis does not prove a building is a single residence. Known multi-unit buildings require an explicit unit choice, never guessed numbers. Single simple valid rows are preselected. The server enforces one recipient per building and no more recipients than ordered. Missing returned addresses, invalid codes and other known units remain in the review/report. Selection and approval use a compare-and-swap revision. Approval explicitly acknowledges prepared versus ordered counts, locks the list and moves the order to processing. No price adjustment, refund or credit is automatically issued for a shortfall.

Printing unmailed campaigns requires approval, including tests. Existing mailed campaigns retain historical printing compatibility. Prepared recipients have stable QR identities; an unchanged previously issued recipient identity is retained. Unit changes produce a new recipient identity. Reprinting uses the locked list. Unpaid, cancelled or unapproved orders cannot be marked mailed. Marking mailed records the operator's declaration and sends no external message or postal request.

Agents see an in-workspace notice and a private bilingual report with selected units, known omitted units, unavailable addresses, and ordered/prepared counts. They can download known unselected addresses for planning their next mailing. The report is not an automatic new order or a credit. Unknown unit numbers remain unknown. History exclusion checks use actual prepared recipients once a list is approved, so omitted units are not falsely counted as already targeted.

## Verification and deployment

- `node --test qa/operations.test.cjs` validates tracking/privacy, paid-only conversions, source matching, multi-unit rules, import validation, approval locking, print/status guards, private reports, stable QR links and future-mailing history.
- `node qa/operations-browser.cjs` exercises visible-page tracking, dashboard/mobile navigation, template download, file upload, explicit unit choice, locking and the broker report. Only local synthetic campaigns and mocked emails/QR generation are used.
- Regression suites cover agent batches, campaign history, exact quotes/taxes, invoices, recipient access and sandbox printing.
- Run the additive statements in `operations-migration-v1.sql` in the tenant schema before importing through the scoped VendVite importer. They also live in schema.sql/migrations.sql for clean installations. Capture the current generation and compare exact live source before publishing. No campaign, payment, solicitation or invitation is created/changed as part of production verification.
