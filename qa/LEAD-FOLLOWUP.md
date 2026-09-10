# Homeowner requests and analysis follow-up

The active broker capture endpoint requires name, property address, and a usable email or phone. The browser preserves data and presents inline errors. The server repeats validation and binds attribution to the validated mailing token and recipient key, never to submitted campaign IDs.

A browser submission key makes transport retries idempotent. Matching request/contact content within ten minutes is also deduplicated; a later inquiry can create a new request. A durable atomic gate permits at most five distinct requests per recipient over 24 hours. A hidden honeypot rejects common automated form fills. These controls reduce duplicates and token abuse; they do not claim perfect bot detection.

A single database statement saves each lead and its broker-notification job, plus a homeowner receipt when an email was provided. Email failure therefore cannot discard the request or silently lose its notification. `notification-outbox-v1.create(services)` exports:

- `enqueue(jobKey, emailPayload, {kind, brokerId, leadId, campaignId})`, idempotent by job key.
- `run({limit})`, leased delivery with persisted retry schedule (one minute exponential delay, capped at six hours, at most 12 attempts), followed by operator retry if exhausted.
- `summary()`, `list({limit,offset})`, and `retry(id)` for authenticated operator tooling.

The integration scheduler calls `lead-service-v1.create(services).enqueueOverdue({limit,workspaceUrl})` before the outbox worker. New leads get a 24-hour first-contact target. One overdue reminder per lead is durable and is cancelled before send if the broker has since contacted the homeowner, delivered the analysis or closed the request. Mail provider retries are at least once; a provider timeout after accepting a message can produce a duplicate receipt.

The inbox explains that the broker contacts the homeowner, agrees on timing, prepares and manually delivers the analysis. Status `contacté` records the first contact timestamp. Marking `évalué` requires explicit delivery attestation and a delivery method; the first delivery timestamp/method/reference are retained. This records a manual service, not an automatically sent or independently verified report. The public text no longer makes an unconditional 24-hour promise; the broker workspace and reminders retain the 24-hour target.

Invalid production QR links render a homeowner recovery page. A validated campaign token can expose the broker's public contact details, never the recipient address. Completely invalid links direct the homeowner to the contact information printed on the physical letter.

Validation (isolated fixtures, captured email stubs only):

```
node --test qa/lead-followup.test.cjs
node qa/lead-followup-browser.cjs
```

The suites cover client/server contact errors, atomic queue persistence, attribution, duplicate and later inquiries, concurrent submission limits, email failure/retry, exhausted interrupted leases, reminder cancellation, ownership isolation, manual-delivery attestation and timestamps, live inbox counters, and mobile invalid-link recovery.
