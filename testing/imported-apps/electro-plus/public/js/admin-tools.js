(function(){
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
async function request(url,options,t){
const controller=new AbortController(),timer=setTimeout(function(){controller.abort();},url.includes('generate-image')?120000:45000);
try{const response=await fetch(url,Object.assign({credentials:'same-origin',cache:'no-store'},options||{},{signal:controller.signal}));let data;try{data=await response.json();}catch(e){throw new Error(t.requestFailed);}if(!response.ok)throw new Error(data.error||t.requestFailed);return data;}catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw new Error(t.requestFailed);throw e;}finally{clearTimeout(timer);}
}
function button(text){const b=node('button',text,'small-button');b.type='button';return b;}
function feedback(el,text,kind){el.textContent=text;el.className='feedback'+(text?' feedback-'+(kind||'info'):'');}
function lock(container){const controls=Array.from(container.querySelectorAll('button,input,select,textarea'));const states=controls.map(function(el){return el.disabled;});controls.forEach(function(el){el.disabled=true;});container.setAttribute('aria-busy','true');return function(){controls.forEach(function(el,i){el.disabled=states[i];});container.removeAttribute('aria-busy');};}
function imageControls(container,input,t,onGenerated,spec){
const previewBox=node('div',undefined,'image-preview-box'),preview=node('img',undefined,'image-preview'),empty=node('span',t.imageMissing,'image-placeholder');preview.alt=spec.label;previewBox.append(preview,empty);container.appendChild(previewBox);
const actions=node('div',undefined,'image-actions'),uploadLabel=node('label',t.upload,'upload-label'),file=node('input');file.type='file';file.accept='image/jpeg,image/png,image/webp';file.id=input.id+'-file';uploadLabel.htmlFor=file.id;uploadLabel.appendChild(file);
const generate=button(t.generate),remove=button(t.removeImage);remove.classList.add('danger-outline');actions.append(uploadLabel,generate,remove);container.appendChild(actions);
const panel=node('div',undefined,'ai-panel');panel.hidden=true;panel.id=input.id+'-ai';generate.setAttribute('aria-controls',panel.id);generate.setAttribute('aria-expanded','false');
const promptLabel=node('label',t.imagePromptLabel),prompt=node('textarea');prompt.id=input.id+'-prompt';prompt.maxLength=1600;prompt.rows=3;promptLabel.htmlFor=prompt.id;prompt.placeholder=t.imagePrompt;const promptHelp=node('p',t.imagePrompt,'help'),promptActions=node('div',undefined,'image-actions'),start=button(t.generate),cancel=button(t.cancel);start.style.backgroundColor='#2858ef';start.style.color='#fff';promptActions.append(start,cancel);panel.append(promptLabel,prompt,promptHelp,promptActions);container.appendChild(panel);
const message=node('p','','image-message');message.setAttribute('role','status');container.appendChild(message);
function update(){const v=input.value.trim();if(/^https:\/\//.test(v)){preview.src=v;preview.hidden=false;empty.hidden=true;}else{preview.removeAttribute('src');preview.hidden=true;empty.hidden=false;}remove.disabled=!v;}
preview.addEventListener('error',function(){preview.hidden=true;empty.hidden=false;message.textContent=t.imagePreviewFailed;});
function changed(){input.dispatchEvent(new Event('input',{bubbles:true}));}
function setPanel(open){panel.hidden=!open;generate.setAttribute('aria-expanded',String(open));if(open)prompt.focus();else generate.focus();}
function busy(value){[file,generate,remove,input,prompt,start,cancel].forEach(function(el){el.disabled=value;});container.setAttribute('aria-busy',String(value));message.classList.toggle('is-working',value);if(value)message.textContent=t.working;container.dispatchEvent(new CustomEvent('admin-media-busy',{bubbles:true,detail:value}));if(!value)remove.disabled=!input.value;}
input.addEventListener('input',update);update();
remove.addEventListener('click',function(){input.value='';changed();message.textContent=t.imageRemoved;});
file.addEventListener('change',async function(){const chosen=file.files[0];if(!chosen)return;if(chosen.size>4194304||!['image/jpeg','image/png','image/webp'].includes(chosen.type)){message.textContent=t.badImage;file.value='';return;}busy(true);try{const data=await new Promise(function(resolve,reject){const reader=new FileReader();reader.onload=function(){resolve(reader.result);};reader.onerror=function(){reject(new Error(t.uploadFailed));};reader.readAsDataURL(chosen);});const result=await request('api/admin/upload-image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data})},t);input.value=result.imageUrl;changed();message.textContent=t.imageReady;}catch(e){message.textContent=e.message||t.uploadFailed;}finally{busy(false);file.value='';}});
generate.addEventListener('click',function(){setPanel(panel.hidden);});cancel.addEventListener('click',function(){setPanel(false);});
start.addEventListener('click',async function(){const text=prompt.value.trim();if(text.length<10||text.length>1600){message.textContent=t.promptLength;prompt.focus();return;}busy(true);try{const result=await request('api/admin/generate-image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:text,aspectRatio:spec.aspectRatio||'4:3'})},t);input.value=result.imageUrl;changed();message.textContent=(onGenerated&&onGenerated())||t.illustrationReady;panel.hidden=true;generate.setAttribute('aria-expanded','false');}catch(e){message.textContent=e.message||t.generationFailed;}finally{busy(false);}});
}
function field(spec,value,t,onGenerated){
const box=node('div',undefined,'admin-field'+(['textarea','image'].includes(spec.type)?' wide':'')+(spec.type==='boolean'?' toggle-field':''));const id='field-'+spec.name;
const label=node('label',spec.label+(spec.required?' · '+t.required:''));label.htmlFor=id;let input;
if(spec.type==='textarea')input=node('textarea');
else if(spec.type==='select'){input=node('select');if(spec.required){const empty=node('option','—');empty.value='';input.appendChild(empty);}spec.options.forEach(function(option,i){const o=node('option',spec.optionLabels?spec.optionLabels[i]:option);o.value=option;input.appendChild(o);});}
else{input=node('input');input.type=spec.type==='boolean'?'checkbox':spec.type==='image'?'text':['number','email','tel','url','date','datetime-local','color'].includes(spec.type)?spec.type:'text';}
input.id=id;input.name=spec.name;
if(spec.type==='boolean')input.checked=[true,1,'1'].includes(value);else input.value=value==null?'':value;
if(spec.type==='image'){input.inputMode='url';input.autocomplete='off';input.spellcheck=false;}if(spec.type==='number')input.inputMode='decimal';
if(spec.maxLength)input.maxLength=spec.maxLength;if(spec.required)input.required=true;if(spec.min!==undefined)input.min=spec.min;if(spec.max!==undefined)input.max=spec.max;if(spec.step!==undefined)input.step=spec.step;if(spec.placeholder)input.placeholder=spec.placeholder;
const help=node('p',spec.description||'','help');help.id=id+'-help';input.setAttribute('aria-describedby',help.id);
if(spec.type==='boolean'){const line=node('div',undefined,'checkbox-line');line.append(input,label);box.append(line,help);}else box.append(label,input,help);
if(spec.type==='image')imageControls(box,input,t,onGenerated,spec);
return {box,input};
}
window.AdminTools={node,request,button,field,imageControls,feedback,lock};
})();