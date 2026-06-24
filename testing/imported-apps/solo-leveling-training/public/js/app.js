(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  function showToast(msg, ok){
    var el=document.getElementById('sysToast');
    if(!el){ el=document.createElement('div'); el.id='sysToast'; el.className='toast'; document.body.appendChild(el); }
    el.style.borderColor = (ok===false) ? '#f87171' : '#22d3ee';
    el.textContent=msg; el.classList.add('show');
    setTimeout(function(){ el.classList.remove('show'); }, 3200);
  }

  function showSystemNotif(data){
    var rank = data.rank || { label:'E', name:'' };
    var lvlup = data.leveledUp ? "<div class='nf-levelup'>NIVEAU SUPÉRIEUR</div>" : "";
    var ov=document.createElement('div'); ov.className='notif-overlay';
    ov.innerHTML = "<div class='swin notif-card'><div class='eyebrow'>[ Système ]</div><h2 style='margin:.6rem 0;color:#22d3ee'>Quête complétée</h2><div class='nf-xp'>+" + (data.xpGain||0) + " XP</div>" + lvlup + "<div class='nf-stats'><span>Niveau " + (data.level||1) + "</span><span>Rang " + rank.label + "</span><span>Série " + (data.streak||0) + " j</span></div><button class='btn btn-primary' id='nfClose' style='margin-top:1.2rem;background-color:#6366f1;color:#fff'>Continuer</button></div>";
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.classList.add('show'); });
    function close(){ ov.classList.remove('show'); setTimeout(function(){ ov.remove(); }, 300); }
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
    var b=ov.querySelector('#nfClose'); if(b) b.addEventListener('click', close);
  }

  function markCompleted(idx){
    document.querySelectorAll('[data-complete-day="'+idx+'"]').forEach(function(b){ b.disabled=true; b.classList.add('is-done'); b.innerHTML='Quête complétée ✓'; });
    var card=document.querySelector('[data-day-card="'+idx+'"]'); if(card) card.classList.add('done');
    var chk=document.querySelector('[data-day-check="'+idx+'"]'); if(chk) chk.classList.add('checked');
  }

  function isLogged(){ return !!(window.TenantSDK && TenantSDK.auth && TenantSDK.auth.isLoggedIn && TenantSDK.auth.isLoggedIn()); }

  function bindComplete(){
    document.querySelectorAll('[data-complete-day]').forEach(function(b){
      b.addEventListener('click', function(){
        var di=b.getAttribute('data-complete-day');
        if(!isLogged()){ if(window.TenantSDK && TenantSDK.ui){ TenantSDK.ui.showLogin({ onSuccess:function(){ location.reload(); } }); } return; }
        var orig=b.innerHTML; b.disabled=true; b.innerHTML='Validation...';
        TenantSDK.fetch('./api/quests/complete', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ dayIndex: parseInt(di,10) }) })
          .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, body:j }; }); })
          .then(function(res){
            if(!res.ok){ showToast((res.body && res.body.error) || 'Erreur', false); b.disabled=false; b.innerHTML=orig; return; }
            showSystemNotif(res.body); markCompleted(di);
          })
          .catch(function(){ showToast('Erreur de connexion', false); b.disabled=false; b.innerHTML=orig; });
      });
    });
  }

  function setText(sel, val){ document.querySelectorAll(sel).forEach(function(e){ e.textContent=val; }); }

  function refreshStats(){
    if(!isLogged()) return;
    TenantSDK.fetch('./api/me/stats').then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
      if(!d || !d.loggedIn) return;
      document.querySelectorAll('[data-hunter-locked]').forEach(function(e){ e.style.display='none'; });
      document.querySelectorAll('[data-hunter-active]').forEach(function(e){ e.style.display=''; });
      setText('[data-stat="level"]', d.level);
      setText('[data-stat="rank"]', d.rank.label);
      setText('[data-stat="rankname"]', d.rank.name);
      setText('[data-stat="xp"]', d.xp);
      setText('[data-stat="next"]', d.nextNeed);
      setText('[data-stat="streak"]', d.streak);
      setText('[data-stat="longest"]', d.longestStreak);
      setText('[data-stat="completions"]', d.completions);
      document.querySelectorAll('[data-stat="xpbar"]').forEach(function(e){ e.style.width=d.pct+'%'; });
      document.querySelectorAll('[data-rank-color]').forEach(function(e){ e.style.color=d.rank.color; e.style.borderColor=d.rank.color; });
      (d.completedDays||[]).forEach(function(idx){ markCompleted(idx); });
    }).catch(function(){});
  }

  function renderHistory(){
    var box=document.getElementById('historyBox'); if(!box) return;
    if(!isLogged()) return;
    TenantSDK.fetch('./api/me/history').then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
      if(!d || !d.history) return;
      var days=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
      if(!d.history.length){ box.innerHTML="<p class='muted'>Aucune quête complétée pour le moment. Lance ton premier protocole !</p>"; return; }
      var h='';
      d.history.forEach(function(it){
        var dt=''; try{ dt=new Date(it.completed_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}); }catch(e){}
        h += "<div class='hist-row'><div><strong>" + (it.title || days[it.day_index] || 'Quête') + "</strong><div class='muted' style='font-size:.85rem'>" + dt + "</div></div><span class='chip chip-gold'>+" + (it.xp_gained||0) + " XP</span></div>";
      });
      box.innerHTML=h;
    }).catch(function(){});
  }

  function bindContact(){
    var form=document.getElementById('contactForm'); if(!form) return;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn=form.querySelector('button[type=submit]'); var ot=btn?btn.textContent:'';
      if(btn){ btn.disabled=true; btn.textContent='Envoi...'; }
      function v(id){ var el=document.getElementById(id); return el?el.value:''; }
      fetch('./api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name:v('cName'), email:v('cEmail'), message:v('cMsg') }) })
        .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, body:j }; }); })
        .then(function(res){ if(btn){ btn.disabled=false; btn.textContent=ot; }
          if(res.ok){ form.reset(); var m=document.getElementById('contactMsg'); if(m) m.style.display='block'; showToast('Message transmis au Système.', true); }
          else { showToast((res.body && res.body.error) || 'Erreur', false); }
        }).catch(function(){ if(btn){ btn.disabled=false; btn.textContent=ot; } showToast('Erreur de connexion', false); });
    });
  }

  ready(function(){ bindComplete(); bindContact(); refreshStats(); renderHistory(); });
  window.addEventListener('load', function(){
    try{ if(window.TenantSDK && TenantSDK.ui){ TenantSDK.ui.showInstallBanner(); } }catch(e){}
    setTimeout(function(){ try{ if(window.TenantSDK && TenantSDK.ui){ TenantSDK.ui.showPushPrompt(); } }catch(e){} }, 9000);
  });
})();
