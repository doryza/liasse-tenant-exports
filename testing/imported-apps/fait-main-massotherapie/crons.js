const makePayPal = require('./lib/paypal');

/**
 * Background reconciliation: read-only polling of PayPal for orders whose
 * payment is still open, so a capture that completed out of band is picked
 * up even if the browser never came back. Never creates or captures.
 */
module.exports = function (services) {
  const paypal = makePayPal(services);
  services.scheduler.register('faitmain-payment-reconciliation', 300000, async ({ db }) => {
    try {
      const raw = Object.fromEntries((await db.all('SELECT key,value FROM admin_settings')).map((x) => [x.key, x.value]));
      if (!paypal.enabled(raw, !!(services.config.isPreview || services.config.preview))) return;
      const rows = await db.all(
        "SELECT * FROM orders WHERE paypal_order_id IS NOT NULL AND payment_status NOT IN ('refunded','denied') "
        + "AND created_at > NOW() - INTERVAL '180 days' ORDER BY checked_at ASC NULLS FIRST LIMIT 10",
      );
      for (const row of rows) {
        try { await paypal.sync(row); } catch (e) {
          try { await db.run('UPDATE orders SET checked_at=NOW() WHERE id=$1', [row.id]); } catch (ignored) {}
        }
      }
    } catch (e) {}
  });
};
