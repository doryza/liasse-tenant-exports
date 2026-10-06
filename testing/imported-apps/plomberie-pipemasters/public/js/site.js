/* Public pages: menu, emergency tabs, the house legend, the water-heater tool, the request
   form and the estimate decision. Works without it: tabs fall back to stacked panels. */
'use strict';
(function () {
 var $ = function (s, r) { return (r || document).querySelector(s); };
 var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
 function post(url, data) {
  return fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'plumbing-site' }, body: JSON.stringify(data) })
   .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); });
 }

 // menu
 var toggle = $('.nav-toggle'), nav = $('#site-nav');
 if (toggle && nav) {
  toggle.addEventListener('click', function () { var open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); } });
 }

 // emergency tabs
 $$('[data-tabs]').forEach(function (box) {
  var tabs = $$('[role="tab"]', box), panels = $$('[role="tabpanel"]', box);
  function show(i, focus) {
   tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
   panels.forEach(function (p, k) { p.hidden = k !== i; });
   if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
   t.addEventListener('click', function () { show(i); });
   t.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show((i + 1) % tabs.length, true); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); show((i - 1 + tabs.length) % tabs.length, true); }
   });
  });
  box.classList.add('tabs-ready');
  show(0);
 });

 // house legend <-> numbered markers
 function light(n, on) { $$('[data-spot="' + n + '"]').forEach(function (el) { el.classList.toggle('is-lit', on); }); }
 $$('[data-spot]').forEach(function (el) {
  var n = el.getAttribute('data-spot');
  ['mouseenter', 'focus'].forEach(function (ev) { el.addEventListener(ev, function () { light(n, true); }); });
  ['mouseleave', 'blur'].forEach(function (ev) { el.addEventListener(ev, function () { light(n, false); }); });
 });

 $$('.cw-spot[data-href]').forEach(function (el) { el.addEventListener('click', function () { location.href = el.getAttribute('data-href'); }); });

 // water-heater age
 var heater = $('[data-heater]');
 if (heater) heater.addEventListener('submit', function (e) {
  e.preventDefault();
  var year = Number(heater.year.value), now = Number(heater.dataset.year), box = $('.heater-result', heater);
  box.hidden = false;
  if (!year || year < 1980 || year > now) { $('.heater-age', box).textContent = heater.dataset.bad; $('.heater-advice', box).textContent = ''; return; }
  var age = now - year;
  $('.heater-age', box).textContent = heater.dataset.age.replace('{n}', age);
  $('.heater-advice', box).textContent = age < 8 ? heater.dataset.young : age < 12 ? heater.dataset.mid : heater.dataset.old;
 });

 // estimate request
 var form = $('[data-request]');
 if (form) form.addEventListener('submit', function (e) {
  e.preventDefault();
  var status = $('.form-status', form), button = $('button[type="submit"]', form);
  $$('.field.invalid', form).forEach(function (f) { f.classList.remove('invalid'); });
  var x = {};
  $$('input, select, textarea', form).forEach(function (el) {
   if (!el.name) return;
   if (el.type === 'radio') { if (el.checked) x[el.name] = el.value; return; }
   x[el.name] = el.type === 'checkbox' ? el.checked : el.value;
  });
  button.disabled = true; status.className = 'form-status'; status.textContent = form.dataset.sending;
  post(form.getAttribute('action'), x).then(function (r) {
   if (r._status === 201) {
    status.className = 'form-status ok';
    status.textContent = form.dataset.sent + ' ' + form.dataset.ref.replace('{ref}', r.reference);
    form.reset();
    return;
   }
   status.className = 'form-status err';
   status.textContent = r._status === 429 ? form.dataset.limit : form.dataset.error;
   (r.fields || []).forEach(function (f) { var el = form.elements[f]; if (el && el.closest) { var box = el.closest('.field'); if (box) box.classList.add('invalid'); } });
  }).catch(function () { status.className = 'form-status err'; status.textContent = form.dataset.error; })
   .then(function () { button.disabled = false; });
 });

 // estimate decision
 var decide = $('[data-decide]');
 if (decide) $$('form[data-action]', decide).forEach(function (f) {
  f.addEventListener('submit', function (e) {
   e.preventDefault();
   var status = $('.form-status', decide), action = f.getAttribute('data-action');
   var el = function (n) { return f.elements.namedItem(n); };
   var data = action === 'accept' ? { name: el('name').value, agree: el('agree').checked } : { reason: el('reason').value };
   if (action === 'accept' && (!data.agree || data.name.trim().length < 2)) { status.className = 'form-status err'; status.textContent = decide.dataset.error; return; }
   $$('button', decide).forEach(function (b) { b.disabled = true; });
   post('api/document/' + decide.dataset.token + '/' + action, data).then(function (r) {
    if (r.ok) { status.className = 'form-status ok'; status.textContent = decide.dataset.thanks; setTimeout(function () { location.reload(); }, 900); return; }
    status.className = 'form-status err'; status.textContent = decide.dataset.error;
    $$('button', decide).forEach(function (b) { b.disabled = false; });
   });
  });
 });
 $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });
})();
