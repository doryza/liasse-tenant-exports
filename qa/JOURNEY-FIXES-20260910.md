# VendVite journey audit closure — September 10, 2026

This release addresses every finding in the September 10 journey audit. It changes the tenant application, additive tenant tables, and operational controls; original paid quantities, tax snapshots and invoices remain immutable.

| Audit finding | Implemented behavior | Verification |
| --- | --- | --- |
| Browser-only payment finalization | Durable create/capture identifiers, verified PayPal reads, webhook reconciliation, scheduled reconciliation, safe cancellation, owner receipt and operator verification. Expired sign-in preserves the exact local return context. | `payment-recovery.test.cjs`, `payment-recovery-browser.cjs`, invoice/tax/studio regressions |
| Homeowner request without contact | At least one usable email or telephone, client and server validation, preserved input on error. | `lead-followup.test.cjs`, `lead-followup-browser.cjs` |
| Paid mailing shortfall | Production is blocked until the authenticated buyer agrees to the exact reduced selection, quantity and unchanged CAD total. No implied refund or credit. Refusal keeps the order on hold. Any selection change invalidates consent. Operator reimport can restore missing original addresses. | `fulfilment-v2.test.cjs`, `fulfilment-browser.cjs` |
| Final unit bypasses history exclusions | Persist the order's history policy; recheck final civic/unit identities at import and approval; display prior date; serialize approvals per broker. | `fulfilment-v2.test.cjs`, campaign-history regressions |
| Silent lead/operator notification failures | Durable outbox, bounded retry/backoff and leases, explicit provider success, failed-job UI and operator retry. Existing invoice retry state is also reconciled. | `lead-followup.test.cjs`, `operations-browser.cjs`, payment/invoice regressions |
| Missing campaign results | Campaign/recipient attribution on visible-page activity and saved requests; per-mailing prepared quantity, deposit, visits, browser counts, requests, contacted and delivered outcomes. | `journey-tracking.test.cjs`, `recipient-access.test.cjs`, `operations-browser.cjs` |
| Mutable printed letter and no correction trail | Freeze content at checkout; immutable print snapshot; audited correction before deposit, QR invalidation, new approval; 100-recipient batches; exact revision, printed batches, count and date required for deposit. | `fulfilment-v2.test.cjs`, `fulfilment-browser.cjs`, operations/sandbox regressions |
| Unverified and missing activation attribution | Separate signup started from verified activation. Bind new and existing invitation accounts only after email-link confirmation. Sent solicitation lots remain the headline cohort. | `journey-tracking.test.cjs`, `operations.test.cjs`, onboarding regressions |
| Undefined manual CMA handoff | Homeowner email receipt when supplied; saved inbox request; visible 24-hour follow-up target and overdue state; automatic reminder; contact timestamp; explicitly attested manual delivery with method/reference and timestamp. Public wording says the broker follows up personally and agrees timing. | `lead-followup.test.cjs`, `lead-followup-browser.cjs` |
| Weak first-sign-in next action | Prominent page-ready action, progress guidance, unsaved-edit protection, then area selection. | Broker access/onboarding tests and page editor integration |
| Builder instead of payment receipt | Dedicated protected order page with amount, quantity, invoice, preparation state, deadline/hold and payment recovery. | `payment-recovery-browser.cjs` |
| Duplicate/spam homeowner requests | Stable submission key, bounded duplicate window, atomic per-recipient daily limit. | `lead-followup.test.cjs` |
| Wrong homeowner invalid-link destination | Homeowner recovery page with broker contact when a valid campaign context permits it; never expose recipient addresses. | Lead/recipient/three-step suites and mobile browser |
| French history/billing on English pages | Localized status text, date formats and billing labels. | Browser workspace rendering and regression suite |
| Inconsistent dispatch promise | 72 elapsed hours, explicitly including weekends; pending buyer/correction holds are visible. No unsupported business-day promise. | `three-step.test.cjs`, payment browser |
| Heavy large print runs | Maximum 100 recipients per print document, direct batch controls and records. | `fulfilment-v2.test.cjs` |
| Hidden older operational records | Paginated operator queue, owner order history, workspace campaign history and per-mailing results. Pending orders do not disappear after two hours. | Fulfilment/payment/browser tests |
| Database outage gives 500 | Catch authentication/language middleware outages and return the private friendly 503 workspace recovery response. | `broker-access.test.cjs` |

## Operating rules

- A reduced mailing is **never** approved by an operator checkbox alone. Buyer acceptance explicitly states that the original total remains payable and no credit/refund is created. A refusal requires resolving the missing addresses with the buyer; the paid order stays visible and cannot be silently cancelled.
- The postal-code lookup remains the operator's external manual task. The UI provides the exact CSV template and validates reimports, one selected unit per building, postal codes, duplicates and history exclusions.
- A comparative market analysis remains the broker's manual service. VendVite tracks acknowledgement and follow-up, while the broker explicitly records actual delivery. VendVite does not invent or automatically send a valuation report.
- Email provider acceptance is not proof of inbox delivery or reading. Failed and exhausted sends remain visible; delivery is at least once because a provider timeout can occur after acceptance.
- Payment tests use a mocked provider. No test makes a real charge, sends a real message or records a real postal deposit.

## Release verification

Use the scoped VendVite tenant importer after pushing the tested branch. Apply the four additive migration fragments to `tenant_vendvite` before activation, with exact pre-release generation/source verification. Read back all published source files and critical assets, verify authenticated operator pages and private APIs, then observe all three scheduled job heartbeats. The existing Cloudflare uptime monitor checks the minimal `/health/operations` endpoint every two minutes, waking the lazy tenant scheduler after a quiet restart and detecting stale workers. Startup receives a six-minute grace period; normal worker heartbeats must be newer than fifteen minutes.

Detailed module notes: `PAYMENT-RECOVERY.md`, `FULFILMENT-V2.md`, `LEAD-FOLLOWUP.md`.
