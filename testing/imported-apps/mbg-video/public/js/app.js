(function(){
 function pad(n){ return String(n).padStart(2,'0'); }
 function escAttr(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
 var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function toast(msg,err){ var t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.className='toast show'+(err?' err':''); setTimeout(function(){ t.className='toast'; },4200); }
 function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }
 ready(function(){
  var hamb=document.getElementById('hamb'),mm=document.getElementById('mobileMenu');
  if(hamb&&mm){ hamb.addEventListener('click',function(){ var o=mm.classList.toggle('open'); hamb.setAttribute('aria-expanded',o?'true':'false'); }); mm.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ mm.classList.remove('open'); hamb.setAttribute('aria-expanded','false'); }); }); }
  var tc=document.getElementById('sessionTc');
  if(tc){ if(reduce){ tc.textContent='00:00:00:00'; } else { var st=performance.now(); (function loop(now){ var ms=now-st; var f=Math.floor(ms/1000*24)%24; var s=Math.floor(ms/1000)%60; var m=Math.floor(ms/60000)%60; var h=Math.floor(ms/3600000); tc.textContent=pad(h)+':'+pad(m)+':'+pad(s)+':'+pad(f); requestAnimationFrame(loop); })(performance.now()); } }
  var ph=document.getElementById('playhead');
  if(ph){ var upd=function(){ var d=document.documentElement; var max=d.scrollHeight-d.clientHeight; var p=max>0?d.scrollTop/max:0; ph.style.left=(p*100)+'%'; }; window.addEventListener('scroll',upd,{passive:true}); upd(); }
  var tabs=Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var secs=['rushs','progression','contact'].map(function(id){ return document.getElementById(id); }).filter(Boolean);
  if('IntersectionObserver' in window && secs.length){ var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ tabs.forEach(function(t){ t.classList.toggle('active',t.getAttribute('href')==='#'+e.target.id); }); } }); },{rootMargin:'-40% 0px -55% 0px'}); secs.forEach(function(s){ io.observe(s); }); }
  document.querySelectorAll('[data-ba]').forEach(function(ba){ var r=ba.querySelector('.ba-range'); var set=function(v){ ba.style.setProperty('--pos',v+'%'); var d=ba.querySelector('.ba-div'); if(d) d.style.left=v+'%'; }; if(r){ set(r.value); r.addEventListener('input',function(){ set(r.value); }); } });
  var tl=document.getElementById('tlTrack');
  if(tl){ var down=false,sx=0,sl=0; tl.addEventListener('pointerdown',function(e){ if(e.target.closest('.ba')) return; down=true; sx=e.clientX; sl=tl.scrollLeft; tl.classList.add('drag'); }); window.addEventListener('pointerup',function(){ down=false; tl.classList.remove('drag'); }); tl.addEventListener('pointermove',function(e){ if(!down) return; tl.scrollLeft=sl-(e.clientX-sx); }); }
  document.querySelectorAll('[data-yt]').forEach(function(el){ el.addEventListener('click',function(){ openLb(el.getAttribute('data-yt'),el.getAttribute('data-thumb'),el.getAttribute('data-title')); }); });
  var cf=document.getElementById('contactForm');
  if(cf){ cf.addEventListener('submit',function(e){ e.preventDefault(); var btn=cf.querySelector('button[type=submit]'); var orig=btn.textContent; btn.disabled=true; btn.textContent='Export en cours…'; var body={}; new FormData(cf).forEach(function(v,k){ body[k]=v; }); fetch('api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){ return r.json().then(function(d){ return {ok:r.ok,d:d}; }); }).then(function(res){ if(!res.ok) throw new Error((res.d&&res.d.error)||'Erreur'); cf.reset(); toast('Export terminé. Demande envoyée — je réponds sous 48 h.',false); }).catch(function(){ toast('Échec de l’export. Vérifiez le nom et le message, puis réessayez.',true); }).then(function(){ btn.disabled=false; btn.textContent=orig; }); }); }
 });
 window.openLb=function(id,thumb,title){ var b=document.getElementById('lbBody'); if(!b) return; if(id){ b.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1" title="'+escAttr(title)+'" allow="autoplay; fullscreen" allowfullscreen></iframe>'; } else { b.innerHTML='<img src="'+escAttr(thumb)+'" alt="'+escAttr(title)+'">'; } document.getElementById('lb').style.display='flex'; };
 window.closeLb=function(){ var lb=document.getElementById('lb'); if(lb) lb.style.display='none'; var b=document.getElementById('lbBody'); if(b) b.innerHTML=''; };
 window.addEventListener('keydown',function(e){ if(e.key==='Escape') closeLb(); });
})();
