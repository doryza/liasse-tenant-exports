(function () {
  'use strict';
  var box = document.querySelector('[data-welcome-gift]');
  if (!box) return;
  var lang = box.dataset.language === 'en' ? 'en' : 'fr';
  var busy = false, expiryTimer;
  function hide() { box.hidden = true; clearTimeout(expiryTimer); }
  function field(selector, value) {
    var el = box.querySelector(selector);
    el.textContent = typeof value === 'string' ? value : '';
    el.hidden = !el.textContent.trim();
  }
  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    var controller = new AbortController(), timeout = setTimeout(function () { controller.abort(); }, 11000);
    try {
      var response = await fetch(box.dataset.endpoint, { signal: controller.signal, cache: 'no-store', credentials: 'omit' });
      if (!response.ok) throw new Error('unavailable');
      var data = await response.json(), gift = data.gift;
      if (!gift || !gift[lang] || !gift[lang].title || ![30, 60].includes(gift.validDays)) return hide();
      var url = new URL(gift.url);
      if (url.origin !== 'https://promopass.club' || !/^\/c\/[a-f0-9]{20}$/.test(url.pathname) || url.username || url.password) return hide();
      if (gift.endsAt != null && (!Number.isFinite(Number(gift.endsAt)) || Number(gift.endsAt) <= Date.now())) return hide();
      var words = gift[lang];
      field('[data-gift-title]', words.title);
      field('[data-gift-condition]', words.condition);
      field('[data-gift-description]', words.description);
      field('[data-gift-terms]', words.terms);
      box.querySelector('[data-gift-terms-wrap]').hidden = !words.terms;
      url.searchParams.set('lang', lang);
      box.querySelector('[data-gift-claim]').href = url.href;
      field('[data-gift-validity]', lang === 'en' ? 'Valid for ' + gift.validDays + ' days after joining.' : 'Valide ' + gift.validDays + ' jours après l’inscription.');
      box.hidden = false;
      clearTimeout(expiryTimer);
      expiryTimer = setTimeout(hide, Math.min(45000, gift.endsAt ? Number(gift.endsAt) - Date.now() : 45000));
    } catch (_) { hide(); }
    finally { clearTimeout(timeout); busy = false; }
  }
  refresh();
  setInterval(refresh, 30000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
})();
