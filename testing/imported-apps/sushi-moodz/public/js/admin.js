(function(){
  var fields=[], items=[], editId=null, filterField=null;
  var API='api/admin/';
  var tbody=document.getElementById('tbody'), thead=document.getElementById('thead');
  var modal=document.getElementById('modal'), mForm=document.getElementById('mForm'), mTitle=document.getElementById('modalTitle');
  var searchEl=document.getElementById('search'), filterEl=document.getElementById('filter'), countEl=document.getElementById('count');
  function esc(s){ s=(s==null?'':String(s)); return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function toast(m,ok){ var t=document.getElementById('toast'); t.textContent=m; t.className='a-toast show '+(ok?'ok':'err'); setTimeout(function(){ t.className='a-toast'; },2600); }
  var ahb=document.getElementById('ahb'); if(ahb) ahb.addEventListener('click',function(){ document.body.classList.toggle('sb-open'); });

  function colFields(){ var cols=fields.filter(function(f){ return ['text','number','select','boolean','date'].indexOf(f.type)>=0; }); var picked=cols.slice(0,4); if(filterField && picked.indexOf(filterField)<0){ picked=picked.slice(0,3); picked.push(filterField); } return picked; }
  function labelOf(f){ return f.label||f.name; }
  function desc(f){ return f.description?'<small class="a-desc">'+esc(f.description)+'</small>':''; }
  function optLabel(f,v){ if(!f||!f.options) return v; for(var i=0;i<f.options.length;i++){ var op=f.options[i]; var ov=(typeof op==='object')?op.value:op; if(String(ov)===String(v)) return (typeof op==='object')?op.label:op; } return v; }

  async function load(){
    try{
      var m=await (await fetch(API+'modules')).json();
      var mod=(m.modules||[]).filter(function(x){ return x.key===MODULE_KEY; })[0];
      fields=mod?mod.fields:[];
      filterField=fields.filter(function(f){ return f.type==='select' && f.options && f.options.length; })[0]||null;
      buildFilter();
      var d=await (await fetch(API+MODULE_KEY)).json();
      items=d[MODULE_KEY]||[];
      render();
    }catch(e){ tbody.innerHTML='<tr><td class="a-empty">Erreur de chargement. Rechargez la page.</td></tr>'; }
  }
  function buildFilter(){
    if(!filterEl) return;
    if(!filterField){ filterEl.style.display='none'; return; }
    var o='<option value="">Tous — '+esc(labelOf(filterField))+'</option>';
    filterField.options.forEach(function(op){ var ov=(typeof op==='object')?op.value:op; var ol=(typeof op==='object')?op.label:op; o+='<option value="'+esc(ov)+'">'+esc(ol)+'</option>'; });
    filterEl.innerHTML=o; filterEl.style.display='';
  }
  function render(){
    var cf=colFields(), imgF=fields.filter(function(f){ return f.type==='image'; })[0];
    var h='<tr>'; if(imgF) h+='<th></th>'; cf.forEach(function(f){ h+='<th>'+esc(labelOf(f))+'</th>'; }); h+='<th class="a-actions">Actions</th></tr>'; thead.innerHTML=h;
    var q=(searchEl.value||'').toLowerCase();
    var fv=(filterEl && filterField)?filterEl.value:'';
    var list=items.filter(function(it){ if(q && JSON.stringify(it).toLowerCase().indexOf(q)<0) return false; if(fv && String(it[filterField.name])!==fv) return false; return true; });
    if(countEl) countEl.textContent=list.length+' / '+items.length;
    if(!list.length){ tbody.innerHTML='<tr><td colspan="9" class="a-empty">'+(items.length?'Aucun résultat pour ce filtre.':'Aucun élément. Cliquez « + Nouveau » pour commencer.')+'</td></tr>'; return; }
    tbody.innerHTML=list.map(function(it){
      var r='<tr>';
      if(imgF){ var u=it[imgF.name]; r+='<td>'+(u?'<img class="a-thumb" src="'+esc(u)+'">':'<span class="a-noimg">—</span>')+'</td>'; }
      cf.forEach(function(f){ var v=it[f.name]; var cell;
        if(f.type==='boolean'){ var on=(v==1||v===true); cell='<span class="a-badge '+(on?'ok':'no')+'">'+(on?'Oui':'Non')+'</span>'; }
        else if(f.name==='status'){ var st=String(v||''); var cls=st==='confirmée'?'ok':(st==='annulée'?'no':'new'); cell='<span class="a-badge '+cls+'">'+esc(optLabel(f,st)||st)+'</span>'; }
        else if(f.type==='select'){ cell=esc(optLabel(f,v)); }
        else { cell=esc(v); }
        r+='<td>'+cell+'</td>'; });
      r+='<td class="a-actions"><button class="a-btn sm" data-edit="'+it.id+'">Modifier</button> <button class="a-btn sm danger" data-del="'+it.id+'">Suppr.</button></td></tr>';
      return r;
    }).join('');
  }
  searchEl.addEventListener('input',render);
  if(filterEl) filterEl.addEventListener('change',render);
  tbody.addEventListener('click',function(e){ var ed=e.target.getAttribute('data-edit'), dl=e.target.getAttribute('data-del'); if(ed) openEdit(ed); if(dl) del(dl); });

  function fieldHtml(f,val){
    var name=f.name, lab=esc(labelOf(f))+(f.required?' *':''), v=(val==null?'':val);
    if(f.type==='textarea') return '<label class="a-field"><span>'+lab+'</span><textarea name="'+name+'" rows="4" placeholder="'+esc(f.placeholder||'')+'">'+esc(v)+'</textarea>'+desc(f)+'</label>';
    if(f.type==='boolean') return '<label class="a-check"><input type="checkbox" name="'+name+'" '+((v==1||v===true)?'checked':'')+'> <span>'+lab+'</span></label>'+(f.description?'<small class="a-desc">'+esc(f.description)+'</small>':'');
    if(f.type==='select'){ var o=(f.options||[]).map(function(op){ var ov=(typeof op==='object')?op.value:op; var ol=(typeof op==='object')?op.label:op; return '<option value="'+esc(ov)+'" '+(String(v)===String(ov)?'selected':'')+'>'+esc(ol)+'</option>'; }).join(''); return '<label class="a-field"><span>'+lab+'</span><select name="'+name+'"><option value="">—</option>'+o+'</select>'+desc(f)+'</label>'; }
    if(f.type==='number') return '<label class="a-field"><span>'+lab+'</span><input type="number" step="'+(f.step||'any')+'" name="'+name+'" value="'+esc(v)+'" placeholder="'+esc(f.placeholder||'')+'">'+desc(f)+'</label>';
    if(f.type==='date') return '<label class="a-field"><span>'+lab+'</span><input type="date" name="'+name+'" value="'+esc(v)+'">'+desc(f)+'</label>';
    if(f.type==='image') return '<label class="a-field"><span>'+lab+'</span><input type="text" name="'+name+'" value="'+esc(v)+'" placeholder="URL de l’image"><div class="a-imgtools"><button type="button" class="a-btn sm" data-up="'+name+'">Téléverser</button><button type="button" class="a-btn sm" data-ai="'+name+'">Générer (IA)</button></div><div class="a-imgprev">'+(v?'<img src="'+esc(v)+'">':'')+'</div><input type="file" accept="image/*" style="display:none" data-file="'+name+'">'+desc(f)+'</label>';
    return '<label class="a-field"><span>'+lab+'</span><input type="text" name="'+name+'" value="'+esc(v)+'" placeholder="'+esc(f.placeholder||'')+'">'+desc(f)+'</label>';
  }
  function buildForm(item){
    mForm.innerHTML=fields.map(function(f){ return fieldHtml(f,item?item[f.name]:(f.default!=null?f.default:'')); }).join('');
    mForm.querySelectorAll('[data-up]').forEach(function(b){ b.addEventListener('click',function(){ var fi=mForm.querySelector('[data-file="'+b.getAttribute('data-up')+'"]'); if(fi) fi.click(); }); });
    mForm.querySelectorAll('[data-file]').forEach(function(inp){ inp.addEventListener('change',function(){ uploadFile(inp); }); });
    mForm.querySelectorAll('[data-ai]').forEach(function(b){ b.addEventListener('click',function(){ genAI(b.getAttribute('data-ai')); }); });
  }
  function setImg(name,url){ var i=mForm.querySelector('[name="'+name+'"]'); if(i){ i.value=url; var p=i.parentNode.querySelector('.a-imgprev'); if(p) p.innerHTML='<img src="'+esc(url)+'">'; } }
  async function uploadFile(inp){
    var f=inp.files[0]; if(!f) return; var name=inp.getAttribute('data-file');
    var rd=new FileReader(); rd.onload=async function(){ toast('Téléversement…',true); try{ var r=await fetch(API+'upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dataUri:rd.result})}); var j=await r.json(); if(j.url){ setImg(name,j.url); toast('Image téléversée',true); } else toast(j.error||'Échec',false); }catch(e){ toast('Échec du téléversement',false); } }; rd.readAsDataURL(f);
  }
  async function genAI(name){
    var p=prompt('Décrivez l’image à générer :'); if(!p) return; toast('Génération…',true);
    try{ var r=await fetch(API+'generate-image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:p,aspectRatio:'4:3'})}); var j=await r.json(); if(j.url){ setImg(name,j.url); toast('Image générée',true); } else toast(j.error||'Échec',false); }catch(e){ toast('Échec de la génération',false); }
  }
  function openCreate(){ editId=null; mTitle.textContent='Nouveau · '+MODULE_LABEL; buildForm(null); modal.classList.add('open'); }
  function openEdit(id){ editId=id; var it=items.filter(function(x){ return String(x.id)===String(id); })[0]; mTitle.textContent='Modifier · '+MODULE_LABEL; buildForm(it); modal.classList.add('open'); }
  function close(){ modal.classList.remove('open'); }
  document.getElementById('btnNew').addEventListener('click',openCreate);
  document.getElementById('mClose').addEventListener('click',close);
  document.getElementById('mCancel').addEventListener('click',close);
  document.getElementById('mSave').addEventListener('click',save);
  modal.addEventListener('click',function(e){ if(e.target===modal) close(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && modal.classList.contains('open')) close(); });
  async function save(){
    var data={};
    fields.forEach(function(f){ var el=mForm.querySelector('[name="'+f.name+'"]'); if(!el) return; data[f.name]=(f.type==='boolean')?(el.checked?1:0):el.value; });
    var sb=document.getElementById('mSave'); sb.disabled=true;
    try{
      var url=API+MODULE_KEY+(editId?('/'+editId):''), method=editId?'PUT':'POST';
      var r=await fetch(url,{method:method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      var j=await r.json();
      if(r.ok){ close(); toast('Enregistré',true); load(); } else toast(j.error||'Échec',false);
    }catch(e){ toast('Erreur',false); }
    sb.disabled=false;
  }
  async function del(id){ if(!confirm('Supprimer cet élément ? Cette action est définitive.')) return; try{ var r=await fetch(API+MODULE_KEY+'/'+id,{method:'DELETE'}); if(r.ok){ toast('Supprimé',true); load(); } else toast('Échec',false); }catch(e){ toast('Erreur',false); } }
  load();
})();
