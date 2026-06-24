(function(){
  var MODULE = window.__ADMIN_MODULE;
  var FIELDS=[], LABEL='', ITEMS=[], EDIT_ID=null, SEARCH='', FILTERS={};
  var DAYNAMES=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

  function api(url, opts){ return fetch(url, opts).then(function(r){ return r.json().then(function(j){ return { ok:r.ok, status:r.status, body:j }; }).catch(function(){ return { ok:r.ok, status:r.status, body:{} }; }); }); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fieldLabel(f){ return f.label || (f.name||'').replace(/_/g,' '); }

  function toast(msg, ok){
    var el=document.getElementById('adminToast');
    if(!el){ el=document.createElement('div'); el.id='adminToast'; el.className='admin-toast'; document.body.appendChild(el); }
    el.style.borderColor=(ok===false)?'#f87171':'#22d3ee';
    el.textContent=msg; el.classList.add('show');
    clearTimeout(el._t); el._t=setTimeout(function(){ el.classList.remove('show'); }, 2800);
  }

  function load(){
    api('api/admin/modules').then(function(res){
      var mods=(res.body && res.body.modules) || [];
      var m=mods.filter(function(x){ return x.key===MODULE; })[0];
      if(m){ FIELDS=m.fields||[]; LABEL=m.label||MODULE; }
      var t=document.getElementById('modTitle'); if(t && LABEL) t.textContent=LABEL;
      buildControls();
      loadItems();
    });
  }
  function loadItems(){ api('api/admin/'+MODULE).then(function(res){ ITEMS=(res.body && res.body[MODULE]) || []; render(); }); }

  function selectFields(){ return FIELDS.filter(function(f){ return f.type==='select'; }); }
  function buildControls(){
    var bar=document.getElementById('listControls'); if(!bar) return;
    var h="<div class='lc-search'><input type='text' id='lcSearch' placeholder='Rechercher…' aria-label='Rechercher'></div>";
    selectFields().forEach(function(f){
      h+="<div class='lc-filter'><select data-filter='"+f.name+"' aria-label='"+esc(fieldLabel(f))+"'><option value=''>Tous : "+esc(fieldLabel(f))+"</option>";
      (f.options||[]).forEach(function(o){ var lbl=o; if(f.name==='day_index'){ lbl=DAYNAMES[parseInt(o,10)]||o; } else if(f.name==='variation_index'){ lbl='Variation '+(parseInt(o,10)+1); } h+="<option value='"+esc(o)+"'>"+esc(lbl)+"</option>"; });
      h+="</select></div>";
    });
    h+="<div class='lc-count' id='lcCount'></div>";
    bar.innerHTML=h;
    var s=document.getElementById('lcSearch'); if(s){ s.addEventListener('input', function(){ SEARCH=s.value.toLowerCase(); render(); }); }
    bar.querySelectorAll('[data-filter]').forEach(function(sel){ sel.addEventListener('change', function(){ FILTERS[sel.getAttribute('data-filter')]=sel.value; render(); }); });
  }
  function filtered(){
    return ITEMS.filter(function(it){
      for(var k in FILTERS){ if(FILTERS[k]!=='' && FILTERS[k]!=null){ if(String(it[k])!==String(FILTERS[k])) return false; } }
      if(SEARCH){ var hay=''; FIELDS.forEach(function(f){ if(it[f.name]!=null) hay+=' '+String(it[f.name]); }); if(hay.toLowerCase().indexOf(SEARCH)<0) return false; }
      return true;
    });
  }

  function colFields(){ return FIELDS.filter(function(f){ return f.type!=='textarea' && f.type!=='image'; }).slice(0,4); }
  function imageField(){ return FIELDS.filter(function(f){ return f.type==='image'; })[0]; }
  function cellVal(it, f){
    var v=it[f.name];
    if(f.name==='day_index'){ var n=parseInt(v,10); return isNaN(n)?'—':DAYNAMES[n]; }
    if(f.name==='variation_index'){ var vn=parseInt(v,10); return isNaN(vn)?'—':('Var. '+(vn+1)); }
    if(f.type==='boolean'){ return (v==1||v===true||v==='1')?'Oui':'Non'; }
    if(v==null||v==='') return '—';
    var s=String(v); return s.length>60 ? s.slice(0,60)+'…' : s;
  }
  function render(){
    var cols=colFields();
    var imgF=imageField();
    var thead=document.getElementById('thead');
    var tbody=document.getElementById('tbody');
    var empty=document.getElementById('emptyState');
    var data=filtered();
    var cnt=document.getElementById('lcCount'); if(cnt){ cnt.textContent=data.length+' / '+ITEMS.length; }
    var hr='<tr>';
    if(imgF) hr+='<th></th>';
    hr+='<th>#</th>';
    cols.forEach(function(f){ hr+='<th>'+esc(fieldLabel(f))+'</th>'; });
    hr+='<th>Actions</th></tr>';
    thead.innerHTML=hr;
    if(!ITEMS.length){ tbody.innerHTML=''; empty.style.display='block'; empty.textContent='Aucune entrée. Utilise le bouton « + » pour en créer une.'; return; }
    if(!data.length){ tbody.innerHTML=''; empty.style.display='block'; empty.textContent='Aucun résultat pour ce filtre.'; return; }
    empty.style.display='none';
    var rows='';
    data.forEach(function(it){
      rows+='<tr>';
      if(imgF){ var u=it[imgF.name]; rows+="<td>"+(u?("<img class='tbl-thumb' src='"+esc(u)+"' alt=''>"):"<span class='tbl-thumb tbl-thumb-empty'></span>")+"</td>"; }
      rows+="<td class='muted'>"+it.id+"</td>";
      cols.forEach(function(f){
        if(f.type==='boolean'){ var on=(it[f.name]==1||it[f.name]===true||it[f.name]==='1'); rows+="<td><span class='badge "+(on?'badge-on':'badge-off')+"'>"+esc(cellVal(it,f))+"</span></td>"; }
        else { rows+='<td>'+esc(cellVal(it,f))+'</td>'; }
      });
      rows+="<td class='row-actions'><button class='abtn abtn-sm' data-edit='"+it.id+"'>Modifier</button> <button class='abtn abtn-sm abtn-danger' data-del='"+it.id+"'>Suppr.</button></td></tr>";
    });
    tbody.innerHTML=rows;
    tbody.querySelectorAll('[data-edit]').forEach(function(b){ b.addEventListener('click', function(){ openEdit(parseInt(b.getAttribute('data-edit'),10)); }); });
    tbody.querySelectorAll('[data-del]').forEach(function(b){ b.addEventListener('click', function(){ del(parseInt(b.getAttribute('data-del'),10)); }); });
  }

  function buildForm(item){
    var form=document.getElementById('modalForm');
    var h='';
    FIELDS.forEach(function(f){
      var val = item ? item[f.name] : (f.default!==undefined ? f.default : '');
      if(val==null) val='';
      h+="<div class='fld'>";
      if(f.type!=='boolean'){ h+='<label>'+esc(fieldLabel(f))+(f.required?' *':'')+'</label>'; }
      if(f.type==='textarea'){ h+="<textarea name='"+f.name+"' rows='4' placeholder='"+esc(f.placeholder||'')+"'>"+esc(val)+"</textarea>"; }
      else if(f.type==='boolean'){ var ck=(val==1||val===true||val==='1'||(item==null && f.default))?'checked':''; h+="<label class='switch'><input type='checkbox' name='"+f.name+"' "+ck+"> "+esc(fieldLabel(f))+"</label>"; }
      else if(f.type==='select'){ h+="<select name='"+f.name+"'>"; (f.options||[]).forEach(function(o){ var lbl=o; if(f.name==='day_index'){ lbl=DAYNAMES[parseInt(o,10)]||o; } else if(f.name==='variation_index'){ lbl='Variation '+(parseInt(o,10)+1); } var sel=(String(val)===String(o))?'selected':''; h+="<option value='"+esc(o)+"' "+sel+">"+esc(lbl)+"</option>"; }); h+="</select>"; }
      else if(f.type==='image'){ h+="<div class='img-fld'><input type='text' name='"+f.name+"' value='"+esc(val)+"' placeholder='URL de l’image'><div class='img-actions'><button type='button' class='abtn abtn-sm' data-upload='"+f.name+"'>Téléverser</button><button type='button' class='abtn abtn-sm' data-ai='"+f.name+"'>Générer (IA)</button></div><img class='img-prev' data-prev='"+f.name+"' src='"+esc(val)+"' "+(val?'':"style='display:none'")+"></div>"; }
      else if(f.type==='number'){ h+="<input type='number' name='"+f.name+"' value='"+esc(val)+"' placeholder='"+esc(f.placeholder||'')+"'"+(f.min!=null?" min='"+f.min+"'":'')+(f.step!=null?" step='"+f.step+"'":'')+">"; }
      else { h+="<input type='text' name='"+f.name+"' value='"+esc(val)+"' placeholder='"+esc(f.placeholder||'')+"'"+(f.maxLength?" maxlength='"+f.maxLength+"'":'')+">"; }
      if(f.description){ h+="<small class='hint'>"+esc(f.description)+"</small>"; }
      h+="</div>";
    });
    form.innerHTML=h;
    form.querySelectorAll('[data-upload]').forEach(function(b){ b.addEventListener('click', function(){ doUpload(b.getAttribute('data-upload')); }); });
    form.querySelectorAll('[data-ai]').forEach(function(b){ b.addEventListener('click', function(){ doAI(b.getAttribute('data-ai')); }); });
    form.querySelectorAll("input[type=text]").forEach(function(inp){ var p=form.querySelector("[data-prev='"+inp.name+"']"); if(p){ inp.addEventListener('input', function(){ p.src=inp.value; p.style.display=inp.value?'block':'none'; }); } });
  }

  function setField(name, url){ var f=document.getElementById('modalForm'); var inp=f.querySelector("[name='"+name+"']"); if(inp) inp.value=url; var p=f.querySelector("[data-prev='"+name+"']"); if(p){ p.src=url; p.style.display='block'; } }

  function doUpload(name){
    var inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
    inp.onchange=function(){ var file=inp.files[0]; if(!file) return; var rd=new FileReader(); rd.onload=function(){ var btn=document.querySelector("[data-upload='"+name+"']"); var ot=btn?btn.textContent:''; if(btn){ btn.textContent='…'; btn.disabled=true; } fetch('api/admin/upload', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ dataUri: rd.result }) }).then(function(r){ return r.json(); }).then(function(j){ if(btn){ btn.textContent=ot; btn.disabled=false; } if(j.url){ setField(name, j.url); toast('Image téléversée',true); } else { toast(j.error||'Échec',false); } }).catch(function(){ if(btn){ btn.textContent=ot; btn.disabled=false; } toast('Échec du téléversement',false); }); }; rd.readAsDataURL(file); };
    inp.click();
  }
  function doAI(name){
    var p=prompt("Décris l'image à générer :"); if(!p) return;
    var btn=document.querySelector("[data-ai='"+name+"']"); var ot=btn?btn.textContent:''; if(btn){ btn.textContent='…'; btn.disabled=true; }
    fetch('api/admin/generate-image', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prompt:p, aspectRatio:'4:3' }) }).then(function(r){ return r.json(); }).then(function(j){ if(btn){ btn.textContent=ot; btn.disabled=false; } if(j.imageUrl){ setField(name, j.imageUrl); toast('Image générée',true); } else { toast(j.error||'Échec',false); } }).catch(function(){ if(btn){ btn.textContent=ot; btn.disabled=false; } toast('Échec de génération',false); });
  }

  function openCreate(){ EDIT_ID=null; document.getElementById('modalTitle').textContent='Nouvelle entrée'; buildForm(null); showModal(); }
  function openEdit(id){ var it=ITEMS.filter(function(x){ return x.id===id; })[0]; if(!it) return; EDIT_ID=id; document.getElementById('modalTitle').textContent='Modifier l\'entrée'; buildForm(it); showModal(); }
  function showModal(){ document.getElementById('modal').classList.add('show'); }
  function closeModal(){ document.getElementById('modal').classList.remove('show'); }
  function save(){
    var form=document.getElementById('modalForm');
    var data={};
    FIELDS.forEach(function(f){ var el=form.querySelector("[name='"+f.name+"']"); if(!el) return; if(f.type==='boolean'){ data[f.name]=el.checked?1:0; } else { data[f.name]=el.value; } });
    var isEdit=!!EDIT_ID;
    var url='api/admin/'+MODULE+(EDIT_ID?('/'+EDIT_ID):'');
    var method=EDIT_ID?'PUT':'POST';
    var sbtn=document.getElementById('saveBtn'); var sot=sbtn?sbtn.textContent:''; if(sbtn){ sbtn.disabled=true; sbtn.textContent='…'; }
    api(url, { method:method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }).then(function(res){ if(sbtn){ sbtn.disabled=false; sbtn.textContent=sot; } if(res.ok){ closeModal(); toast(isEdit?'Entrée mise à jour ✓':'Entrée créée ✓', true); loadItems(); } else { toast((res.body && res.body.error) || 'Erreur', false); } });
  }
  function del(id){ if(!confirm('Supprimer cette entrée ? Cette action est irréversible.')) return; api('api/admin/'+MODULE+'/'+id, { method:'DELETE' }).then(function(res){ if(res.ok){ toast('Entrée supprimée', true); loadItems(); } else { toast((res.body && res.body.error) || 'Erreur', false); } }); }

  window.ADMIN={ openCreate:openCreate, closeModal:closeModal, save:save };
  document.addEventListener('DOMContentLoaded', load);
})();
