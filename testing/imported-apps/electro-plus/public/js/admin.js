(function(){
const root=document.getElementById('admin-data');if(!root||!window.AdminTools)return;
const data=JSON.parse(root.textContent),t=data.t,def=data.module,A=window.AdminTools,isProducts=def.key==='products';
let items=Array.isArray(data.items)?data.items:[],page=1,editingId=null,deletingId=null,dirty=false,saving=false,mediaCount=0,deleting=false;
const rows=document.getElementById('admin-rows'),search=document.getElementById('admin-search'),sort=document.getElementById('admin-sort'),filter=document.getElementById('admin-state-filter'),category=document.getElementById('admin-category-filter'),status=document.getElementById('admin-status'),dialog=document.getElementById('editor-dialog'),form=document.getElementById('editor-form'),fields=document.getElementById('editor-fields'),error=document.getElementById('editor-error'),save=document.getElementById('editor-save'),deletion=document.getElementById('delete-dialog'),inputs={};
const locale=data.lang==='en'?'en-CA':'fr-CA';
function title(item){return (data.lang==='en'?item.title_en:item.title)||item.title||t.record;}
function flag(v){return v===1||v==='1'||v===true;}
function announce(text,kind){A.feedback(status,text,kind||'success');}
function setDirty(value){dirty=value;document.getElementById('editor-dirty').textContent=value?t.unsaved:'';}
function badge(text,kind){return A.node('span',text,'status-label status-'+kind);}
function render(){
const q=search.value.trim().toLocaleLowerCase(data.lang);
const list=items.filter(function(item){const matches=[item.title,item.title_en,item.brand,item.model,item.category,t[item.category]].join(' ').toLocaleLowerCase(data.lang).includes(q);const state=filter.value;return matches&&(!category||!category.value||item.category===category.value)&&(!state||(state==='draft'&&!flag(item.published))||(state==='published'&&flag(item.published))||(state==='example'&&flag(item.is_example))||(state==='real'&&!flag(item.is_example)));});
list.sort(function(a,b){return sort.value==='title'?title(a).localeCompare(title(b),data.lang):sort.value==='oldest'?new Date(a.updated_at)-new Date(b.updated_at)||Number(a.id)-Number(b.id):new Date(b.updated_at)-new Date(a.updated_at)||Number(b.id)-Number(a.id);});
const pages=Math.max(1,Math.ceil(list.length/10));page=Math.min(Math.max(1,page),pages);rows.replaceChildren();
if(!list.length){const tr=A.node('tr'),td=A.node('td',undefined,'empty-cell'),box=A.node('div',undefined,'admin-empty');td.colSpan=isProducts?5:4;box.appendChild(A.node('p',items.length?t.noAdminMatch:t.emptyAdmin));const action=A.button(items.length?t.clearAdminFilters:(isProducts?t.createProduct:t.createPost));action.addEventListener('click',function(){if(items.length)resetFilters();else openEditor(null);});box.appendChild(action);td.appendChild(box);tr.appendChild(td);rows.appendChild(tr);}
list.slice((page-1)*10,page*10).forEach(function(item){
const tr=A.node('tr'),identity=A.node('td'),identityBox=A.node('div',undefined,'record-identity'),thumb=A.node('div',undefined,'record-thumb');
if(/^https:\/\//.test(item.image_url||'')){const img=A.node('img');img.src=item.image_url;img.alt='';img.loading='lazy';img.addEventListener('error',function(){img.remove();thumb.textContent='—';thumb.title=t.imageMissing;});thumb.appendChild(img);}else{thumb.textContent='—';thumb.title=t.imageMissing;}
const text=A.node('div'),name=A.button(title(item));name.className='record-name';name.dataset.edit=item.id;name.setAttribute('aria-label',t.edit+' : '+title(item));text.appendChild(name);
const info=isProducts?[t[item.category]||item.category,item.brand,item.model].filter(Boolean).join(' · '):item.category;
if(info)text.appendChild(A.node('span',info,'record-meta'));identityBox.append(thumb,text);identity.appendChild(identityBox);tr.appendChild(identity);
if(isProducts){const price=A.node('td',flag(item.is_example)?'—':item.price===null||item.price===''?t.priceNotSet:new Intl.NumberFormat(locale,{style:'currency',currency:'CAD'}).format(Number(item.price)),'price-cell');price.dataset.label=t.priceColumn;tr.appendChild(price);}
const stateCell=A.node('td'),badges=A.node('div',undefined,'badge-stack');stateCell.dataset.label=t.statusColumn;
badges.appendChild(badge(!flag(item.published)?t.draft:isProducts?t.published:t.readyNote,!flag(item.published)?'draft':'live'));
if(isProducts){badges.appendChild(badge(flag(item.is_example)?t.exampleStatus:flag(item.verified)?t.verifiedStatus:t.needsReview,flag(item.is_example)?'example':flag(item.verified)?'live':'draft'));if(flag(item.featured))badges.appendChild(badge(t.featuredBadge,'info'));}else badges.appendChild(badge(t.noPublicBlog,'info'));
stateCell.appendChild(badges);const updated=A.node('td',new Date(item.updated_at).toLocaleDateString(locale));updated.dataset.label=t.updatedColumn;
const actions=A.node('td',undefined,'row-actions'),edit=A.button(t.edit),remove=A.button(t.remove);edit.dataset.edit=item.id;remove.dataset.delete=item.id;remove.classList.add('danger-outline');edit.setAttribute('aria-label',t.edit+' : '+title(item));remove.setAttribute('aria-label',t.remove+' : '+title(item));actions.append(edit,remove);tr.append(stateCell,updated,actions);rows.appendChild(tr);
});
document.getElementById('admin-page').textContent=t.page+' '+page+' '+t.of+' '+pages;
document.getElementById('admin-count').textContent=list.length+' '+t.matches+' / '+items.length+' '+t.recordsCount;
document.getElementById('admin-prev').disabled=page<=1;document.getElementById('admin-next').disabled=page>=pages;
document.getElementById('admin-reset').hidden=!search.value&&!filter.value&&(!category||!category.value);
}
function resetFilters(){search.value='';filter.value='';if(category)category.value='';page=1;render();search.focus();}
async function refresh(){const result=await A.request('api/admin/'+def.key,{},t);if(!Array.isArray(result[def.key]))throw new Error(t.requestFailed);items=result[def.key];render();}
function openEditor(id){
const item=id?items.find(function(i){return Number(i.id)===Number(id);}):{};if(!item){announce(t.notFound,'error');return;}
editingId=id;fields.replaceChildren();Object.keys(inputs).forEach(function(k){delete inputs[k];});error.textContent='';mediaCount=0;setDirty(false);document.getElementById('editor-title').textContent=id?t.editRecord:(isProducts?t.createProduct:t.createPost);
const groups={};def.fields.forEach(function(f){const group=f.group||'groupIdentity';if(!groups[group]){const section=A.node('fieldset',undefined,'editor-section'),legend=A.node('legend',t[group]||t.record),grid=A.node('div',undefined,'admin-fields');section.append(legend,grid);fields.appendChild(section);groups[group]=grid;}
const value=item[f.name]===undefined?(f.type==='boolean'?!!f.default:''):item[f.name];const result=A.field(f,value,t,function(){if(isProducts){inputs.verified.checked=false;inputs.is_example.checked=true;inputs.published.checked=false;inputs.price.value='';if(inputs.featured)inputs.featured.checked=false;setDirty(true);return t.imageGenerated;}return t.illustrationReady;});inputs[f.name]=result.input;groups[group].appendChild(result.box);});
if(isProducts&&groups.groupPublication)groups.groupPublication.appendChild(A.node('p',t.publicationHelp,'help wide'));
dialog.showModal();const first=fields.querySelector('input,textarea,select');if(first)first.focus();
}
function closeEditor(){if(saving||mediaCount){error.textContent=t.mediaBusy;return;}if(dirty&&!window.confirm(t.unsavedExit))return;setDirty(false);dialog.close();document.getElementById('admin-add').focus();}
dialog.addEventListener('cancel',function(e){e.preventDefault();closeEditor();});
form.addEventListener('input',function(){setDirty(true);});form.addEventListener('change',function(){setDirty(true);});
form.addEventListener('admin-media-busy',function(e){mediaCount=Math.max(0,mediaCount+(e.detail?1:-1));save.disabled=saving||mediaCount>0;});
window.addEventListener('beforeunload',function(e){if(dirty||saving||mediaCount){e.preventDefault();e.returnValue='';}});
document.getElementById('admin-add').addEventListener('click',function(){openEditor(null);});
document.getElementById('admin-refresh').addEventListener('click',async function(){const b=this;b.disabled=true;announce(t.loading,'info');try{await refresh();announce(t.refreshDone);}catch(err){announce(err.message,'error');}finally{b.disabled=false;}});
search.addEventListener('input',function(){page=1;render();});[sort,filter,category].filter(Boolean).forEach(function(el){el.addEventListener('change',function(){page=1;render();});});document.getElementById('admin-reset').addEventListener('click',resetFilters);
document.getElementById('admin-prev').addEventListener('click',function(){page--;render();});document.getElementById('admin-next').addEventListener('click',function(){page++;render();});
rows.addEventListener('click',function(e){const edit=e.target.closest('[data-edit]'),remove=e.target.closest('[data-delete]');if(edit)openEditor(Number(edit.dataset.edit));if(remove){deletingId=Number(remove.dataset.delete);const item=items.find(function(i){return Number(i.id)===deletingId;});document.getElementById('delete-name').textContent=item?title(item):'';document.getElementById('delete-error').textContent='';deletion.showModal();document.getElementById('delete-cancel').focus();}});
document.querySelectorAll('[data-close-dialog]').forEach(function(b){b.addEventListener('click',closeEditor);});
form.addEventListener('submit',async function(e){
e.preventDefault();if(saving||mediaCount)return;error.textContent='';const payload={};def.fields.forEach(function(f){payload[f.name]=f.type==='boolean'?inputs[f.name].checked:inputs[f.name].value;});
if(isProducts&&payload.is_example&&(payload.price!==''||payload.verified)){error.textContent=t.examplePrice;error.focus();return;}
saving=true;const unlock=A.lock(form);save.textContent=t.saving;
try{const wasEditing=!!editingId;const result=await A.request('api/admin/'+def.key+(editingId?'/'+editingId:''),{method:editingId?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)},t);const item=result[isProducts?'product':'post'];if(!item||!item.id)throw new Error(t.requestFailed);items=items.filter(function(i){return Number(i.id)!==Number(item.id);});items.unshift(item);setDirty(false);page=1;render();dialog.close();document.getElementById('admin-add').focus();announce(wasEditing?t.saved:t.created);try{await refresh();}catch(err){announce(t.refreshWarning,'warning');}
}catch(err){error.textContent=err.message;error.focus();}finally{saving=false;unlock();save.textContent=t.save;save.disabled=mediaCount>0;}
});
delectionSetup();
function delectionSetup(){deletion.addEventListener('cancel',function(e){if(deleting)e.preventDefault();});document.getElementById('delete-cancel').addEventListener('click',function(){if(!deleting)deletion.close();});document.getElementById('delete-confirm').addEventListener('click',async function(){if(deleting)return;deleting=true;const b=this,unlock=A.lock(deletion);b.textContent=t.working;try{await A.request('api/admin/'+def.key+'/'+deletingId,{method:'DELETE'},t);items=items.filter(function(i){return Number(i.id)!==deletingId;});render();deletion.close();document.getElementById('admin-add').focus();announce(t.deleted);try{await refresh();}catch(err){announce(t.refreshWarning,'warning');}}catch(err){document.getElementById('delete-error').textContent=err.message;}finally{deleting=false;unlock();b.textContent=t.deleteConfirm;}});}
render();const query=new URLSearchParams(location.search);if(query.get('new')==='1')openEditor(null);else if(/^\d+$/.test(query.get('edit')||''))openEditor(Number(query.get('edit')));
})();