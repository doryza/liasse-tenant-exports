(function(){
const boot=document.getElementById('editor-data');if(!boot)return;
const data=JSON.parse(boot.textContent),t=data.t,items=data.items;
const prefix='liasse-lab:'+new URL(document.baseURI).pathname,storageKey=prefix+':content:v1',draftKey=prefix+':draft:v1';
const fields=document.getElementById('local-fields'),preview=document.getElementById('local-preview-content'),status=document.getElementById('local-status'),error=document.getElementById('local-error');
const allowed=['title','title_en','content','content_en'];let group='home',draft=Object.create(null),dirty=false,draftWritable=true;
function read(storage,key){try{const value=JSON.parse(storage.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch(e){return {};}}
function populate(){let saved={};try{saved=read(localStorage,storageKey);}catch(e){}items.forEach(item=>{draft[item.content_key]={};allowed.forEach(field=>draft[item.content_key][field]=Object.prototype.hasOwnProperty.call(saved,item.content_key)&&saved[item.content_key]&&typeof saved[item.content_key][field]==='string'?saved[item.content_key][field]:item[field]||'');});}
populate();
try{const staged=read(sessionStorage,draftKey);if(staged.values){items.forEach(item=>{allowed.forEach(field=>{if(staged.values[item.content_key]&&typeof staged.values[item.content_key][field]==='string')draft[item.content_key][field]=staged.values[item.content_key][field];});});group=staged.group==='about'?'about':'home';dirty=!!staged.dirty;}}catch(e){}
function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
function keepDraft(){try{sessionStorage.setItem(draftKey,JSON.stringify({group,values:draft,dirty}));draftWritable=true;}catch(e){draftWritable=false;error.textContent=t.draftError;}}
function renderPreview(){preview.replaceChildren();const rows=items.filter(item=>item.page===group);if(!rows.length){preview.append(element('p',t.noLocalItems));return;}rows.forEach(item=>{const value=draft[item.content_key],article=element('article');const title=value[data.lang==='en'?'title_en':'title'];if(title)article.append(element('h3',title));article.append(element('p',value[data.lang==='en'?'content_en':'content']));preview.append(article);});}
function renderFields(){
fields.replaceChildren();document.querySelectorAll('[data-editor-group]').forEach(button=>{const selected=button.dataset.editorGroup===group;button.setAttribute('aria-pressed',String(selected));button.style.backgroundColor=selected?'var(--admin-brand,#2858ef)':'#fff';button.style.color=selected?'#fff':'#17233b';});
const rows=items.filter(item=>item.page===group);document.getElementById('save-local').disabled=!items.length;
if(!rows.length){fields.append(element('p',t.noLocalItems));const link=element('a',t.add);link.href='admin/lab_content?new=1';fields.append(link);}
rows.forEach(item=>{
const set=element('fieldset',undefined,'translation-row'),legend=element('legend',(data.lang==='en'?item.title_en:item.title)||t.note);set.append(legend);const pair=element('div',undefined,'language-fields');
['fr','en'].forEach(lang=>{const column=element('div',undefined,'editor-language');column.append(element('h3',lang==='fr'?t.frLabel:t.enLabel));['title','content'].forEach(base=>{const field=base+(lang==='en'?'_en':'');const label=element('label'),span=element('span',base==='title'?t.titleField:t.bodyField),input=element(base==='title'?'input':'textarea');if(base==='title')input.type='text';else input.rows=4;input.maxLength=base==='title'?200:6000;input.value=draft[item.content_key][field];input.lang=lang;input.dataset.item=item.content_key;input.dataset.field=field;input.id='local-'+item.id+'-'+field;label.htmlFor=input.id;label.append(span,input);column.append(label);});pair.append(column);});set.append(pair);fields.append(set);
});renderPreview();
}
fields.addEventListener('input',function(event){const input=event.target;if(!input.dataset.item)return;draft[input.dataset.item][input.dataset.field]=input.value;dirty=true;status.textContent=t.unsavedChanges;error.textContent='';keepDraft();renderPreview();});
document.querySelectorAll('[data-editor-group]').forEach(button=>button.addEventListener('click',function(){group=button.dataset.editorGroup;keepDraft();renderFields();}));
document.getElementById('save-local').addEventListener('click',function(){
error.textContent='';status.textContent='';const invalid=items.find(item=>item.area==='intro'&&(!draft[item.content_key].title.trim()||!draft[item.content_key].title_en.trim()));
if(invalid){group=invalid.page;renderFields();error.textContent=t.invalid;const field=!draft[invalid.content_key].title.trim()?'title':'title_en';const input=Array.from(fields.querySelectorAll('[data-item][data-field]')).find(el=>el.dataset.item===invalid.content_key&&el.dataset.field===field);if(input)input.focus();return;}
try{localStorage.setItem(storageKey,JSON.stringify(draft));dirty=false;keepDraft();status.textContent=t.savedLocal;if(draftWritable)error.textContent='';}catch(e){error.textContent=t.storageError;}
});
document.getElementById('reset-local').addEventListener('click',function(){if(!window.confirm(t.resetQuestion))return;try{localStorage.removeItem(storageKey);sessionStorage.removeItem(draftKey);draft=Object.create(null);dirty=false;populate();renderFields();error.textContent='';status.textContent=t.resetDone;}catch(e){error.textContent=t.storageError;}});
document.addEventListener('click',function(event){const link=event.target.closest('a');if(!link||link.target==='_blank')return;keepDraft();if(dirty&&!draftWritable&&!window.confirm(t.discardQuestion))event.preventDefault();});
window.addEventListener('beforeunload',function(event){if(dirty&&!draftWritable){event.preventDefault();event.returnValue='';}});
keepDraft();renderFields();if(dirty)status.textContent=t.unsavedChanges;
})();