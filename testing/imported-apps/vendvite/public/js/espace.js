(function(){
  var VV = window.VV || { profile: {}, published: false, active: false, live: false };
  var profile = VV.profile || {};
  function $(id){ return document.getElementById(id); }
  // Textes traduits, rendus par le serveur selon la langue choisie.
  function T(k){ var d = window.VV_T || {}; return (d[k] != null) ? d[k] : ''; }
  function on(el, ev, fn){ if(el) el.addEventListener(ev, fn); }

  var dirty=false,editVersion=0,leadSaves={};
  function notice(message,reconnect){
    if($('workspaceNotice')){$('workspaceNotice').hidden=!message;$('workspaceNoticeText').textContent=message||'';$('workspaceReconnect').hidden=!reconnect;}
  }
  async function apiFetch(url,options,retried){
    options=options||{};
    var opts=Object.assign({},options,{headers:Object.assign({},options.headers||{}, {'X-VV-CSRF':VV.csrf||''})});
    var response=await fetch(url,opts);
    if(response.status===401)notice(T('ws_session_expired'),true);
    if(response.status===403 && !retried){
      // Signing in in another tab changes the cookie. Refresh only the CSRF
      // token, then replay a request that was rejected BEFORE any mutation.
      var body=await response.clone().json().catch(function(){return {};});
      if(body.code==='CSRF_INVALID'){
        var refresh=await fetch('api/espace/session');
        if(refresh.ok){var session=await refresh.json();VV.csrf=session.csrf;return apiFetch(url,options,true);}
        notice(T('ws_session_expired'),true);
      }
    }
    return response;
  }
  window.addEventListener('offline',function(){notice(T('ws_offline'));});
  window.addEventListener('online',function(){notice(T('ws_online'));});
  function hasUnsaved(){return dirty||Object.keys(leadSaves).some(function(k){var r=leadSaves[k];return r.pending||r.running||r.failed;});}
  window.addEventListener('beforeunload',function(e){if(hasUnsaved()){e.preventDefault();e.returnValue=T('ws_leave');}});
  function profileChanged(){if(!$('saveBtn'))return;dirty=true;editVersion++;$('savedFlag').textContent=T('ws_unsaved');$('savedFlag').classList.remove('is-error');}
  document.querySelectorAll('[data-k]').forEach(function(el){on(el,'input',profileChanged);});
  document.querySelectorAll('[data-signout]').forEach(function(btn){
    // Liasse auto-wires login keywords at document capture. Broker signout
    // belongs to this workspace; handle these marked controls one level earlier.
    window.addEventListener('click',async function(e){
      if(!e.target.closest || e.target.closest('[data-signout]')!==btn)return;
      e.preventDefault();e.stopImmediatePropagation();
      if(hasUnsaved()){notice(T('ws_leave'));return;}
      var all=btn.dataset.signout==='all';
      if(all && btn.dataset.armed!=='1'){btn.dataset.armed='1';btn.textContent=T('ws_logout_confirm');return;}
      btn.disabled=true;
      try{var r=await apiFetch('api/espace/deconnexion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({all:all})});if(r.ok){location.href=(await r.json()).redirect;return;}notice(T('ws_retry'));}catch(e){notice(T('ws_retry'));}
      btn.disabled=false;
    },true);
  });
  on($('copyPageLink'),'click',async function(){try{await navigator.clipboard.writeText($('copyPageLink').dataset.url);$('copyPageLink').textContent=T('ws_copied');}catch(e){notice(T('ws_retry'));}});

  // ── Repeatable rows (links + testimonials)
  function rowInput(ph, val, key){
    var i = document.createElement('input');
    i.placeholder = ph; i.value = val || ''; i.setAttribute('data-f', key);
    return i;
  }
  function buildRow(container, fields, values){
    var row = document.createElement('div');
    row.className = 'esp-link-row';
    row.addEventListener('input',profileChanged);
    fields.forEach(function(f){ row.appendChild(rowInput(f.ph, (values || {})[f.key], f.key)); });
    var del = document.createElement('button');
    del.type = 'button'; del.className = 'esp-x'; del.setAttribute('aria-label', 'Retirer'); del.innerHTML = '&times;';
    on(del, 'click', function(){ row.remove();profileChanged(); });
    row.appendChild(del);
    container.appendChild(row);
  }
  var LINK_F = [{ key: 'label', ph: T('esp_social_link_label_placeholder') }, { key: 'url', ph: 'https://…' }];
  var TM_F = [{ key: 'author', ph: T('esp_tm_author_ph') }, { key: 'neighborhood', ph: T('esp_tm_area_ph') }, { key: 'quote', ph: T('esp_tm_quote_ph') }, { key: 'sale_result', ph: T('esp_tm_result_ph') }];
  var linkList = $('linkList'), tmList = $('tmList');
  if (linkList) (profile.links || []).forEach(function(l){ buildRow(linkList, LINK_F, l); });
  if (tmList) (profile.testimonials || []).forEach(function(x){ buildRow(tmList, TM_F, x); });
  on($('addLink'), 'click', function(){ buildRow(linkList, LINK_F, {});profileChanged(); });
  on($('addTm'), 'click', function(){ buildRow(tmList, TM_F, {});profileChanged(); });

  function readRows(container, fields){
    return Array.prototype.map.call(container.querySelectorAll('.esp-link-row'), function(row){
      var o = {};
      fields.forEach(function(f){
        var el = row.querySelector('[data-f="' + f.key + '"]');
        o[f.key] = el ? el.value.trim() : '';
      });
      return o;
    });
  }

  // Save is explicit and versioned. A second tab can never silently win.
  var savePromise=null;
  async function saveProfile(){
    if(savePromise)return savePromise;
    if(!$('saveBtn'))return true;
    savePromise=(async function(){
      var btn=$('saveBtn'),flag=$('savedFlag'),snapshot=editVersion;
      var payload={profileVersion:VV.profileVersion};
      document.querySelectorAll('[data-k]').forEach(function(el){payload[el.dataset.k]=el.value.trim();});
      payload.links=readRows(linkList,LINK_F).filter(function(l){return l.label||l.url;});
      payload.testimonials=readRows(tmList,TM_F).filter(function(x){return x.author||x.quote;});
      btn.disabled=true;flag.textContent=T('ws_saving');flag.classList.remove('is-error');
      try{
        var r=await apiFetch('api/espace/profil',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        var d=await r.json().catch(function(){return {};});
        if(!r.ok){flag.textContent=d.code==='PROFILE_CONFLICT'?T('ws_conflict'):(d.error||T('ws_save_retry'));flag.classList.add('is-error');return false;}
        VV.profileVersion=d.profileVersion;profile=d.profile;dirty=editVersion!==snapshot;
        flag.textContent=dirty?T('ws_unsaved'):T('ws_saved');return !dirty;
      }catch(e){flag.textContent=T('ws_save_retry');flag.classList.add('is-error');return false;}
      finally{btn.disabled=false;}
    })();
    try{return await savePromise;}finally{savePromise=null;}
  }
  on($('saveBtn'),'click',function(){saveProfile();});
  on($('setupDoneBtn'),'click',async function(){
    var btn=$('setupDoneBtn'),err=$('setupDoneError');btn.disabled=true;err.textContent='';
    if(!await saveProfile()){err.textContent=T('ws_save_retry');btn.disabled=false;return;}
    try{
      var r=await apiFetch('api/espace/page-prete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profileVersion:VV.profileVersion})});
      var d=await r.json().catch(function(){return {};});
      if(r.ok){VV.profileVersion=d.profileVersion;if(dirty){err.textContent=T('ws_unsaved');btn.disabled=false;return;}location.href='espace';return;}
      err.textContent=d.code==='PROFILE_CONFLICT'?T('ws_conflict'):(d.error||T('ws_retry'));
    }catch(e){err.textContent=T('ws_retry');}
    btn.disabled=false;
  });

  // ── Photo upload
  on($('photoInput'), 'change', function(e){
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if(['image/png','image/jpeg','image/webp'].indexOf(file.type)===-1){$('photoHint').textContent=T('esp_upload_refused_error');return;}
    var hint = $('photoHint');
    if (file.size > 8 * 1024 * 1024) { hint.textContent = T('esp_photo_too_large_error'); return; }
    hint.textContent = T('esp_uploading_status');
    var reader = new FileReader();
    reader.onload = async function(){
      try{
        var r = await apiFetch('api/espace/photo', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result,profileVersion:VV.profileVersion })
        });
        var d = await r.json().catch(function(){ return {}; });
        if (r.ok && d.url) {
          VV.profileVersion=d.profileVersion;
          var img = $('portraitImg'), empty = $('portraitEmpty');
          img.onload = function(){ img.hidden = false; if (empty) empty.hidden = true; };
          img.onerror = function(){ img.hidden = true; if (empty) empty.hidden = false; };
          img.src = d.url;
          hint.textContent = T('esp_photo_updated_toast');
        } else { hint.textContent = d.code==='PROFILE_CONFLICT'?T('ws_conflict'):T('esp_upload_refused_error'); }
      }catch(_){ hint.textContent = T('esp_upload_refused_error'); }
    };
    reader.readAsDataURL(file);
  });

  // ── Publish toggle
  on($('pubBtn'), 'click', async function(){
    var btn = $('pubBtn');
    if(dirty && !await saveProfile())return;
    var next = btn.getAttribute('data-published') !== '1';
    btn.disabled = true;
    try{
      var r = await apiFetch('api/espace/publier', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: next })
      });
      if (r.ok) { location.reload(); return; }
      var d = await r.json().catch(function(){ return {}; });
      if (d.code === 'PAYMENT_REQUIRED') window.location.href = 'espace/abonnement';
      else notice(T('ws_retry'));
    }catch(_){notice(T('ws_retry'));}
    btn.disabled = false;
  });

  // ── Subscribe / cancel
  on($('subBtn'), 'click', async function(){
    var btn = $('subBtn'), err = $('billError');
    btn.disabled = true; err.textContent = '';
    try{
      var r = await apiFetch('api/espace/abonnement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      var d = await r.json().catch(function(){ return {}; });
      if (r.ok && d.approveUrl) { window.location.href = d.approveUrl; return; }
      err.textContent = d.code === 'SETUP_REQUIRED'
        ? T('esp_setup_required_error')
        : d.code === 'NOT_CONFIGURED'
          ? T('esp_payment_not_open_contact_us')
          : T('esp_payment_open_failed_retry');
    }catch(_){ err.textContent = T('esp_payment_open_failed'); }
    btn.disabled = false;
  });

  var cancelArmed = false;
  on($('cancelBtn'), 'click', async function(){
    var btn = $('cancelBtn');
    if (!cancelArmed) { cancelArmed = true; btn.textContent = T('esp_confirm_cancellation_button'); return; }
    btn.disabled = true;
    try{
      var r = await apiFetch('api/espace/abonnement/annuler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (r.ok) { location.reload(); return; }
      notice(T('ws_retry'));
    }catch(_){notice(T('ws_retry'));}
    btn.disabled = false;
  });

  // Serialize saves per lead so a slow response cannot overwrite newer notes.
  function leadRecord(id){return leadSaves[id]||(leadSaves[id]={pending:false,running:false,failed:false,timer:null});}
  async function flushLead(id){
    var record=leadRecord(id);if(record.running)return;
    var article=document.querySelector('.esp-lead[data-id="'+id+'"]'),flag=article.querySelector('[data-lead-save]'),retry=article.querySelector('[data-lead-retry]');
    record.running=true;record.failed=false;retry.hidden=true;
    while(record.pending){
      record.pending=false;flag.textContent=T('ws_saving');flag.className='';
      var payload={status:article.querySelector('.esp-lead-status').value,notes:article.querySelector('.esp-lead-notes').value};
      try{
        var r=await apiFetch('api/espace/leads/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        if(!r.ok)throw Error('save');
        flag.textContent=T('ws_saved');
      }catch(e){record.failed=true;record.pending=true;flag.textContent=T('ws_save_retry');flag.className='is-error';retry.hidden=false;break;}
    }
    record.running=false;
  }
  function queueLead(id,delay){var r=leadRecord(id);r.pending=true;clearTimeout(r.timer);r.timer=setTimeout(function(){flushLead(id);},delay);}
  document.querySelectorAll('.esp-lead-status').forEach(function(el){on(el,'change',function(){queueLead(el.dataset.id,0);filterLeads();});});
  document.querySelectorAll('.esp-lead-notes').forEach(function(el){on(el,'input',function(){queueLead(el.dataset.id,700);document.querySelector('[data-lead-save="'+el.dataset.id+'"]').textContent=T('ws_unsaved');});});
  document.querySelectorAll('[data-lead-retry]').forEach(function(btn){on(btn,'click',function(){queueLead(btn.dataset.leadRetry,0);});});
  function filterLeads(){
    if(!$('leadSearch'))return;
    var search=$('leadSearch').value.trim().toLocaleLowerCase(),status=$('leadFilter').value,visible=0;
    document.querySelectorAll('.esp-lead').forEach(function(article){var match=(!search||article.textContent.toLocaleLowerCase().includes(search))&&(!status||article.querySelector('.esp-lead-status').value===status);article.hidden=!match;if(match)visible++;});
    $('leadNoMatches').hidden=visible>0;
  }
  on($('leadSearch'),'input',filterLeads);on($('leadFilter'),'change',filterLeads);

  window.VVWorkspace={request:apiFetch,notice:notice};
})();
