(function(){
  var audio=document.getElementById('audioEl');
  var player=document.getElementById('player');
  if(!audio||!player) return;
  var cover=document.getElementById('playerCover');
  var titleEl=document.getElementById('playerTitle');
  var albumEl=document.getElementById('playerAlbum');
  var curEl=document.getElementById('playerCur');
  var durEl=document.getElementById('playerDur');
  var fill=document.getElementById('seekFill');
  var track=document.getElementById('seekTrack');
  var ptPlay=document.getElementById('ptPlay');
  var ptPause=document.getElementById('ptPause');
  function fmt(s){ s=Math.floor(s||0); var m=Math.floor(s/60); var x=s%60; return m+':'+(x<10?'0':'')+x; }
  function setIcons(playing){ if(ptPlay)ptPlay.style.display=playing?'none':'inline-flex'; if(ptPause)ptPause.style.display=playing?'inline-flex':'none'; player.classList.toggle('playing',playing); }
  window.playTrack=function(url,title,album,coverUrl){
    if(!url) return;
    if(audio.getAttribute('src')!==url){ audio.setAttribute('src',url); }
    titleEl.textContent=title||'';
    albumEl.textContent=album||'';
    if(coverUrl){ cover.src=coverUrl; cover.style.display='block'; } else { cover.style.display='none'; }
    player.classList.add('active'); player.setAttribute('aria-hidden','false');
    document.body.classList.add('has-player');
    var p=audio.play(); if(p&&p.catch) p.catch(function(){});
  };
  document.addEventListener('click',function(e){
    var pb=e.target.closest('[data-play]');
    if(pb){ if(pb.hasAttribute('disabled')) return; e.preventDefault(); window.playTrack(pb.getAttribute('data-audio'),pb.getAttribute('data-title'),pb.getAttribute('data-album'),pb.getAttribute('data-cover')); return; }
    var fav=e.target.closest('[data-fav]');
    if(fav){ e.preventDefault(); toggleFav(fav); return; }
  });
  var toggleBtn=document.getElementById('playerToggle');
  if(toggleBtn) toggleBtn.addEventListener('click',function(){ if(audio.paused){ var p=audio.play(); if(p&&p.catch) p.catch(function(){}); } else audio.pause(); });
  var closeBtn=document.getElementById('playerClose');
  if(closeBtn) closeBtn.addEventListener('click',function(){ audio.pause(); player.classList.remove('active'); player.setAttribute('aria-hidden','true'); document.body.classList.remove('has-player'); });
  audio.addEventListener('play',function(){ setIcons(true); });
  audio.addEventListener('pause',function(){ setIcons(false); });
  audio.addEventListener('timeupdate',function(){ if(audio.duration){ fill.style.width=(audio.currentTime/audio.duration*100)+'%'; curEl.textContent=fmt(audio.currentTime); } });
  audio.addEventListener('loadedmetadata',function(){ durEl.textContent=fmt(audio.duration); });
  audio.addEventListener('ended',function(){ setIcons(false); fill.style.width='0%'; });
  if(track) track.addEventListener('click',function(e){ if(!audio.duration) return; var r=track.getBoundingClientRect(); var ratio=(e.clientX-r.left)/r.width; audio.currentTime=Math.max(0,Math.min(1,ratio))*audio.duration; });
  function loggedIn(){ try{ return window.TenantSDK&&TenantSDK.auth&&TenantSDK.auth.isLoggedIn(); }catch(e){ return false; } }
  async function refreshFavs(){
    if(!loggedIn()) return;
    try{ var r=await TenantSDK.fetch('./api/favorites'); if(!r.ok) return; var d=await r.json(); (d.ids||[]).forEach(function(id){ var el=document.querySelector(`[data-fav='${id}']`); if(el) el.classList.add('on'); }); }catch(e){}
  }
  async function toggleFav(el){
    if(!loggedIn()){ try{ if(window.TenantSDK&&TenantSDK.ui) TenantSDK.ui.showLogin({onSuccess:function(){ location.reload(); }}); }catch(e){} return; }
    var id=parseInt(el.getAttribute('data-fav'));
    try{ var r=await TenantSDK.fetch('./api/favorites',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trackId:id})}); var d=await r.json(); if(d.favorited){ el.classList.add('on'); } else { el.classList.remove('on'); if(document.body.getAttribute('data-page')==='favoris'){ location.reload(); } } }catch(e){}
  }
  if(document.readyState!=='loading') refreshFavs(); else document.addEventListener('DOMContentLoaded',refreshFavs);
})();
