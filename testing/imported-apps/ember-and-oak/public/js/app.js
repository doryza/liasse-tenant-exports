(function(){
  var path = document.getElementById('emberPath');
  if (!path) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  path.style.strokeDasharray = '1000';
  if (reduce) { path.style.strokeDashoffset = '0'; return; }
  path.style.strokeDashoffset = '1000';
  var update = function(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 1;
    path.style.strokeDashoffset = String(1000 * (1 - p));
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

(function(){
  var t = document.getElementById('navToggle');
  var m = document.getElementById('navMobile');
  if (!t || !m) return;
  t.addEventListener('click', function(){
    var open = m.classList.toggle('open');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  m.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      m.classList.remove('open');
      t.setAttribute('aria-expanded', 'false');
    });
  });
})();

(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(function(e){ e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function(ents){
    ents.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.14 });
  els.forEach(function(e){ io.observe(e); });
})();

(function(){
  var f = document.getElementById('wholesaleForm');
  if (!f) return;
  var g = function(n){ var el = f.elements[n]; return el ? el.value.trim() : ''; };
  f.addEventListener('submit', async function(e){
    e.preventDefault();
    var status = document.getElementById('wholesaleStatus');
    var btn = f.querySelector('button[type=submit]');
    var data = { name: g('name'), cafe: g('cafe'), volume: g('volume'), email: g('email'), message: g('message') };
    if (!data.name || !data.message) {
      status.textContent = 'Please add your name and a short note.';
      status.className = 'form-status err';
      return;
    }
    var old = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending...';
    try {
      var res = await fetch('api/wholesale', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      var out = await res.json().catch(function(){ return {}; });
      if (!res.ok) throw new Error(out.error || 'Something went wrong.');
      f.reset();
      status.textContent = "Thanks — we'll be in touch within two business days.";
      status.className = 'form-status ok';
    } catch (err) {
      status.textContent = err.message;
      status.className = 'form-status err';
    }
    btn.disabled = false; btn.textContent = old;
  });
})();

window.addEventListener('load', function(){
  try { if (window.TenantSDK && TenantSDK.ui) TenantSDK.ui.showInstallBanner(); } catch (e) {}
  setTimeout(function(){ try { if (window.TenantSDK && TenantSDK.ui) TenantSDK.ui.showPushPrompt(); } catch (e) {} }, 8000);
});
