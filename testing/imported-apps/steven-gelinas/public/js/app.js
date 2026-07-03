(function(){
var KEY='bg_cart';
function getCart(){try{var c=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(c)?c.filter(function(i){return i&&i.id;}):[];}catch(e){return [];}}
function saveCart(c){try{localStorage.setItem(KEY,JSON.stringify(c));}catch(e){}updateBadge(c);}
function updateBadge(c){c=c||getCart();var n=c.reduce(function(s,i){return s+(i.qty||1);},0);document.querySelectorAll('[data-cart-count]').forEach(function(el){el.textContent=n;el.style.display=n?'':'none';});}
function fmtPrice(v){return Number(v||0).toFixed(2).replace('.',',')+' $';}
var toastTimer=null;
function toast(msg){
var t=document.getElementById('bgToast');
if(!t){t=document.createElement('div');t.id='bgToast';t.className='toast';t.innerHTML='<span id="bgToastMsg"></span><a href="bon-de-commande">Voir le bon →</a>';document.body.appendChild(t);}
document.getElementById('bgToastMsg').textContent=msg;
t.classList.add('show');
if(toastTimer)clearTimeout(toastTimer);
toastTimer=setTimeout(function(){t.classList.remove('show');},3500);
}
function addToCart(id,qty){var c=getCart();var it=c.find(function(i){return i.id===id;});if(it)it.qty=Math.min(20,(it.qty||1)+qty);else c.push({id:id,qty:qty});saveCart(c);toast('Ajouté au bon de commande');}
document.addEventListener('click',function(ev){
if(!ev.target||!ev.target.closest)return;
var btn=ev.target.closest('[data-add-cart]');
if(btn){var id=parseInt(btn.getAttribute('data-id'),10);if(!isNaN(id)){var qty=1;var from=btn.getAttribute('data-qty-from');if(from){var inp=document.getElementById(from);if(inp)qty=Math.max(1,Math.min(20,parseInt(inp.value,10)||1));}addToCart(id,qty);}return;}
var minus=ev.target.closest('[data-qty-minus]');
if(minus){var i1=minus.parentElement.querySelector('input');if(i1)i1.value=Math.max(1,(parseInt(i1.value,10)||1)-1);return;}
var plus=ev.target.closest('[data-qty-plus]');
if(plus){var i2=plus.parentElement.querySelector('input');if(i2)i2.value=Math.min(20,(parseInt(i2.value,10)||1)+1);return;}
});
window.BG={getCart:getCart,saveCart:saveCart,fmtPrice:fmtPrice,updateBadge:updateBadge};
updateBadge();
})();