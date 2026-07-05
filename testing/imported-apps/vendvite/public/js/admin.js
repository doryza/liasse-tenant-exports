(function(){
  var A=window.__ADMIN__; if(!A) return;
  var items=[]; var editing=null;
  var thead=document.getElementById('adminThead');
  var tbody=document.getElementById('adminTbody');
  var modal=document.getElementById('modal');
  var formEl=document.getElementById('adminForm');
  var titleEl=document.getElementById('modalTitle');
  var searchInput=document.getElementById('tableSearch');
  var rowCountEl=document.getElementById('rowCount');
  var toastEl=document.getElementById('adminToast');

  function toast(msg, type){ if(!toastEl){ toastEl=document.createElement('div'); toastEl.id='adminToast'; toastEl.className='toast'; document.body.appendChild(toastEl); } toastEl.textContent=msg; toastEl.className='toast show '+(type==='error'?'toast-err':'toast-ok'); clearTimeout(toastEl._t); toastEl._t=setTimeout(function(){ toastEl.className='toast'; }, 3000); }
  function esc(s){ return (s==null?'':String(s)).replace(/[&<>"']/g, function(c){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; }); }
  function fieldByName(n){ for(var i=0;i<A.fields.length;i++){ if(A.fields[i].name===n) return A.fields[i]; } return { name:n, label:n, type:'text' }; }
  function labelOf(n){ var f=fieldByName(n); return f.label || n; }
  function statusClass(s){ s=(s||'nouveau'); if(s==='contacté'||s==='contacted') return 'badge-contacted'; if(s==='évalué'||s==='valued') return 'badge-valued'; if(s==='fermé'||s==='closed') return 'badge-closed'; return 'badge-new'; }
  function disp(v, n){ var f=fieldByName(n); if(n==='created_at' || n==='updated_at' || f.type==='date'){ return v ? new Date(v).toLocaleDateString('fr-CA') : ''; } if(f.type==='boolean' || n==='published'){ return (v==1 || v===true) ? '<span class="pill pill-on">Publié</span>' : '<span class="pill pill-off">Masqué</span>'; } var s=v==null?'':String(v); if(s.length>60) s=s.slice(0,60)+'…'; return esc(s); }
  function cellHtml(it, c){ if(c==='status'){ var v=it[c]||'nouveau'; return '<span class="badge '+statusClass(v)+'">'+esc(v)+'</span>'; } return disp(it[c], c); }

  function renderHead(){ var h='<tr>'; A.columns.forEach(function(c){ h+='<th>'+esc(labelOf(c))+'</th>'; }); h+='<th class="th-actions">Actions</th></tr>'; thead.innerHTML=h; }

  function currentItems(){ var qv=(searchInput && searchInput.value)?searchInput.value.trim().toLowerCase():''; if(!qv) return items; return items.filter(function(it){ for(var i=0;i<A.columns.length;i++){ var val=it[A.columns[i]]; if(val!=null && String(val).toLowerCase().indexOf(qv)>=0) return true; } if(it.email && String(it.email).toLowerCase().indexOf(qv)>=0) return true; if(it.phone && String(it.phone).toLowerCase().indexOf(qv)>=0) return true; return false; }); }

  function renderRows(){
    var list=currentItems();
    if(rowCountEl){ rowCountEl.textContent = list.length + (list.length===1?' entrée':' entrées'); }
    if(!items.length){ tbody.innerHTML='<tr><td colspan="'+(A.columns.length+1)+'" class="empty">Aucune entrée. Cliquez « + Ajouter » pour commencer.</td></tr>'; return; }
    if(!list.length){ tbody.innerHTML='<tr><td colspan="'+(A.columns.length+1)+'" class="empty">Aucun résultat pour cette recherche.</td></tr>'; return; }
    var html='';
    list.forEach(function(it){
      html+='<tr>';
      A.columns.forEach(function(c){ html+='<td>'+cellHtml(it, c)+'</td>'; });
      html+='<td class="row-actions"><button class="btn-sm" data-edit="'+it.id+'">Modifier</button> <button class="btn-sm btn-danger" data-del="'+it.id+'">Supprimer</button></td>';
      html+='</tr>';
    });
    tbody.innerHTML=html;
    var eb=tbody.querySelectorAll('[data-edit]'); for(var i=0;i<eb.length;i++){ (function(b){ b.addEventListener('click', function(){ openEdit(b.getAttribute('data-edit')); }); })(eb[i]); }
    var db=tbody.querySelectorAll('[data-del]'); for(var j=0;j<db.length;j++){ (function(b){ b.addEventListener('click', function(){ del(b.getAttribute('data-del')); }); })(db[j]); }
  }

  function load(){ fetch(A.endpoint).then(function(r){ return r.json(); }).then(function(d){ items=d[A.key] || []; renderRows(); }).catch(function(){ items=[]; renderRows(); }); }

  function buildForm(data){
    data=data||{};
    var h='';
    A.fields.forEach(function(f){
      var val=(data[f.name]!==undefined && data[f.name]!==null) ? data[f.name] : (f.default!==undefined ? f.default : '');
      h+='<div class="fld">';
      h+='<label>'+esc(f.label||f.name)+(f.required?' *':'')+'</label>';
      if(f.type==='textarea'){ h+='<textarea name="'+f.name+'" rows="4" placeholder="'+esc(f.placeholder||'')+'">'+esc(val)+'</textarea>'; }
      else if(f.type==='boolean'){ h+='<label class="chk"><input type="checkbox" name="'+f.name+'" '+((val==1||val===true)?'checked':'')+'> '+esc(f.description||'Activer')+'</label>'; }
      else if(f.type==='select'){ h+='<select name="'+f.name+'">'; (f.options||[]).forEach(function(o){ h+='<option value="'+esc(o)+'" '+(String(val)===String(o)?'selected':'')+'>'+esc(o)+'</option>'; }); h+='</select>'; }
      else if(f.type==='number'){ h+='<input type="number" name="'+f.name+'" value="'+esc(val)+'" '+(f.min!=null?('min="'+f.min+'"'):'')+' '+(f.step!=null?('step="'+f.step+'"'):'')+' placeholder="'+esc(f.placeholder||'')+'">'; }
      else if(f.type==='image'){ h+='<input type="text" name="'+f.name+'" value="'+esc(val)+'" placeholder="'+esc(f.placeholder||"URL de l'image")+'"><div class="img-tools"><button type="button" class="btn-sm" data-gen="'+f.name+'">Générer avec l\'IA</button><span class="img-prev">'+(val?('<img src="'+esc(val)+'">'):'')+'</span></div>'; }
      else { h+='<input type="'+(f.type==='email'?'email':(f.type==='url'?'url':'text'))+'" name="'+f.name+'" value="'+esc(val)+'" placeholder="'+esc(f.placeholder||'')+'">'; }
      if(f.description && f.type!=='boolean'){ h+='<small>'+esc(f.description)+'</small>'; }
      h+='</div>';
    });
    formEl.innerHTML=h;
    var gb=formEl.querySelectorAll('[data-gen]'); for(var i=0;i<gb.length;i++){ (function(b){ b.addEventListener('click', function(){ genImage(b.getAttribute('data-gen'), b); }); })(gb[i]); }
  }

  function genImage(name, btn){
    var prompt=window.prompt("Décrivez l'image à générer :"); if(!prompt) return;
    btn.disabled=true; var old=btn.textContent; btn.textContent='Génération…';
    fetch('api/admin/generate-image', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ prompt:prompt, aspectRatio:'16:9' }) })
      .then(function(r){ return r.json(); }).then(function(d){ if(d.imageUrl){ var inp=formEl.querySelector('[name="'+name+'"]'); if(inp) inp.value=d.imageUrl; var prev=btn.parentNode.querySelector('.img-prev'); if(prev) prev.innerHTML='<img src="'+d.imageUrl+'">'; toast('Image générée.','ok'); } else { toast(d.error || 'Échec de la génération.','error'); } })
      .catch(function(){ toast('Échec de la génération.','error'); })
      .then(function(){ btn.disabled=false; btn.textContent=old; });
  }

  function openCreate(){ editing=null; titleEl.textContent='Ajouter'; buildForm({}); modal.hidden=false; }
  function openEdit(id){ var it=null; for(var i=0;i<items.length;i++){ if(String(items[i].id)===String(id)){ it=items[i]; break; } } if(!it) return; editing=id; titleEl.textContent='Modifier'; buildForm(it); modal.hidden=false; }
  function closeModal(){ modal.hidden=true; }

  function collect(){ var out={}; A.fields.forEach(function(f){ var el=formEl.querySelector('[name="'+f.name+'"]'); if(!el) return; if(f.type==='boolean'){ out[f.name]=el.checked?1:0; } else { out[f.name]=el.value; } }); return out; }
  function save(){
    var data=collect();
    var url=editing ? (A.endpoint+'/'+editing) : A.endpoint;
    var method=editing ? 'PUT' : 'POST';
    fetch(url, { method:method, headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(data) })
      .then(function(r){ return r.json(); }).then(function(d){ if(d && d.error){ toast(d.error,'error'); return; } closeModal(); toast(editing?'Modification enregistrée.':'Entrée ajoutée.','ok'); load(); })
      .catch(function(){ toast('Enregistrement impossible.','error'); });
  }
  function del(id){ if(!confirm('Supprimer cette entrée ? Cette action est irréversible.')) return; fetch(A.endpoint+'/'+id, { method:'DELETE' }).then(function(r){ return r.json(); }).then(function(){ toast('Entrée supprimée.','ok'); load(); }).catch(function(){ toast('Suppression impossible.','error'); }); }

  var addBtn=document.getElementById('addBtn'); if(addBtn) addBtn.addEventListener('click', openCreate);
  var saveBtn=document.getElementById('saveBtn'); if(saveBtn) saveBtn.addEventListener('click', save);
  var cancelBtn=document.getElementById('cancelBtn'); if(cancelBtn) cancelBtn.addEventListener('click', closeModal);
  var modalClose=document.getElementById('modalClose'); if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modal) modal.addEventListener('click', function(e){ if(e.target===modal) closeModal(); });
  if(searchInput) searchInput.addEventListener('input', renderRows);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && modal && !modal.hidden) closeModal(); });

  renderHead(); load();
})();
