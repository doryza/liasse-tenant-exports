(() => {
  const input = document.getElementById('menuSearch');
  if (!input) return;
  const clean = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const dishes = Array.from(document.querySelectorAll('.dish'));
  const sections = Array.from(document.querySelectorAll('.menu-category'));
  input.addEventListener('input', () => {
    const query = clean(input.value.trim()); let matches = 0;
    dishes.forEach(d => { d.hidden = !clean(d.dataset.search).includes(query); if (!d.hidden) matches++; });
    sections.forEach(s => { s.hidden = !Array.from(s.querySelectorAll('.dish')).some(d => !d.hidden); });
    document.getElementById('noResults').hidden = matches > 0;
  });
  document.querySelectorAll('.category-nav a').forEach(a => a.addEventListener('click', () => {
    input.value = ''; input.dispatchEvent(new Event('input'));
  }));
})();
(() => {
 const hero=document.querySelector('[data-carousel]');
 if(hero){
  const slides=[...hero.querySelectorAll('[data-slide]')],dots=[...hero.querySelectorAll('[data-dot]')],pause=hero.querySelector('[data-pause]');
  const en=document.documentElement.lang==='en',captions=en?['01 / The wood-fired oven','02 / Breakfast at the Club','03 / A taste of Piazza Pazza']:['01 / Le four à bois','02 / Le déjeuner au Club','03 / Les saveurs de Piazza Pazza'];
  let current=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,timer,hover=false;
  function show(n){current=(n+slides.length)%slides.length;slides.forEach((s,i)=>{s.classList.toggle('active',i===current);s.setAttribute('aria-hidden',String(i!==current));});dots.forEach((d,i)=>d.setAttribute('aria-pressed',String(i===current)));hero.querySelector('.cinema-caption').textContent=captions[current];}
  function schedule(){clearInterval(timer);pause.textContent=paused?'▷':'Ⅱ';pause.setAttribute('aria-label',paused?pause.dataset.playLabel:pause.dataset.pauseLabel);if(!paused&&!hover&&!document.hidden)timer=setInterval(()=>show(current+1),6500);}
  hero.querySelector('[data-prev]').onclick=()=>{show(current-1);schedule();};hero.querySelector('[data-next]').onclick=()=>{show(current+1);schedule();};dots.forEach((d,i)=>d.onclick=()=>{show(i);schedule();});pause.onclick=()=>{paused=!paused;schedule();};
  hero.addEventListener('mouseenter',()=>{hover=true;schedule();});hero.addEventListener('mouseleave',()=>{hover=false;schedule();});hero.addEventListener('focusin',()=>{hover=true;schedule();});hero.addEventListener('focusout',e=>{if(!hero.contains(e.relatedTarget)){hover=false;schedule();}});document.addEventListener('visibilitychange',schedule);
  let startX;hero.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX;},{passive:true});hero.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>55){show(current+(dx<0?1:-1));schedule();}},{passive:true});schedule();
 }
 const dialog=document.querySelector('.lightbox');if(!dialog)return;
 const tiles=[...document.querySelectorAll('[data-photo]')],filters=[...document.querySelectorAll('[data-filter]')];let active=0,visible=tiles,opener;
 function show(tile){active=visible.indexOf(tile);const img=tile.querySelector('img');dialog.querySelector('img').src=img.src;dialog.querySelector('img').alt=img.alt;dialog.querySelector('figcaption').textContent=img.alt;dialog.querySelector('.lightbox-count').textContent=String(active+1).padStart(2,'0')+' / '+String(visible.length).padStart(2,'0');}
 function open(tile){opener=tile;show(tile);dialog.showModal();document.body.style.overflow='hidden';}
 function move(delta){show(visible[(active+delta+visible.length)%visible.length]);}
 tiles.forEach(tile=>tile.onclick=()=>open(tile));filters.forEach(button=>button.onclick=()=>{filters.forEach(f=>f.setAttribute('aria-pressed',String(f===button)));tiles.forEach(tile=>tile.hidden=button.dataset.filter!=='all'&&tile.dataset.group!==button.dataset.filter);visible=tiles.filter(t=>!t.hidden);});
 dialog.querySelector('.lightbox-close').onclick=()=>dialog.close();dialog.querySelector('.lightbox-prev').onclick=()=>move(-1);dialog.querySelector('.lightbox-next').onclick=()=>move(1);dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus();});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}});dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 let x;dialog.addEventListener('touchstart',e=>{x=e.changedTouches[0].clientX;},{passive:true});dialog.addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-x;if(Math.abs(dx)>60)move(dx<0?1:-1);},{passive:true});
 const initial=tiles.find(t=>'#'+t.id===location.hash);if(initial)open(initial);
})();
