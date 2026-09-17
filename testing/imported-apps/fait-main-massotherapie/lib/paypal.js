/**
 * PayPal Orders v2 + Payments v2, server-authoritative.
 *
 * Rules that must not be relaxed:
 *  - the amount always comes from the database, never from the browser;
 *  - every order and capture is re-read from PayPal and matched against our
 *    own row (id, intent, custom_id, invoice_id, currency, amount, payee,
 *    final_capture) before a payment is ever recorded as received;
 *  - create and capture use stable request ids so a retry cannot double-charge;
 *  - credentials and environment are bound to the row at order creation.
 */
const S = require('./settings');

function cents(value) { if (!/^\d+\.\d{2}$/.test(String(value))) return NaN; return Number(String(value).replace('.', '')); }

function verifyOrder(order, row, merchant) {
  const units = order.purchase_units || [];
  const unit = units[0];
  if (order.id !== row.paypal_order_id
    || order.intent !== 'CAPTURE'
    || units.length !== 1
    || !unit
    || unit.custom_id !== 'order:' + row.id
    || unit.invoice_id !== row.order_key
    || !unit.amount
    || unit.amount.currency_code !== 'CAD'
    || cents(unit.amount.value) !== Number(row.total_cents)
    || !unit.payee
    || unit.payee.merchant_id !== merchant) throw S.error('paypal_mismatch', 409);
  return unit;
}

function base64(s) {
  const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < s.length; i += 3) {
    const x = s.charCodeAt(i); const y = s.charCodeAt(i + 1); const z = s.charCodeAt(i + 2);
    out += a[x >> 2] + a[((x & 3) << 4) | (Number.isNaN(y) ? 0 : y >> 4)]
      + (Number.isNaN(y) ? '=' : a[((y & 15) << 2) | (Number.isNaN(z) ? 0 : z >> 6)])
      + (Number.isNaN(z) ? '=' : a[z & 63]);
  }
  return out;
}

module.exports = function (services) {
  const db = services.db;
  const busy = new Set();

  function config() {
    const client = services.externalVars.PAYPAL_CLIENT_ID;
    const secret = services.externalVars.PAYPAL_CLIENT_SECRET;
    const mode = services.externalVars.PAYPAL_MODE;
    const merchant = services.externalVars.PAYPAL_MERCHANT_ID;
    if (!client || !secret || !mode || !merchant) throw S.error('paypal_setup', 503);
    if (!['sandbox', 'live'].includes(mode)) throw S.error('invalid', 503);
    return { client, secret, mode, merchant, base: mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com' };
  }
  function ready() { try { config(); return true; } catch (e) { return false; } }

  function enabled(raw, preview) {
    return !preview && S.flag(raw, 'payments_enabled') && S.flag(raw, 'payment_terms_approved')
      && S.flag(raw, 'live_actions_enabled') && S.both(raw.payment_terms) && ready();
  }
  function eligible(row, raw, preview) {
    return enabled(raw, preview)
      && row.status === 'awaiting_payment'
      && Number(row.total_cents) > 0
      && !['paid', 'pending', 'refunded', 'partially_refunded', 'denied'].includes(row.payment_status);
  }

  async function transport(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await services.fetch(url, Object.assign({}, options, { signal: controller.signal }));
      let data = {};
      try { data = await response.json(); } catch (e) {}
      if (!response.ok) {
        const issue = (data.details && data.details[0] && data.details[0].issue) || data.name || data.error || 'UPSTREAM_ERROR';
        throw S.error(response.status === 429 ? 'rate_limit' : 'paypal_provider', response.status === 429 ? 429 : 502,
          /^[A-Z0-9_]+$/i.test(issue) ? String(issue).toUpperCase() : 'UPSTREAM_ERROR');
      }
      return data;
    } catch (e) {
      if (e.name === 'AbortError') throw S.error('paypal_timeout', 504);
      if (e.code && e.status) throw e;
      throw S.error('paypal_timeout', 502);
    } finally { clearTimeout(timer); }
  }

  async function call(c, path, method = 'GET', body, key) {
    const auth = await transport(c.base + '/v1/oauth2/token', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + base64(c.client + ':' + c.secret), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    if (!auth.access_token) throw S.error('paypal_provider', 502, 'TOKEN_MISSING');
    const headers = { Authorization: 'Bearer ' + auth.access_token, 'Content-Type': 'application/json', Prefer: 'return=representation' };
    if (key) headers['PayPal-Request-Id'] = key;
    return await transport(c.base + path, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
  }

  function checkConfig(row, c) {
    if (row.paypal_mode !== c.mode || row.paypal_client_hash !== services.crypto.sha256(c.client)) throw S.error('manual_reconcile', 409);
  }

  async function sync(row) {
    if (!row.paypal_order_id) return row;
    const c = config();
    checkConfig(row, c);
    const order = await call(c, '/v2/checkout/orders/' + encodeURIComponent(row.paypal_order_id));
    const unit = verifyOrder(order, row, c.merchant);
    const captures = (unit.payments && unit.payments.captures) || [];
    let status = 'initiated';
    let capture = null;
    if (captures.length > 1) throw S.error('paypal_mismatch', 409);
    if (captures.length) {
      capture = await call(c, '/v2/payments/captures/' + encodeURIComponent(captures[0].id));
      if (capture.id !== captures[0].id || !capture.amount || capture.amount.currency_code !== 'CAD'
        || cents(capture.amount.value) !== Number(row.total_cents) || capture.final_capture !== true) throw S.error('paypal_mismatch', 409);
      const related = capture.supplementary_data && capture.supplementary_data.related_ids;
      if (related && related.order_id && related.order_id !== row.paypal_order_id) throw S.error('paypal_mismatch', 409);
      const map = { COMPLETED: 'paid', PENDING: 'pending', DECLINED: 'denied', DENIED: 'denied', FAILED: 'denied', REFUNDED: 'refunded', PARTIALLY_REFUNDED: 'partially_refunded' };
      status = map[capture.status] || 'pending';
      if (status === 'paid' && order.status !== 'COMPLETED') status = 'pending';
    } else if (order.status === 'VOIDED') status = 'denied';

    return await db.get(
      "UPDATE orders SET payment_status=$1,paypal_capture_id=COALESCE($2,paypal_capture_id),"
      + "status=CASE WHEN $1='paid' AND status='awaiting_payment' THEN 'paid' ELSE status END,"
      + "paid_at=CASE WHEN $1 IN ('paid','refunded','partially_refunded') THEN COALESCE(paid_at,NOW()) ELSE paid_at END,"
      + 'checked_at=NOW(),updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, capture ? capture.id : null, row.id],
    );
  }

  async function exclusive(id, fn) {
    if (busy.has(String(id))) throw S.error('conflict', 409);
    busy.add(String(id));
    try { return await fn(); } finally { busy.delete(String(id)); }
  }

  async function create(row, raw, preview, body) {
    return await exclusive(row.id, async () => {
      row = await db.get('SELECT * FROM orders WHERE id=$1', [row.id]);
      if (!eligible(row, raw, preview)) throw S.error('pay_unavailable', 409);
      if (body.accept_terms !== true) throw S.error('required');
      const c = config();

      if (row.paypal_order_id) {
        checkConfig(row, c);
        const order = await call(c, '/v2/checkout/orders/' + encodeURIComponent(row.paypal_order_id));
        verifyOrder(order, row, c.merchant);
        if (!['CREATED', 'SAVED', 'APPROVED', 'PAYER_ACTION_REQUIRED'].includes(order.status)) { await sync(row); throw S.error('conflict', 409); }
        return { orderId: row.paypal_order_id };
      }

      if (!row.order_key) {
        const locked = await db.get(
          "UPDATE orders SET order_key=$1,capture_key=$2,paypal_mode=$3,paypal_client_hash=$4,order_started_at=NOW(),payment_status='initiated',updated_at=NOW() "
          + "WHERE id=$5 AND order_key IS NULL AND status='awaiting_payment' RETURNING *",
          [services.crypto.randomUUID(), services.crypto.randomUUID(), c.mode, services.crypto.sha256(c.client), row.id],
        );
        if (!locked) throw S.error('conflict', 409);
        row = locked;
      }
      checkConfig(row, c);
      if (Date.now() - new Date(row.order_started_at).getTime() > 5 * 3600000) throw S.error('manual_reconcile', 409);

      const value = (Number(row.total_cents) / 100).toFixed(2);
      const itemTotal = (Number(row.subtotal_cents) / 100).toFixed(2);
      const taxTotal = ((Number(row.gst_cents) + Number(row.qst_cents)) / 100).toFixed(2);
      const shipping = (Number(row.shipping_cents) / 100).toFixed(2);

      const order = await call(c, '/v2/checkout/orders', 'POST', {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: String(row.id),
          custom_id: 'order:' + row.id,
          invoice_id: row.order_key,
          description: 'Fait Main Massotherapie ' + (row.reference || row.id),
          payee: { merchant_id: c.merchant },
          amount: {
            currency_code: 'CAD',
            value,
            breakdown: {
              item_total: { currency_code: 'CAD', value: itemTotal },
              tax_total: { currency_code: 'CAD', value: taxTotal },
              shipping: { currency_code: 'CAD', value: shipping },
            },
          },
        }],
        payment_source: { paypal: { experience_context: { shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' } } },
      }, row.order_key);

      if (!order.id || !/^[A-Z0-9]+$/.test(order.id)) throw S.error('paypal_provider', 502, 'ORDER_ID_MISSING');
      await db.run('UPDATE orders SET paypal_order_id=$1,updated_at=NOW() WHERE id=$2 AND order_key=$3', [order.id, row.id, row.order_key]);
      return { orderId: order.id };
    });
  }

  async function capture(row, raw, preview, body) {
    return await exclusive(row.id, async () => {
      row = await db.get('SELECT * FROM orders WHERE id=$1', [row.id]);
      if (!enabled(raw, preview)) throw S.error('pay_unavailable', 503);
      if (!row.paypal_order_id || body.orderId !== row.paypal_order_id) throw S.error('paypal_mismatch', 409);
      const c = config();
      checkConfig(row, c);
      const order = await call(c, '/v2/checkout/orders/' + encodeURIComponent(row.paypal_order_id));
      const unit = verifyOrder(order, row, c.merchant);
      if (unit.payments && unit.payments.captures && unit.payments.captures.length) return await sync(row);
      if (row.status !== 'awaiting_payment') throw S.error('pay_unavailable', 409);
      if (order.status !== 'APPROVED') throw S.error('pay_pending', 409);
      try {
        await call(c, '/v2/checkout/orders/' + encodeURIComponent(row.paypal_order_id) + '/capture', 'POST', {}, row.capture_key);
      } catch (e) {
        try {
          const recovered = await sync(row);
          if (['paid', 'pending', 'refunded', 'partially_refunded'].includes(recovered.payment_status)) return recovered;
        } catch (ignored) {}
        throw e;
      }
      return await sync(row);
    });
  }

  function publicConfig(row, raw, preview) {
    if (!eligible(row, raw, preview)) return { available: false };
    const c = config();
    return { available: true, clientId: c.client, mode: c.mode };
  }

  return { ready, enabled, eligible, create, capture, sync, publicConfig };
};

module.exports.verifyOrder = verifyOrder;
