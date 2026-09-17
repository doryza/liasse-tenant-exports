const S = require('./settings');

const MAX_LINES = 30;
const MAX_QTY = 20;

/** Public projection of an order row — never leaks PayPal internals. */
function publicRow(row, lang, items) {
  if (!row) return null;
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    paymentStatus: row.payment_status,
    fulfilment: row.fulfilment,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    address: {
      line: row.address_line || '', city: row.address_city || '',
      province: row.address_province || '', postal: row.address_postal || '',
    },
    note: row.note || '',
    subtotalCents: Number(row.subtotal_cents),
    shippingCents: Number(row.shipping_cents),
    gstCents: Number(row.gst_cents),
    qstCents: Number(row.qst_cents),
    totalCents: Number(row.total_cents),
    createdAt: row.created_at,
    paidAt: row.paid_at,
    items: (items || []).map((i) => ({
      name: i.name_snapshot, variant: i.variant || '',
      unitPriceCents: Number(i.unit_price_cents), quantity: Number(i.quantity),
      lineCents: Number(i.line_cents), imageUrl: i.image_url || '',
    })),
    updatedAt: row.updated_at,
  };
}

/**
 * Price a basket entirely from the database. The browser only ever says
 * *which* product and *how many* — never what it costs.
 */
async function price(services, raw, cart, fulfilment) {
  const lines = Array.isArray(cart) ? cart.slice(0, MAX_LINES) : [];
  if (!lines.length) throw S.error('cart_empty_error', 400);

  const wanted = [];
  for (const line of lines) {
    const slug = String((line && line.slug) || '').slice(0, 80);
    const quantity = Math.floor(Number(line && line.quantity));
    if (!slug || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) throw S.error('invalid');
    wanted.push({ slug, quantity, variant: String((line && line.variant) || '').slice(0, 120) });
  }

  const rows = await services.db.all(
    'SELECT * FROM products WHERE slug = ANY($1::text[]) AND published=1',
    [wanted.map((w) => w.slug)],
  );
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  const priced = [];
  let subtotal = 0;
  let taxable = 0;
  for (const want of wanted) {
    const product = bySlug.get(want.slug);
    if (!product || !product.in_stock) throw S.error('stock_changed', 409);
    // A chosen option must be one the product actually offers.
    let variant = '';
    let options = [];
    try { options = product.variants ? JSON.parse(product.variants) : []; } catch (e) { options = []; }
    if (Array.isArray(options) && options.length) {
      if (!want.variant || !options.includes(want.variant)) throw S.error('variant_required', 400);
      variant = want.variant;
    }
    const unit = Number(product.price_cents);
    const lineCents = unit * want.quantity;
    subtotal += lineCents;
    if (product.taxable) taxable += lineCents;
    priced.push({
      productId: product.id, name: product.name, nameEn: product.name_en,
      slug: product.slug, variant, unitPriceCents: unit, quantity: want.quantity,
      lineCents, taxable: product.taxable ? 1 : 0, imageUrl: product.image_url || '',
    });
  }

  const shipping = shippingFor(raw, fulfilment, subtotal);
  const { gst, qst } = S.taxes(raw, taxable, shipping.cents);
  return {
    items: priced,
    subtotalCents: subtotal,
    shippingCents: shipping.cents,
    shippingFree: shipping.free,
    gstCents: gst,
    qstCents: qst,
    totalCents: subtotal + shipping.cents + gst + qst,
  };
}

/**
 * Pickup is always free. Shipping only exists once the owner has both
 * enabled it and entered a rate — we never invent a delivery price.
 */
function shippingFor(raw, fulfilment, subtotalCents) {
  if (fulfilment !== 'shipping') return { cents: 0, free: true };
  if (!S.flag(raw, 'shipping_enabled')) throw S.error('operation_disabled', 409);
  const flat = Number(raw.shipping_flat_cents);
  if (!Number.isFinite(flat) || flat < 0) throw S.error('operation_disabled', 409);
  const threshold = S.num(raw, 'free_shipping_threshold_cents', 0);
  if (threshold > 0 && subtotalCents >= threshold) return { cents: 0, free: true };
  return { cents: Math.round(flat), free: false };
}

function shippingOffered(raw) {
  if (!S.flag(raw, 'shipping_enabled')) return false;
  const flat = Number(raw.shipping_flat_cents);
  return Number.isFinite(flat) && flat >= 0;
}

async function reference(db, id) {
  return 'FM-' + String(10000 + Number(id)).slice(-5);
}

/** Create the order. Idempotent per (user, request_key). */
async function create(services, req, raw) {
  const body = req.body || {};
  const t = req.res ? null : null;
  if (!S.flag(raw, 'privacy_approved') || !S.both(raw.privacy_notice)) throw S.error('operation_disabled', 409);
  if (body.consent !== true) throw S.error('required');

  const fulfilment = body.fulfilment === 'shipping' ? 'shipping' : 'pickup';
  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().slice(0, 190);
  const phone = String(body.phone || '').trim().slice(0, 40);
  const note = String(body.note || '').trim().slice(0, 1000);
  if (!name) throw S.error('required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw S.error('invalid');
  if (phone && !/^[+()\d .-]{7,40}$/.test(phone)) throw S.error('invalid');

  const address = {
    line: String(body.addressLine || '').trim().slice(0, 200),
    city: String(body.addressCity || '').trim().slice(0, 120),
    province: String(body.addressProvince || '').trim().slice(0, 60),
    postal: String(body.addressPostal || '').trim().slice(0, 12),
  };
  if (fulfilment === 'shipping' && (!address.line || !address.city || !address.province || !address.postal)) throw S.error('required');

  const quote = await price(services, raw, body.cart, fulfilment);
  const requestKey = String(body.requestKey || '').slice(0, 64) || services.crypto.randomUUID();
  const userId = String(req.user.id);

  const existing = await services.db.get('SELECT * FROM orders WHERE user_id=$1 AND request_key=$2', [userId, requestKey]);
  if (existing) return existing;

  const row = await services.db.get(
    'INSERT INTO orders(user_id,request_key,name,email,phone,fulfilment,address_line,address_city,address_province,address_postal,note,'
    + 'subtotal_cents,shipping_cents,gst_cents,qst_cents,total_cents,consent,privacy_snapshot,terms_snapshot) '
    + 'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,1,$17,$18) RETURNING *',
    [userId, requestKey, name, email, phone, fulfilment, address.line, address.city, address.province, address.postal, note,
      quote.subtotalCents, quote.shippingCents, quote.gstCents, quote.qstCents, quote.totalCents,
      raw.privacy_notice || '', raw.payment_terms || ''],
  );
  await services.db.run('UPDATE orders SET reference=$1 WHERE id=$2', [await reference(services.db, row.id), row.id]);

  for (const item of quote.items) {
    await services.db.run(
      'INSERT INTO order_items(order_id,product_id,name_snapshot,variant,unit_price_cents,quantity,line_cents,taxable) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
      [row.id, item.productId, item.name, item.variant, item.unitPriceCents, item.quantity, item.lineCents, item.taxable],
    );
  }

  // The owner gets told, but a mail failure must never lose the order.
  try {
    if (S.flag(raw, 'live_actions_enabled') && services.config.contactEmail) {
      const lines = quote.items.map((i) => `- ${i.name}${i.variant ? ' (' + i.variant + ')' : ''} × ${i.quantity}`).join('\n');
      await services.email.send({
        to: services.config.contactEmail,
        replyTo: email,
        subject: `Nouvelle commande boutique — ${name}`,
        text: `Une commande a été enregistrée sur le site.\n\nClient : ${name}\nCourriel : ${email}\nTéléphone : ${phone || '—'}\nMode : ${fulfilment === 'pickup' ? 'Cueillette en boutique' : 'Livraison'}\n\n${lines}\n\nTotal : ${(quote.totalCents / 100).toFixed(2)} $ CAD\nNote : ${note || '—'}`,
      });
      await services.db.run("UPDATE orders SET email_state='sent' WHERE id=$1", [row.id]);
    }
  } catch (e) {
    try { await services.db.run("UPDATE orders SET email_state='failed' WHERE id=$1", [row.id]); } catch (ignored) {}
  }

  return await services.db.get('SELECT * FROM orders WHERE id=$1', [row.id]);
}

async function items(db, orderId) {
  return await db.all(
    'SELECT oi.*, p.image_url FROM order_items oi LEFT JOIN products p ON p.id=oi.product_id WHERE oi.order_id=$1 ORDER BY oi.id',
    [orderId],
  );
}

module.exports = { price, create, items, publicRow, shippingFor, shippingOffered, MAX_QTY, MAX_LINES };
