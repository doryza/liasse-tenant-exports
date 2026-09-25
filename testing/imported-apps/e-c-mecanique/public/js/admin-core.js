/* Back office — shared pieces: the menu, the side panel, money in dollars,
   and settings that save themselves (no Save button to forget). */
(function () {
  if (!window.App) return;
  var en = App.data.lang === 'en';
  var tr = function (fr, eng) { return en ? eng : fr; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------------------------------------------------------------- menu
  var sidebar = document.getElementById('admin-sidebar');
  var backdrop = $('[data-backdrop]');
  function closeAll() {
    if (sidebar) sidebar.classList.remove('open');
    $$('.drawer.open').forEach(function (d) { d.classList.remove('open'); });
    if (backdrop) backdrop.classList.remove('show');
  }
  $$('[data-admin-menu]').forEach(function (b) {
    b.addEventListener('click', function () { if (!sidebar) return; sidebar.classList.add('open'); if (backdrop) backdrop.classList.add('show'); });
  });
  if (backdrop) backdrop.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  // --------------------------------------------------------------- money
  function parseMoney(v) {
    if (v == null) return null;
    var s = String(v).replace(/[\s $]/g, '');
    if (!s) return null;
    if (s.indexOf(',') > -1 && s.indexOf('.') > -1) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    else s = s.replace(',', '.');
    if (!/^-?\d+(\.\d{0,2})?$/.test(s)) return NaN;
    return Math.round(Number(s) * 100);
  }
  function parseQty(v) {
    if (v == null || v === '') return 1;
    var s = String(v).replace(/\s/g, '').replace(',', '.');
    if (!/^\d+(\.\d{0,2})?$/.test(s)) return NaN;
    return Math.round(Number(s) * 100) / 100;
  }
  var fmt = new Intl.NumberFormat(en ? 'en-CA' : 'fr-CA', { style: 'currency', currency: 'CAD' });
  function money(cents) { return fmt.format((Number(cents) || 0) / 100); }
  // for an <input>: 8995 → "89,95" (fr) / "89.95" (en)
  function dollars(cents) {
    if (cents == null || cents === '') return '';
    var s = ((Number(cents) || 0) / 100).toFixed(2);
    return en ? s : s.replace('.', ',');
  }
  function qty(n) { return new Intl.NumberFormat(en ? 'en-CA' : 'fr-CA', { maximumFractionDigits: 2 }).format(Number(n) || 0); }

  // -------------------------------------------------------------- drawer
  function drawer(title) {
    var d = document.createElement('aside');
    d.className = 'drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', title);
    d.innerHTML = '<div class="drawer-head"><h2></h2><button class="icon-btn" type="button" aria-label="' + tr('Fermer', 'Close') + '"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="drawer-body"></div><div class="drawer-foot"></div>';
    $('h2', d).textContent = title;
    $('.drawer-head button', d).addEventListener('click', function () { api.close(); });
    document.body.appendChild(d);
    var api = {
      el: d, body: $('.drawer-body', d), foot: $('.drawer-foot', d),
      title: function (t) { $('h2', d).textContent = t; },
      open: function () { requestAnimationFrame(function () { d.classList.add('open'); if (backdrop) backdrop.classList.add('show'); var f = d.querySelector('input,select,textarea,button:not(.icon-btn)'); if (f) setTimeout(function () { f.focus(); }, 220); }); },
      close: function () { d.classList.remove('open'); if (backdrop && !$('.drawer.open') && !(sidebar && sidebar.classList.contains('open'))) backdrop.classList.remove('show'); },
    };
    return api;
  }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function field(label, input, hint) {
    return el('label', { class: 'field' }, [el('span', { text: label }), input, hint ? el('span', { class: 'hint', text: hint }) : null]);
  }

  // A tiny "Enregistré ✓" next to whatever just saved.
  function tick(node) {
    if (!node) return;
    var t = node.querySelector ? node.querySelector('.saved-tick') : null;
    if (!t) { t = el('span', { class: 'saved-tick', text: tr('Enregistré ✓', 'Saved ✓') }); node.appendChild(t); }
    t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  async function putSetting(key, value) {
    await App.request('api/admin/settings', { method: 'PUT', body: JSON.stringify({ key: key, value: value }) });
  }

  // Settings pages: [data-setting] inputs save on change, [data-setting-toggle] switches too.
  $$('[data-setting]').forEach(function (input) {
    var last = input.value;
    input.addEventListener('change', async function () {
      var key = input.getAttribute('data-setting');
      var value = input.value.trim();
      if (input.hasAttribute('data-money')) {
        var c = parseMoney(value);
        if (Number.isNaN(c)) { App.toast(tr('Montant invalide — ex. 95 ou 95,50', 'Invalid amount — e.g. 95 or 95.50')); input.value = last; return; }
        value = c == null ? '' : String(c);
      }
      try { await putSetting(key, value); last = input.value; tick(input.closest('.field') || input.parentNode); }
      catch (e) { App.toast(e.message); input.value = last; }
    });
  });
  $$('[data-setting-toggle]').forEach(function (input) {
    input.addEventListener('change', async function () {
      var key = input.getAttribute('data-setting-toggle');
      try { await putSetting(key, input.checked ? '1' : '0'); tick(input.closest('.switch-row')); }
      catch (e) { input.checked = !input.checked; App.toast(e.message); }
    });
  });

  // Create an estimate/invoice (optionally from an appointment or a customer) and open it.
  async function newDocument(kind, extra) {
    try {
      var r = await App.request('api/admin/documents', { method: 'POST', body: JSON.stringify(Object.assign({ kind: kind }, extra || {})) });
      location.href = r.url;
    } catch (e) { App.toast(e.message); }
  }
  $$('[data-new-doc]').forEach(function (b) {
    b.addEventListener('click', function () {
      b.disabled = true;
      var extra = {};
      if (b.getAttribute('data-appointment')) extra.appointmentId = Number(b.getAttribute('data-appointment'));
      if (b.getAttribute('data-client')) extra.clientId = Number(b.getAttribute('data-client'));
      if (b.getAttribute('data-vehicle')) extra.vehicleId = Number(b.getAttribute('data-vehicle'));
      newDocument(b.getAttribute('data-new-doc'), extra).then(function () { b.disabled = false; });
    });
  });

  var STATUS = {
    requested: tr('À confirmer', 'To confirm'), confirmed: tr('Confirmé', 'Confirmed'), in_progress: tr('En atelier', 'In the shop'),
    ready: tr('Prêt', 'Ready'), completed: tr('Remis au client', 'Picked up'), cancelled: tr('Annulé', 'Cancelled'), no_show: tr('Absent', 'No-show'),
  };
  // The one obvious next step for a job, by where it is now.
  var NEXT = {
    requested: ['confirmed', tr('Confirmer', 'Confirm')],
    confirmed: ['in_progress', tr('L’auto est arrivée', 'Car is here')],
    in_progress: ['ready', tr('Prête à récupérer', 'Ready for pickup')],
    ready: ['completed', tr('Remise au client', 'Picked up')],
  };
  var DOC_STATUS = {
    draft: tr('Brouillon', 'Draft'), sent: tr('Remise au client', 'Given to customer'), accepted: tr('Acceptée', 'Accepted'),
    declined: tr('Refusée', 'Declined'), invoiced: tr('Facturée', 'Invoiced'), unpaid: tr('À payer', 'Unpaid'), paid: tr('Payée', 'Paid'), void: tr('Annulée', 'Cancelled'),
  };

  window.Admin = {
    en: en, tr: tr, $: $, $$: $$, el: el, field: field, drawer: drawer, tick: tick,
    parseMoney: parseMoney, parseQty: parseQty, money: money, dollars: dollars, qty: qty,
    putSetting: putSetting, newDocument: newDocument, STATUS: STATUS, NEXT: NEXT, DOC_STATUS: DOC_STATUS,
    tel: function (p) { return 'tel:' + String(p || '').replace(/[^+\d]/g, ''); },
  };
})();
