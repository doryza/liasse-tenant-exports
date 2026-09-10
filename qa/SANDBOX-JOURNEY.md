# VendVite sandbox rehearsal

Start at `/espace/tests` while signed in as the agent. Enable **Mode test**, then create a test order. This choice belongs to the current authenticated browser session (cookie expires after 24 hours); it does not change the tenant's global PayPal mode. Use a **personal PayPal sandbox buyer account** at checkout, as described in [PayPal's sandbox account guide](https://developer.paypal.com/sandbox-testing/accounts).

## Rehearsal

1. Choose addresses, review the personalized letter, and approve the sandbox payment. Drafts and address-history exclusions are separate from live campaigns. Sandbox billing begins with the real address as a prefill; saved test edits use separate billing fields.
2. Reopen the saved test order to verify payment, resume an incomplete approval, download its test invoice, or view simulated emails. The scheduled recovery worker handles initialized test payments even after the browser closes.
3. In admin **Commandes postales → Tests**, export the postal file and use the downloadable CSV template. Perform the external postal-code lookup manually, reimport, select one unit per building, handle any buyer shortfall decision, approve, open each print batch, and record a **simulated deposit**. All normal production checks still apply.
4. Open a private test homeowner link from the prepared order. The owning agent or an authenticated operator can submit a test analysis request. Anonymous users and other agents cannot use that link; production recipient links reject test campaign tokens.
5. Open **Demandes de test**. Simulate an overdue first contact, inspect its reminder preview, record contact, and confirm simulated analysis delivery with a method/reference. The comparative market analysis remains a manual broker service; VendVite does not generate or transmit a valuation report.
6. Review **Courriels simulés**. These are durable, escaped text previews of invoice, operator, homeowner, agent and reminder messages. They do not reach an email provider. Sign-in messages still work normally. Leave test mode to create a real order; existing orders always retain their stored mode.

Profile and page content belong to the same agent account. Their shared nature is explicitly indicated while editing in test mode; publishing requires leaving test mode. Test billing, drafts, orders, leads, reminders and mailing history remain isolated. Live conversion figures, lead inboxes and production queues exclude test records.

## Checks

- `sandbox-session.test.cjs`: explicit opt-in, CSRF, session-bound marker, unchanged global mode and safe login return paths.
- `sandbox-checkout.test.cjs`: mode-bound drafts/quotes/proofs/orders, stale tabs, opposite-mode reprise, isolated billing/history, no sandbox page publication, automatic payment and preview completion.
- `sandbox-payment-recovery.test.cjs`: durable creation/capture recovery, strict credential/hostname/currency/reference checks, uninitialized legacy-test exclusion, invoice preview retry.
- `sandbox-leads.test.cjs`: authoritative test attribution, owner/admin authorization, duplicate/rate controls, queue retries and cancellation, live/test inbox isolation.
- `sandbox-workspace.test.cjs`: preview privacy and escaping, scoped preview generation, test-only admin controls.
- `sandbox-fulfilment.test.cjs`: unchanged production guards, simulated shortfall/deposit wording, private recipient links, final-address history isolation.
- `sandbox-order-browser.cjs`: complete mobile agent order through mocked PayPal, desktop operator preparation/print/deposit, homeowner request and agent follow-up; no real charges, mail or deposit.
- `sandbox-lead-browser.cjs`: mobile test form, sign-in/CSRF recovery with preserved fields, follow-up and email previews.
- Existing production regression suites remain required.

Apply `sandbox-migration-v1.sql` to the VendVite tenant schema before activating the new versioned modules. Keep the existing three scheduler job names and uptime wake-up checks. Verify published sources, private endpoints, assets, and fresh worker heartbeats after the tenant-only import.
