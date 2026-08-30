(function(){
  var M=window.ADMIN_MODULE||{ key:'posts', label:'Élément' };
  var fields=[], items=[], editing=null, filter='', statusFilter='';
  var tableBox=document.getElementById('adminTable');
  var modal=document.getElementById('adminModal');
  var formBox=document.getElementById('adminForm');
  var modalTitle=document.getElementById('adminModalTitle');

  var LABELS={ customer_name:'Nom du client', appt_date:'Date', appt_time:'Heure', status:'Statut', service_name:'Service', phone:'Téléphone', email:'Courriel', vehicle:'Véhicule', notes:'Notes', name:'Nom', price:'Prix ($)', price_type:'Type de prix', duration_min:'Durée (min)', description:'Description', category:'Catégorie', image_url:'Image', featured:'En vedette', sort_order:'Ordre', published:'Publié', title:'Titre', bay_number:'Baie', equipment:'Équipement', content:'Contenu', day_of_week:'Jour', open_time:'Ouverture', close_time:'Fermeture', closed:'Fermé' };
  var STATUS_LABELS={ pending:'En attente', confirmed:'Confirmé', completed:'Terminé', cancelled:'Annulé' };
  var PRICE_TYPES={ flat:'Prix fixe', hourly:'Taux horaire', from:'À partir de' };
  var DAYS=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

  function h(t){ return (t==null?'':String(t)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function labelFor(f){ return f.label || LABELS[f.name] || (f.name.charAt(0).toUpperCase()+f.name.slice(1).replace(/_/g,' ')); }
  function toast(msg,type){ var c=document.getElementById('adminToast'); if(!c){ c=document.createElement('div'); c.id='adminToast'; c.className='atoast-wrap'; document.body.appendChild(c); } var el=document.createElement('div'); el.className='atoast '+(type==='err'?'atoast-err':'atoast-ok'); el.textContent=msg; c.appendChild(el); setTimeout(function(){ el.classList.add('show'); },10); setTimeout(function(){ el.classList.remove('show'); setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); },300); },2800); }
  function findF(name){ var res=null; formBox.querySelectorAll('[data-f]').forEach(function(i){ if(i.getAttribute('data-f')===name) res=i; }); return res; }

  function load(){
    fetch('api/admin/modules').then(function(r){ return r.json(); }).then(function(md){
      var mod=(md.modules||[]).find(function(m){ return m.key===M.key; });
      fields=mod?mod.fields:[];
      return fetch('api/admin/'+M.key);
    }).then(function(r){ return r.json(); }).then(function(d){ items=d[M.key]||[]; render(); }).catch(function(){ items=[]; render(); });
  }

  function displayCols(){ return fields.filter(function(f){ return f.type!=='textarea'; }).slice(0,6); }
  function statusOpts(){ var f=fields.find(function(x){ return x.name==='status' && x.type==='select'; }); return f?(f.options||[]):null; }

  function cell(f,it){
    var v=it[f.name];
    if(f.type==='boolean') return (v==1||v===true)?"<span class='cbadge cbadge-yes'>Oui</span>":"<span class='cbadge cbadge-no'>Non</span>";
    if(f.type==='image') return v?("<img class='cthumb' src='"+h(v)+"' alt=''>"):"<span class='cmuted'>—</span>";
    if(f.name==='status'){ var s=v||'pending'; return "<span class='badge b-"+h(s)+"'>"+h(STATUS_LABELS[s]||s)+"</span>"; }
    if(f.name==='price'){ if(v==null||v==='') return "<span class='cmuted'>Sur éval.</span>"; return h(v)+' $'; }
    if(f.name==='price_type') return h(PRICE_TYPES[v]||v||'—');
    if(f.name==='day_of_week') return h(DAYS[v]!=null?DAYS[v]:v);
    if(v==null||v==='') return "<span class='cmuted'>—</span>";
    var str=String(v); if(str.length>64) str=str.slice(0,64)+'…'; return h(str);
  }

  function filtered(){
    var list=items.slice();
    if(statusFilter) list=list.filter(function(it){ return String(it.status||'')===statusFilter; });
    if(filter){ var q=filter.toLowerCase(); list=list.filter(function(it){ return Object.keys(it).some(function(k){ return String(it[k]==null?'':it[k]).toLowerCase().indexOf(q)>=0; }); }); }
    return list;
  }

  function listHtml(){
    var cols=displayCols();
    var list=filtered();
    if(!list.length) return "<div class='empty'>"+(items.length?'Aucun résultat pour cette recherche.':'Aucun élément pour le moment. Cliquez sur « + Nouveau » pour commencer.')+"</div>";
    var html="<div class='atable-wrap'><table class='atable'><thead><tr>";
    cols.forEach(function(f){ html+="<th>"+h(labelFor(f))+"</th>"; });
    html+="<th class='tright'>Actions</th></tr></thead><tbody>";
    list.forEach(function(it){
      html+="<tr>";
      cols.forEach(function(f){ html+="<td>"+cell(f,it)+"</td>"; });
      html+="<td class='arow-actions'><button class='abtn abtn-sm' data-edit='"+it.id+"'>Modifier</button> <button class='abtn abtn-sm abtn-danger' data-del='"+it.id+"'>Suppr.</button></td></tr>";
    });
    html+="</tbody></table></div>";
    return html;
  }

  function render(){
    var opts=statusOpts();
    var html="<div class='atb-head'><h2>"+h(M.label)+" <span class='count mono'>"+items.length+"</span></h2><div class='atb-actions'><input id='adminSearch' class='asearch' type='text' placeholder='Rechercher…' value='"+h(filter)+"'><button class='abtn abtn-primary' id='btnNew'>+ Nouveau</button></div></div>";
    if(opts){ html+="<div class='afilter'><button class='achip"+(!statusFilter?' on':'')+"' data-st=''>Tous ("+items.length+")</button>"; opts.forEach(function(o){ var n=items.filter(function(it){ return String(it.status||'')===o; }).length; html+="<button class='achip"+(statusFilter===o?' on':'')+"' data-st='"+h(o)+"'>"+h(STATUS_LABELS[o]||o)+" ("+n+")</button>"; }); html+="</div>"; }
    html+="<div id='adminListBox'>"+listHtml()+"</div>";
    tableBox.innerHTML=html;
    var nb=document.getElementById('btnNew'); if(nb) nb.onclick=function(){ openForm(null); };
    var se=document.getElementById('adminSearch'); if(se){ se.oninput=function(){ filter=se.value; refreshList(); }; }
    tableBox.querySelectorAll('[data-st]').forEach(function(b){ b.onclick=function(){ statusFilter=b.getAttribute('data-st'); render(); }; });
    wireRows();
  }
  function refreshList(){ var box=document.getElementById('adminListBox'); if(box){ box.innerHTML=listHtml(); wireRows(); } }
  function wireRows(){
    tableBox.querySelectorAll('[data-edit]').forEach(function(b){ b.onclick=function(){ var it=items.find(function(x){ return String(x.id)===b.getAttribute('data-edit'); }); openForm(it); }; });
    tableBox.querySelectorAll('[data-del]').forEach(function(b){ b.onclick=function(){ del(b.getAttribute('data-del')); }; });
  }

  function openForm(it){
    editing=it;
    modalTitle.textContent=(it?'Modifier ':'Nouveau ')+M.label;
    var html='';
    fields.forEach(function(f){
      var v=it?it[f.name]:(f.default!==undefined?f.default:'');
      if(v==null) v='';
      html+="<div class='afield'><label>"+h(labelFor(f))+(f.required?" <span class='req'>*</span>":'')+"</label>";
      if(f.type==='textarea') html+="<textarea data-f='"+f.name+"' placeholder='"+h(f.placeholder||'')+"'>"+h(v)+"</textarea>";
      else if(f.type==='boolean') html+="<label class='acheck'><input type='checkbox' data-f='"+f.name+"' "+((v==1||v===true)?'checked':'')+"> "+h(labelFor(f))+"</label>";
      else if(f.type==='select'){ html+="<select data-f='"+f.name+"'>"; (f.options||[]).forEach(function(o){ var lab=STATUS_LABELS[o]||PRICE_TYPES[o]||o; html+="<option value='"+h(o)+"' "+(String(v)===String(o)?'selected':'')+">"+h(lab)+"</option>"; }); html+="</select>"; }
      else if(f.type==='image'){ html+="<div class='aimg'><input type='text' data-f='"+f.name+"' value='"+h(v)+"' placeholder='URL de l’image'>"+(v?"<img src='"+h(v)+"' class='aimg-prev' alt=''>":"")+"<div class='aimg-btns'><label class='abtn abtn-sm'>Téléverser<input type='file' accept='image/*' style='display:none' data-upload='"+f.name+"'></label><button type='button' class='abtn abtn-sm' data-ai='"+f.name+"'>Générer IA</button></div></div>"; }
      else if(f.type==='number') html+="<input type='number' data-f='"+f.name+"' value='"+h(v)+"' "+(f.step?"step='"+f.step+"'":'')+" "+((f.min!=null)?"min='"+f.min+"'":'')+" "+((f.max!=null)?"max='"+f.max+"'":'')+" placeholder='"+h(f.placeholder||'')+"'>";
      else if(f.type==='date') html+="<input type='date' data-f='"+f.name+"' value='"+h(v)+"'>";
      else if(f.type==='time') html+="<input type='time' data-f='"+f.name+"' value='"+h(v)+"'>";
      else if(f.type==='email') html+="<input type='email' data-f='"+f.name+"' value='"+h(v)+"' placeholder='"+h(f.placeholder||'')+"'>";
      else html+="<input type='text' data-f='"+f.name+"' value='"+h(v)+"' placeholder='"+h(f.placeholder||'')+"'>";
      if(f.description) html+="<small>"+h(f.description)+"</small>";
      html+="</div>";
    });
    formBox.innerHTML=html;
    modal.classList.add('open');
    formBox.querySelectorAll('[data-upload]').forEach(function(inp){ inp.onchange=function(){ uploadImg(inp); }; });
    formBox.querySelectorAll('[data-ai]').forEach(function(btn){ btn.onclick=function(){ aiImg(btn); }; });
  }

  function save(){
    var payload={}, missing=[];
    formBox.querySelectorAll('[data-f]').forEach(function(inp){ var name=inp.getAttribute('data-f'); if(inp.type==='checkbox') payload[name]=inp.checked?1:0; else payload[name]=inp.value; });
    fields.forEach(function(f){ if(f.required){ var val=payload[f.name]; if(val==null||String(val).trim()===''){ missing.push(labelFor(f)); } } });
    if(missing.length){ toast('Champs requis: '+missing.join(', '),'err'); return; }
    var btn=document.getElementById('adminSave'); var orig=btn.textContent; btn.disabled=true; btn.textContent='Enregistrement…';
    var url='api/admin/'+M.key+(editing?('/'+editing.id):'');
    var method=editing?'PUT':'POST';
    fetch(url,{ method:method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) }).then(function(r){ if(!r.ok){ return r.json().then(function(e){ throw new Error(e.error||'Erreur'); }); } return r.json(); }).then(function(){ modal.classList.remove('open'); btn.disabled=false; btn.textContent=orig; toast(editing?'Modifié avec succès':'Ajouté avec succès'); load(); }).catch(function(e){ btn.disabled=false; btn.textContent=orig; toast(e.message||'Erreur','err'); });
  }

  function del(id){ if(!confirm('Supprimer cet élément ? Cette action est irréversible.')) return; fetch('api/admin/'+M.key+'/'+id,{ method:'DELETE' }).then(function(r){ if(r.ok){ toast('Supprimé'); load(); } else { toast('Suppression échouée','err'); } }).catch(function(){ toast('Suppression échouée','err'); }); }

  function uploadImg(inp){
    var f=inp.files[0]; if(!f) return;
    toast('Téléversement en cours…');
    var rd=new FileReader();
    rd.onload=function(){ fetch('api/admin/upload-image',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ dataUri:rd.result }) }).then(function(r){ return r.json(); }).then(function(d){ if(d.url){ var t=findF(inp.getAttribute('data-upload')); if(t){ t.value=d.url; showPrev(t,d.url); } toast('Image téléversée'); } else toast(d.error||'Téléversement échoué','err'); }).catch(function(){ toast('Téléversement échoué','err'); }); };
    rd.readAsDataURL(f);
  }
  function aiImg(btn){
    var name=btn.getAttribute('data-ai');
    var p=prompt('Décrivez l’image à générer'); if(!p) return;
    var orig=btn.textContent; btn.disabled=true; btn.textContent='Génération…';
    fetch('api/admin/generate-image',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prompt:p, aspectRatio:'4:3' }) }).then(function(r){ return r.json(); }).then(function(d){ btn.disabled=false; btn.textContent=orig; if(d.imageUrl){ var t=findF(name); if(t){ t.value=d.imageUrl; showPrev(t,d.imageUrl); } toast('Image générée'); } else toast(d.error||'Génération échouée','err'); }).catch(function(){ btn.disabled=false; btn.textContent=orig; toast('Génération échouée','err'); });
  }
  function showPrev(input,url){ var wrap=input.parentNode; var prev=wrap.querySelector('.aimg-prev'); if(!prev){ prev=document.createElement('img'); prev.className='aimg-prev'; input.parentNode.insertBefore(prev, input.nextSibling); } prev.src=url; }

  var sv=document.getElementById('adminSave'); if(sv) sv.onclick=save;
  var cn=document.getElementById('adminCancel'); if(cn) cn.onclick=function(){ modal.classList.remove('open'); };
  if(modal) modal.addEventListener('click', function(e){ if(e.target===modal) modal.classList.remove('open'); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && modal && modal.classList.contains('open')) modal.classList.remove('open'); });
  load();
})();
