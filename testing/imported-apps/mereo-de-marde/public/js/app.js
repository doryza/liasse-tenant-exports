(function(){
function majTheme(cond){
var meta = (window.METEO_META || {})[cond];
if (!meta) return;
document.body.setAttribute('data-meteo', cond);
var m = document.querySelector('meta[name="theme-color"]');
if (m && meta.accent) m.setAttribute('content', meta.accent);
}
window.apercuMeteo = function(cond, btn){
majTheme(cond);
var meta = (window.METEO_META || {})[cond] || {};
var v = document.getElementById('verdictHero');
if (v && meta.verdicts && meta.verdicts.length) v.textContent = meta.verdicts[Math.floor(Date.now() / 86400000) % meta.verdicts.length];
var c = document.getElementById('condHero');
if (c && meta.nom) c.textContent = meta.nom;
var puces = document.querySelectorAll('.puce-meteo');
for (var i = 0; i < puces.length; i++) { puces[i].classList.remove('active'); puces[i].style.backgroundColor = ''; puces[i].style.color = ''; }
if (btn) { btn.classList.add('active'); if (meta.accent) { btn.style.backgroundColor = meta.accent; btn.style.color = '#fff'; } }
};
})();
(function(){
var f = document.getElementById('formSignalement');
if (!f) return;
f.addEventListener('submit', async function(ev){
ev.preventDefault();
var retour = document.getElementById('sigRetour');
var btn = f.querySelector('button[type="submit"]');
btn.disabled = true;
try {
var r = await fetch('api/signalements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: f.nom.value, message: f.message.value, condition: f.condition.value, village_id: f.village_id.value }) });
var d = await r.json();
if (!r.ok) throw new Error(d.error || 'Erreur');
retour.textContent = f.getAttribute('data-merci');
retour.className = 'form-retour ok';
f.reset();
} catch(e) {
retour.textContent = e.message;
retour.className = 'form-retour erreur';
}
btn.disabled = false;
});
})();
(function(){
var boutons = document.querySelectorAll('[data-filtre]');
if (!boutons.length) return;
boutons.forEach(function(b){
b.addEventListener('click', function(){
var fl = b.getAttribute('data-filtre');
boutons.forEach(function(x){ x.classList.remove('active'); });
b.classList.add('active');
var visibles = 0;
document.querySelectorAll('.expr-carte').forEach(function(c){
var ok = (fl === 'tous' || c.getAttribute('data-cond') === fl);
c.style.display = ok ? '' : 'none';
if (ok) visibles++;
});
var vide = document.getElementById('filtreVide');
if (vide) vide.style.display = visibles ? 'none' : 'block';
});
});
})();
