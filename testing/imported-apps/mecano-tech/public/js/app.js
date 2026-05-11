(function(){
function toast(msg, type){ var t=document.createElement('div'); t.className='toast'+(type?' '+type:''); t.textContent=msg; document.body.appendChild(t); setTimeout(function(){ t.classList.add('show'); },10); setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 250); }, 3000); }
window.__toast = toast;

var hamb = document.querySelector('.hamburger');
var mob = document.querySelector('.mobile-menu');
if (hamb && mob) { hamb.addEventListener('click', function(){ mob.classList.toggle('open'); }); }

document.addEventListener('click', async function(e){
  var btn = e.target.closest('[data-fav]');
  if (!btn) return;
  e.preventDefault();
  if (!window.TenantSDK || !TenantSDK.auth.isLoggedIn()) { try { TenantSDK.ui.showLogin({ onSuccess: function(){ window.location.reload(); } }); } catch(err){ toast('Connexion requise', 'error'); } return; }
  var type = btn.getAttribute('data-fav-type');
  var id = btn.getAttribute('data-fav-id');
  try {
    var r = await TenantSDK.fetch('./api/favoris', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ item_type: type, item_id: parseInt(id,10) }) });
    var d = await r.json();
    if (d.favorited) { btn.classList.add('active'); btn.innerHTML='★ Favori'; toast('Ajouté aux favoris', 'success'); }
    else { btn.classList.remove('active'); btn.innerHTML='☆ Favori'; toast('Retiré des favoris'); }
  } catch(err){ toast('Erreur', 'error'); }
});

async function refreshFavStates(){
  if (!window.TenantSDK || !TenantSDK.auth.isLoggedIn()) return;
  var btns = document.querySelectorAll('[data-fav]');
  for (var i=0;i<btns.length;i++){
    (function(btn){
      var type = btn.getAttribute('data-fav-type');
      var id = btn.getAttribute('data-fav-id');
      TenantSDK.fetch('./api/favoris/check?item_type='+encodeURIComponent(type)+'&item_id='+encodeURIComponent(id)).then(function(r){return r.json();}).then(function(d){
        if (d.favorited) { btn.classList.add('active'); btn.innerHTML='★ Favori'; }
      }).catch(function(){});
    })(btns[i]);
  }
}
refreshFavStates();

var cf = document.getElementById('contact-form');
if (cf) {
  cf.addEventListener('submit', async function(e){
    e.preventDefault();
    var fd = new FormData(cf);
    var data = { name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), message: fd.get('message') };
    var btn = cf.querySelector('button[type=submit]');
    btn.disabled = true; var orig = btn.textContent; btn.textContent='Envoi…';
    try {
      var r = await fetch('./api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
      var d = await r.json();
      if (r.ok) { toast('Message envoyé. Merci !', 'success'); cf.reset(); }
      else toast(d.error || 'Erreur', 'error');
    } catch(err){ toast('Erreur réseau', 'error'); }
    btn.disabled = false; btn.textContent = orig;
  });
}
})();

setTimeout(function(){
  try { if (window.TenantSDK && TenantSDK.ui) TenantSDK.ui.showInstallBanner(); } catch(e){}
}, 4000);
setTimeout(function(){
  try { if (window.TenantSDK && TenantSDK.ui) TenantSDK.ui.showPushPrompt(); } catch(e){}
}, 9000);
