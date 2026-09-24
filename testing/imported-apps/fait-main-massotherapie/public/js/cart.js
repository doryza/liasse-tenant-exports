(function () {
  var node = document.getElementById('page-data');
  if (!node) return;
  var data = JSON.parse(node.textContent);
  var KEY = 'fm_cart_v1';
  var MAX_QTY = 20;

  // localStorage can throw (private windows, blocked site data), so every
  // access is guarded and the page still works with an empty cart.
  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(function (x) { return x && x.slug && x.quantity > 0; }) : [];
    } catch (e) { return []; }
  }
  function write(lines) {
    try { window.localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) {}
    paintCount();
    document.dispatchEvent(new CustomEvent('fm:cart'));
  }
  function count() { return read().reduce(function (n, line) { return n + Number(line.quantity || 0); }, 0); }

  function paintCount() {
    var total = count();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = String(total);
      el.hidden = total === 0;
    });
  }

  function add(item) {
    var lines = read();
    var found = lines.filter(function (l) { return l.slug === item.slug && (l.variant || '') === (item.variant || ''); })[0];
    if (found) found.quantity = Math.min(MAX_QTY, Number(found.quantity) + Number(item.quantity || 1));
    else lines.push({ slug: item.slug, name: item.name, price: Number(item.price), image: item.image || '', variant: item.variant || '', quantity: Math.min(MAX_QTY, Number(item.quantity || 1)) });
    write(lines);
  }
  function setQuantity(index, quantity) {
    var lines = read();
    if (!lines[index]) return;
    quantity = Math.max(0, Math.min(MAX_QTY, Number(quantity)));
    if (!quantity) lines.splice(index, 1);
    else lines[index].quantity = quantity;
    write(lines);
  }

  window.Cart = { read: read, write: write, add: add, setQuantity: setQuantity, count: count, clear: function () { write([]); } };

  // --- Add-to-cart buttons -------------------------------------------------
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-add-to-cart]');
    if (!button) return;
    event.preventDefault();

    var needsVariant = button.getAttribute('data-needs-variant') === '1';
    var select = document.querySelector('[data-variant-select]');
    var qtySelect = document.querySelector('[data-qty-select]');

    // A product with options can only be added from its own page, where the
    // choice is visible — from a grid we send the visitor there instead.
    if (needsVariant && !select) {
      var href = button.getAttribute('data-href');
      if (href) { window.location.assign(href); return; }
    }
    var variant = select ? select.value : '';
    if (needsVariant && !variant) {
      if (window.App) App.toast(data.t.variant_required);
      if (select) select.focus();
      return;
    }

    add({
      slug: button.getAttribute('data-slug'),
      name: button.getAttribute('data-name'),
      price: button.getAttribute('data-price'),
      image: button.getAttribute('data-image'),
      variant: variant,
      quantity: qtySelect ? Number(qtySelect.value) : 1,
    });
    if (window.App) App.toast(data.t.added + ' · ' + button.getAttribute('data-name'));
  });

  // --- Cart page -----------------------------------------------------------
  var linesRoot = document.querySelector('[data-cart-lines]');
  var layout = document.querySelector('[data-cart-layout]');
  var emptyRoot = document.querySelector('[data-cart-empty]');

  function money(cents) {
    return new Intl.NumberFormat(data.lang === 'en' ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD' }).format(Number(cents) / 100);
  }

  function currentFulfilment() {
    var checked = document.querySelector('[data-fulfilment]:checked');
    return checked ? checked.value : 'pickup';
  }

  async function quote() {
    var summary = document.querySelector('[data-cart-summary]');
    var noteEl = document.querySelector('[data-sum-note]');
    if (!summary) return;
    var lines = read();
    if (!lines.length) return;
    try {
      var result = await App.request('api/cart/quote', {
        method: 'POST',
        body: JSON.stringify({ cart: lines.map(function (l) { return { slug: l.slug, quantity: l.quantity, variant: l.variant }; }), fulfilment: currentFulfilment() }),
      });
      var q = result.quote;
      var rows = [
        [data.t.subtotal, money(q.subtotalCents)],
        [data.t.shipping, q.shippingCents ? money(q.shippingCents) : data.t.free],
        [data.t.gst, money(q.gstCents)],
        [data.t.qst, money(q.qstCents)],
      ];
      summary.innerHTML = rows.map(function (row) { return '<dt></dt><dd></dd>'; }).join('');
      var dts = summary.querySelectorAll('dt');
      var dds = summary.querySelectorAll('dd');
      rows.forEach(function (row, i) { dts[i].textContent = row[0]; dds[i].textContent = row[1]; });

      var totalRow = document.querySelector('[data-cart-total-row]');
      if (!totalRow) {
        totalRow = document.createElement('dl');
        totalRow.className = 'total';
        totalRow.setAttribute('data-cart-total-row', '');
        summary.parentNode.insertBefore(totalRow, summary.nextSibling);
      }
      totalRow.innerHTML = '<dt></dt><dd></dd>';
      totalRow.querySelector('dt').textContent = data.t.total;
      totalRow.querySelector('dd').textContent = money(q.totalCents);

      if (noteEl) {
        if (currentFulfilment() === 'pickup') { noteEl.textContent = data.t.pickup_help; noteEl.hidden = false; }
        else if (q.shippingFree && data.freeShippingThreshold) { noteEl.textContent = data.t.free_shipping_note.replace('{threshold}', money(data.freeShippingThreshold)); noteEl.hidden = false; }
        else noteEl.hidden = true;
      }
    } catch (e) {
      if (noteEl) { noteEl.textContent = e.message; noteEl.hidden = false; }
    }
  }
  window.Cart.quote = quote;

  function renderCart() {
    if (!linesRoot) return;
    var lines = read();
    if (layout) layout.hidden = !lines.length;
    if (emptyRoot) emptyRoot.hidden = !!lines.length;
    linesRoot.textContent = '';

    lines.forEach(function (line, index) {
      var article = document.createElement('div');
      article.className = 'cart-line';

      var media = document.createElement('div');
      media.className = 'cart-line-media';
      if (line.image) {
        var img = document.createElement('img');
        img.src = line.image; img.alt = line.name; img.loading = 'lazy';
        media.appendChild(img);
      }
      article.appendChild(media);

      var body = document.createElement('div');
      var title = document.createElement('h3');
      title.textContent = line.name;
      body.appendChild(title);
      if (line.variant) {
        var variant = document.createElement('div');
        variant.className = 'variant';
        variant.textContent = line.variant;
        body.appendChild(variant);
      }
      var unit = document.createElement('div');
      unit.className = 'small muted';
      unit.textContent = money(line.price) + ' · ' + data.t.before_tax;
      body.appendChild(unit);
      article.appendChild(body);

      var right = document.createElement('div');
      right.className = 'cart-line-right';

      var qty = document.createElement('div');
      qty.className = 'qty';
      var minus = document.createElement('button');
      minus.type = 'button'; minus.textContent = '−';
      minus.setAttribute('aria-label', data.t.remove);
      minus.addEventListener('click', function () { setQuantity(index, line.quantity - 1); });
      var value = document.createElement('span');
      value.textContent = String(line.quantity);
      var plus = document.createElement('button');
      plus.type = 'button'; plus.textContent = '+';
      plus.setAttribute('aria-label', data.t.add_to_cart);
      plus.addEventListener('click', function () { setQuantity(index, line.quantity + 1); });
      qty.appendChild(minus); qty.appendChild(value); qty.appendChild(plus);
      right.appendChild(qty);

      var lineTotal = document.createElement('strong');
      lineTotal.textContent = money(line.price * line.quantity);
      right.appendChild(lineTotal);

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'text-button';
      remove.textContent = data.t.remove;
      remove.addEventListener('click', function () { setQuantity(index, 0); });
      right.appendChild(remove);

      article.appendChild(right);
      linesRoot.appendChild(article);
    });

    quote();
  }

  document.addEventListener('fm:cart', renderCart);
  document.addEventListener('change', function (event) {
    if (event.target.matches('[data-fulfilment]')) {
      var shippingFields = document.querySelector('[data-shipping-fields]');
      if (shippingFields) shippingFields.hidden = event.target.value !== 'shipping';
      quote();
    }
  });

  paintCount();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderCart);
  else renderCart();
})();
