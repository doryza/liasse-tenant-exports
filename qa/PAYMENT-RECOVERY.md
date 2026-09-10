# Mailing payment recovery

`payment-recovery-v1.js` is the common path for browser returns, explicit owner/operator verification, PayPal order/capture webhook nudges and the scheduled worker. No event payload or browser amount can settle a campaign: it looks up the stored order using the campaign's original live/sandbox credentials, validates its exact order ID, broker/campaign reference, CAD amount and completed capture, and retains the original invoice/tax/recipient snapshot.

The create payload and `PayPal-Request-Id` are stored before calling PayPal. A create timeout leaves a durable order receipt. Retrying preserves that payload/key; an approval URL is only exposed after the provider ID is saved. New identical pending checkouts are protected by a database unique index. Cross-process leases serialize verification, capture and cancellation. Captures reuse `vvcap-<campaign id>` and reread the order after the provider response, including a timeout or already-captured response.

Cancellation is an authenticated, CSRF-protected action. It first verifies the provider. A capture already started with an uncertain response cannot be locally cancelled; it remains in reconciliation. A cancelled local order is never captured by a later approval webhook. A confirmed completed capture always remains a paid record. Closing PayPal only returns to the receipt and never cancels an unrelated/latest order.

The scheduler calls `services.vendvitePaymentRecovery.run({req,limit:10})` every minute. `req` must provide the tenant's trusted canonical URL for invoice links. It only processes live, non-test orders initialized by this recovery release or explicitly verified since then. Old uninitialized pending orders stay visible for manual verification; the release does not unexpectedly capture abandoned historical checkouts. Sandbox checkout/return tests are explicit and never swept in the background. Per-order retry backoff caps at one hour. Failed invoice creation/delivery and durable operator-notification enqueueing are retried after payment without capturing again.

Owners have a permanent receipt at `/espace/commandes/:id` and paginated history at `/espace/commandes`. Receipts show the recorded quantity/amount, payment and postal preparation status, due date, invoice, omitted-address report and any buyer decision required for a shortfall. An expired session carries the exact allowed return token through the email sign-in confirmation. Operator verification is available at `/admin/campagnes/:id/paiement`.

## Validation

- `node --test qa/payment-recovery.test.cjs`: create timeouts, provider verification, duplicate callback leases, capture idempotency, uncertain cancellation, invoice/notification retry, sandbox/legacy exclusions, actual webhook settlement without browser return, owner isolation, CSRF and login context.
- `node --test qa/destination-tax.test.cjs`: existing countrywide tax allocation and invoice snapshots remain unchanged through real route calls with a mocked provider.
- `node qa/payment-recovery-browser.cjs`: mobile saved receipt, verify/resume, expired session, real email-form confirmation with captured test email, preserved PayPal return, paid receipt/invoice and desktop/mobile rendering. All PayPal calls and email delivery are isolated mocks.

PayPal behavior follows its official [Orders API](https://developer.paypal.com/api/rest/integration/orders-api/) and [idempotency guidance](https://developer.paypal.com/api/rest/reference/idempotency/). Webhook event bodies only identify an existing local order; [the provider lookup](https://developer.paypal.com/api/rest/webhooks/rest/) determines payment state.
