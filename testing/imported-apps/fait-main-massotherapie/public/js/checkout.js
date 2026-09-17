(function () {
  var node = document.getElementById('page-data');
  if (!node) return;
  var data = JSON.parse(node.textContent);
  var t = data.t;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  // ---------------------------------------------------------------- checkout
  function wireCheckout() {
    var form = document.querySelector('[data-checkout-form]');
    if (!form) return;
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var errorEl = form.querySelector('[data-checkout-error]');
      var submit = form.querySelector('[data-checkout-submit]');
      var lines = window.Cart ? Cart.read() : [];
      if (!lines.length) { if (errorEl) { errorEl.textContent = t.cart_empty_error; errorEl.hidden = false; } return; }

      var fulfilment = (form.querySelector('[data-fulfilment]:checked') || {}).value || 'pickup';
      var body = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        fulfilment: fulfilment,
        addressLine: form.addressLine ? form.addressLine.value : '',
        addressCity: form.addressCity ? form.addressCity.value : '',
        addressProvince: form.addressProvince ? form.addressProvince.value : '',
        addressPostal: form.addressPostal ? form.addressPostal.value : '',
        note: form.note.value,
        consent: form.consent.checked,
        requestKey: requestKey(lines, fulfilment),
        cart: lines.map(function (l) { return { slug: l.slug, quantity: l.quantity, variant: l.variant }; }),
      };
      if (submit) submit.disabled = true;
      if (errorEl) errorEl.hidden = true;
      try {
        var result = await App.request('api/orders', { method: 'POST', body: JSON.stringify(body) });
        if (window.Cart) Cart.clear();
        window.location.assign(data.urls.order + result.order.id);
      } catch (e) {
        if (errorEl) { errorEl.textContent = e.message; errorEl.hidden = false; }
        if (submit) submit.disabled = false;
      }
    });
  }

  // A stable key per basket so a double submit cannot create two orders.
  function requestKey(lines, fulfilment) {
    var seed = fulfilment + '|' + lines.map(function (l) { return l.slug + ':' + (l.variant || '') + ':' + l.quantity; }).join(',');
    var hash = 0;
    for (var i = 0; i < seed.length; i++) { hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0; }
    try {
      var stored = window.sessionStorage.getItem('fm_req_' + hash);
      if (stored) return stored;
      var fresh = String(hash) + '-' + Date.now().toString(36);
      window.sessionStorage.setItem('fm_req_' + hash, fresh);
      return fresh;
    } catch (e) { return String(hash) + '-' + Date.now().toString(36); }
  }

  // ------------------------------------------------------------- order page
  function wireOrder() {
    var root = document.querySelector('[data-order-root]');
    if (!root) return;
    var id = Number(root.getAttribute('data-order-id'));
    var endpoint = 'api/orders/' + id;
    var order = null;
    var config = null;
    var scriptPromise = null;
    var paying = false;

    var loading = root.querySelector('[data-order-loading]');
    var view = root.querySelector('[data-order-view]');
    var missing = root.querySelector('[data-order-missing]');
    var errorEl = root.querySelector('[data-pay-error]');

    function message(text) {
      if (!errorEl) return;
      errorEl.textContent = text || '';
      errorEl.hidden = !text;
    }
    function set(selector, value) {
      var el = root.querySelector(selector);
      if (el) el.textContent = value;
    }

    function render() {
      if (loading) loading.hidden = true;
      if (view) view.hidden = false;

      set('[data-order-ref]', order.reference || '');
      set('[data-o-subtotal]', App.money(order.subtotalCents));
      set('[data-o-shipping]', order.shippingCents ? App.money(order.shippingCents) : t.free);
      set('[data-o-gst]', App.money(order.gstCents));
      set('[data-o-qst]', App.money(order.qstCents));
      set('[data-o-total]', App.money(order.totalCents));
      set('[data-order-date]', App.formatDate(order.createdAt));
      set('[data-order-fulfilment]', order.fulfilment === 'pickup'
        ? t.pickup + ' — ' + t.pickup_help
        : t.delivery + ' — ' + [order.address.line, order.address.city, order.address.province, order.address.postal].filter(Boolean).join(', '));

      var noteEl = root.querySelector('[data-order-note]');
      if (noteEl) { noteEl.textContent = order.note || ''; noteEl.hidden = !order.note; }

      var state = root.querySelector('[data-order-state]');
      if (state) {
        state.textContent = t['status_' + order.status] || order.status;
        state.className = 'order-state ' + (order.paymentStatus === 'paid' ? 'order-state--paid' : order.status === 'awaiting_payment' ? 'order-state--wait' : 'order-state--other');
      }

      var tbody = root.querySelector('[data-order-items]');
      if (tbody) {
        tbody.textContent = '';
        order.items.forEach(function (item) {
          var tr = document.createElement('tr');
          var name = document.createElement('td');
          name.textContent = item.name + (item.variant ? ' — ' + item.variant : '');
          var qty = document.createElement('td');
          qty.className = 'num';
          qty.textContent = String(item.quantity);
          var price = document.createElement('td');
          price.className = 'num';
          price.textContent = App.money(item.lineCents);
          tr.appendChild(name); tr.appendChild(qty); tr.appendChild(price);
          tbody.appendChild(tr);
        });
      }

      var payZone = root.querySelector('[data-pay-zone]');
      var payDone = root.querySelector('[data-pay-done]');
      var payUnavailable = root.querySelector('[data-pay-unavailable]');
      var paid = order.paymentStatus === 'paid';
      if (payDone) payDone.hidden = !paid;
      if (payZone) payZone.hidden = paid || !(config && config.available);
      if (payUnavailable) payUnavailable.hidden = paid || !!(config && config.available);

      if (!paid && config && config.available) mountPayment();
    }

    function mountPayment() {
      var zone = root.querySelector('[data-pay-zone]');
      if (!zone || zone.getAttribute('data-wired') === '1') return;
      zone.setAttribute('data-wired', '1');
      var accept = zone.querySelector('[data-accept-terms]');
      var mount = zone.querySelector('[data-paypal-button]');
      if (!accept || !mount) return;
      accept.addEventListener('change', async function () {
        mount.textContent = '';
        message('');
        if (!accept.checked) return;
        try { await mountPayPal(mount, accept); } catch (e) { message(e.message || t.server_error); }
      });
    }

    async function sdk() {
      if (!scriptPromise) {
        scriptPromise = new Promise(function (resolve, reject) {
          var script = document.createElement('script');
          script.src = config.mode === 'live' ? 'https://www.paypal.com/web-sdk/v6/core' : 'https://www.sandbox.paypal.com/web-sdk/v6/core';
          script.onload = resolve;
          script.onerror = function () { scriptPromise = null; reject(new Error(t.server_error)); };
          document.head.appendChild(script);
        });
      }
      await scriptPromise;
      if (!window.paypal) throw new Error(t.server_error);
      return await window.paypal.createInstance({
        clientId: config.clientId,
        components: ['paypal-payments'],
        pageType: 'checkout',
        locale: data.lang === 'en' ? 'en-CA' : 'fr-CA',
      });
    }

    async function mountPayPal(mount, accept) {
      var instance = await sdk();
      var eligible = await instance.findEligibleMethods({ currencyCode: 'CAD', amount: (Number(order.totalCents) / 100).toFixed(2) });
      if (!eligible.isEligible('paypal')) throw new Error(t.pay_unavailable);
      if (!accept.checked) return;

      var session = instance.createPayPalOneTimePaymentSession({
        onApprove: async function (result) {
          try {
            var captured = await App.request(endpoint + '/paypal/capture', { method: 'POST', body: JSON.stringify({ orderId: result.orderId }) });
            order = captured.order;
            render();
            message(order.paymentStatus === 'paid' ? '' : t.pay_pending);
          } catch (e) { message(e.message); } finally { paying = false; }
        },
        onCancel: function () { paying = false; message(''); },
        onError: function () { paying = false; message(t.server_error); },
      });

      var button = document.createElement('paypal-button');
      button.setAttribute('type', 'pay');
      button.setAttribute('data-lk', 'paypal-official');
      mount.appendChild(button);
      button.addEventListener('click', async function () {
        if (paying || !accept.checked) return;
        paying = true;
        message(t.loading);
        try {
          await session.start({ presentationMode: 'auto' }, App.request(endpoint + '/paypal/order', { method: 'POST', body: JSON.stringify({ accept_terms: true }) }));
          message('');
        } catch (e) { message(e.message || t.server_error); } finally { paying = false; }
      });
    }

    async function load() {
      try {
        var result = await App.request(endpoint);
        order = result.order;
        config = result.paypal;
        var terms = root.querySelector('[data-terms]');
        if (terms) terms.textContent = result.terms || '';
        render();
      } catch (e) {
        if (loading) loading.hidden = true;
        if (missing) { missing.textContent = e.message; missing.hidden = false; }
      }
    }

    document.addEventListener('fm:auth', function (event) { if (event.detail.loggedIn) load(); });
  }

  // ------------------------------------------------------------ orders list
  function wireOrders() {
    var root = document.querySelector('[data-orders-root]');
    if (!root) return;
    var list = root.querySelector('[data-orders-list]');
    var loading = root.querySelector('[data-orders-loading]');
    var empty = root.querySelector('[data-orders-empty]');

    async function load() {
      try {
        var result = await App.request('api/orders');
        if (loading) loading.hidden = true;
        if (!result.orders.length) { if (empty) empty.hidden = false; return; }
        result.orders.forEach(function (order) {
          var card = document.createElement('a');
          card.className = 'card';
          card.href = data.urls.order + order.id;
          card.style.textDecoration = 'none';
          var body = document.createElement('div');
          body.className = 'card-body';

          var top = document.createElement('div');
          top.className = 'row row--between';
          var ref = document.createElement('strong');
          ref.textContent = order.reference || ('#' + order.id);
          var state = document.createElement('span');
          state.className = 'order-state ' + (order.paymentStatus === 'paid' ? 'order-state--paid' : order.status === 'awaiting_payment' ? 'order-state--wait' : 'order-state--other');
          state.textContent = t['status_' + order.status] || order.status;
          top.appendChild(ref); top.appendChild(state);
          body.appendChild(top);

          var meta = document.createElement('p');
          meta.className = 'small muted';
          meta.textContent = App.formatDate(order.createdAt) + ' · ' + order.items.length + ' × ' + t.product + ' · ' + App.money(order.totalCents);
          body.appendChild(meta);

          card.appendChild(body);
          list.appendChild(card);
        });
      } catch (e) {
        if (loading) { loading.textContent = e.message; }
      }
    }
    document.addEventListener('fm:auth', function (event) { if (event.detail.loggedIn) load(); });
  }

  ready(function () { wireCheckout(); wireOrder(); wireOrders(); });
})();
