(function(){
var cfg=window.ADMIN_CONFIG;if(!cfg){return;}
var base='api/admin/'+cfg.key;
var items=(cfg.items||[]).slice();
var listEl=document.getElementById('itemList');
var modal=document.getElementById('modal');
var form=document.getElementById('itemForm');
var titleEl=document.getElementById('modalTitle');
var fieldsWrap=document.getElementById('formFields');
var searchEl=document.getElementById('itemSearch');
var editingId=null;
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':'&gt;';});}
function escAttr(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':c==='"'?'&quot;':'&#39;';});}
function labelFor(f){return f.label||f.name;}
function money(v){var n=Number(v);if(isNaN(n)){return esc(v==null?'':v);}return n.toFixed(2).replace('.',',')+' $';}
var imgField=cfg.fields.filter(function(f){return f.type==='image';})[0];
var textFields=cfg.fields.filter(function(f){return ['text','textarea','url','number','select','date'].indexOf(f.type)>=0;}).slice(0,3);
var boolFields=cfg.fields.filter(function(f){return f.type==='boolean';});
function toast(msg,type){var el=document.createElement('div');el.className='toast '+(type==='err'?'toast-err':'toast-ok');el.textContent=msg;document.body.appendChild(el);requestAnimationFrame(function(){el.classList.add('show');});setTimeout(function(){el.classList.remove('show');setTimeout(function(){if(el.parentNode){el.parentNode.removeChild(el);}},320);},2600);}
function textCell(it,f){var v=it[f.name];if(f.name==='price'){return '<strong>'+money(v)+'</strong>';}var s=(v==null?'':String(v));if(s.length>70){s=s.slice(0,70)+'…';}return s?esc(s):'<span class="cell-empty">—</span>';}
function render(filter){
 if(!items.length){listEl.innerHTML='<div class="empty-state"><span class="emoji">🍽️</span>Aucun élément pour l’instant.<br>Cliquez sur « + Nouveau » pour en ajouter.</div>';return;}
 var arr=items;
 if(filter){var q=String(filter).toLowerCase();arr=items.filter(function(it){return JSON.stringify(it).toLowerCase().indexOf(q)>=0;});}
 if(!arr.length){listEl.innerHTML='<div class="empty-state"><span class="emoji">🔍</span>Aucun résultat pour cette recherche.</div>';return;}
 var h='<table class="atable"><thead><tr>';
 if(imgField){h+='<th class="th-img"></th>';}
 textFields.forEach(function(f){h+='<th>'+esc(labelFor(f))+'</th>';});
 if(boolFields.length){h+='<th>Statut</th>';}
 h+='<th class="th-act">Actions</th></tr></thead><tbody>';
 arr.forEach(function(it){
  h+='<tr>';
  if(imgField){var iv=it[imgField.name];h+='<td class="td-img">'+(iv?('<img class="thumb" src="'+escAttr(iv)+'" alt="">'):'<span class="thumb-empty">—</span>')+'</td>';}
  textFields.forEach(function(f){h+='<td>'+textCell(it,f)+'</td>';});
  if(boolFields.length){h+='<td class="td-status">';boolFields.forEach(function(f){var on=(it[f.name]==1||it[f.name]===true);h+='<span class="pill '+(on?'pill-on':'pill-off')+'">'+esc(labelFor(f))+'</span>';});h+='</td>';}
  h+='<td class="row-actions"><button class="btn-sm" data-edit="'+it.id+'">Modifier</button><button class="btn-del" data-del="'+it.id+'">Supprimer</button></td>';
  h+='</tr>';
 });
 h+='</tbody></table>';
 listEl.innerHTML=h;
}
function buildForm(data){
 data=data||{};
 var h='';
 cfg.fields.forEach(function(f){
  var id='fld_'+f.name;
  h+='<div class="fld">';
  if(f.type==='boolean'){
   h+='<label class="chk"><input type="checkbox" id="'+id+'" name="'+f.name+'"> '+esc(labelFor(f))+'</label>';
  }else{
   h+='<label for="'+id+'">'+esc(labelFor(f))+(f.required?' *':'')+'</label>';
   if(f.type==='textarea'){h+='<textarea id="'+id+'" name="'+f.name+'"'+(f.required?' required':'')+(f.placeholder?' placeholder="'+escAttr(f.placeholder)+'"':'')+'></textarea>';}
   else if(f.type==='select'){h+='<select id="'+id+'" name="'+f.name+'">';(f.options||[]).forEach(function(o){h+='<option>'+esc(o)+'</option>';});h+='</select>';}
   else if(f.type==='number'){h+='<input type="number" id="'+id+'" name="'+f.name+'"'+(f.min!=null?' min="'+f.min+'"':'')+(f.step!=null?' step="'+f.step+'"':'')+(f.required?' required':'')+(f.placeholder?' placeholder="'+escAttr(f.placeholder)+'"':'')+'>';}
   else if(f.type==='image'){h+='<div class="imgfld"><input type="text" id="'+id+'" name="'+f.name+'" placeholder="Collez une URL ou téléversez une image"><div class="imgbtns"><input type="file" accept="image/*" data-upload="'+f.name+'" style="display:none"><button type="button" class="btn-sm" data-uploadbtn="'+f.name+'">Téléverser</button><button type="button" class="btn-sm btn-ai" data-genimg="'+f.name+'">✦ Générer avec l’IA</button></div><img class="preview" data-preview="'+f.name+'" alt="" style="display:none"></div>';}
   else{h+='<input type="'+(f.type==='url'?'url':(f.type==='date'?'date':'text'))+'" id="'+id+'" name="'+f.name+'"'+(f.maxLength?' maxlength="'+f.maxLength+'"':'')+(f.required?' required':'')+(f.placeholder?' placeholder="'+escAttr(f.placeholder)+'"':'')+'>';}
  }
  if(f.description){h+='<span class="hint">'+esc(f.description)+'</span>';}
  h+='</div>';
 });
 fieldsWrap.innerHTML=h;
 cfg.fields.forEach(function(f){
  var el=form.querySelector('[name="'+f.name+'"]');
  if(!el){return;}
  var v=data[f.name];
  if(v==null){v=(f.default!==undefined?f.default:'');}
  if(f.type==='boolean'){el.checked=(v==1||v===true||v==='1'||v==='true');}
  else{el.value=(v==null?'':v);}
  if(f.type==='image'){var pv=form.querySelector('[data-preview="'+f.name+'"]');if(pv&&v){pv.src=v;pv.style.display='block';}}
 });
}
function openModal(){modal.classList.add('open');var first=fieldsWrap.querySelector('input,textarea,select');if(first){try{first.focus();}catch(e){}}}
function closeModal(){modal.classList.remove('open');}
function openCreate(){editingId=null;titleEl.textContent='Nouveau';buildForm({});openModal();}
function openEdit(id){editingId=id;var it=null;for(var i=0;i<items.length;i++){if(String(items[i].id)===String(id)){it=items[i];break;}}titleEl.textContent='Modifier';buildForm(it||{});openModal();}
function refreshList(){return fetch(base).then(function(r){return r.json();}).then(function(res){items=(res&&res[cfg.key])||[];render(searchEl?searchEl.value:'');}).catch(function(){});}
listEl.addEventListener('click',function(e){var t=e.target;var ed=t.getAttribute&&t.getAttribute('data-edit');var dl=t.getAttribute&&t.getAttribute('data-del');if(ed){openEdit(ed);}else if(dl){if(confirm('Supprimer cet élément ? Cette action est définitive.')){fetch(base+'/'+dl,{method:'DELETE'}).then(function(r){return r.json();}).then(function(res){if(res&&res.error){toast(res.error,'err');return;}toast('Élément supprimé','ok');refreshList();}).catch(function(){toast('Suppression impossible','err');});}}});
form.addEventListener('submit',function(e){e.preventDefault();var data={};cfg.fields.forEach(function(f){var el=form.querySelector('[name="'+f.name+'"]');if(!el){return;}data[f.name]=(f.type==='boolean')?(el.checked?1:0):el.value;});var method=editingId?'PUT':'POST';var url=editingId?(base+'/'+editingId):base;var saveBtn=form.querySelector('[type=submit]');var old=saveBtn?saveBtn.textContent:'';if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='…';}fetch(url,{method:method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(function(r){return r.json();}).then(function(res){if(saveBtn){saveBtn.disabled=false;saveBtn.textContent=old;}if(res&&res.error){toast(res.error,'err');return;}closeModal();toast(editingId?'Modifications enregistrées ✓':'Élément ajouté ✓','ok');refreshList();}).catch(function(){if(saveBtn){saveBtn.disabled=false;saveBtn.textContent=old;}toast('Enregistrement impossible','err');});});
form.addEventListener('click',function(e){var ub=e.target.getAttribute&&e.target.getAttribute('data-uploadbtn');var gi=e.target.getAttribute&&e.target.getAttribute('data-genimg');if(ub){var fi=form.querySelector('[data-upload="'+ub+'"]');if(fi){fi.click();}}else if(gi){var p=prompt('Décrivez l’image à générer :');if(p){var btn=e.target;var old=btn.textContent;btn.textContent='…';fetch('api/admin/generate-image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:p,aspectRatio:'4:3'})}).then(function(r){return r.json();}).then(function(res){btn.textContent=old;if(res&&res.imageUrl){var inp=form.querySelector('[name="'+gi+'"]');if(inp){inp.value=res.imageUrl;}var pv=form.querySelector('[data-preview="'+gi+'"]');if(pv){pv.src=res.imageUrl;pv.style.display='block';}toast('Image générée ✓','ok');}else{toast((res&&res.error)||'Génération impossible','err');}}).catch(function(){btn.textContent=old;toast('Génération impossible','err');});}}});
form.addEventListener('change',function(e){var uf=e.target.getAttribute&&e.target.getAttribute('data-upload');if(uf&&e.target.files&&e.target.files[0]){var fr=new FileReader();fr.onload=function(){fetch('api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dataUri:fr.result})}).then(function(r){return r.json();}).then(function(res){if(res&&res.url){var inp=form.querySelector('[name="'+uf+'"]');if(inp){inp.value=res.url;}var pv=form.querySelector('[data-preview="'+uf+'"]');if(pv){pv.src=res.url;pv.style.display='block';}toast('Image téléversée ✓','ok');}else{toast((res&&res.error)||'Téléversement impossible','err');}}).catch(function(){toast('Téléversement impossible','err');});};fr.readAsDataURL(e.target.files[0]);}});
var nb=document.getElementById('newBtn');if(nb){nb.addEventListener('click',openCreate);}
var cm=document.getElementById('closeModal');if(cm){cm.addEventListener('click',closeModal);}
var cancel=document.getElementById('cancelModal');if(cancel){cancel.addEventListener('click',closeModal);}
if(searchEl){searchEl.addEventListener('input',function(){render(searchEl.value);});}
modal.addEventListener('click',function(e){if(e.target===modal){closeModal();}});
render('');
})();
