/* global document, fetch, FormData */
'use strict';
async function send(url,method,data){const r=await fetch(url,{method,headers:{'Content-Type':'application/json','X-Requested-With':'plumbing-site'},body:JSON.stringify(data)});if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}
const request=document.querySelector('[data-request]');
if(request)request.addEventListener('submit',async e=>{e.preventDefault();const status=request.querySelector('.form-status'),button=request.querySelector('button'),x=Object.fromEntries(new FormData(request));x.consent=x.consent==='on';button.disabled=true;try{await send(request.action,'POST',x);status.textContent=request.dataset.success;request.reset();}catch(_){status.textContent=request.dataset.error;}finally{button.disabled=false;}});
const admin=document.querySelector('[data-admin-settings]');
if(admin)admin.addEventListener('submit',async e=>{e.preventDefault();const status=admin.querySelector('.form-status'),x=Object.fromEntries(new FormData(admin));admin.querySelectorAll('input[type=checkbox]').forEach(el=>x[el.name]=el.checked?'1':'0');try{await send(admin.action,'PUT',x);status.textContent='Enregistré.';}catch(_){status.textContent='Impossible d’enregistrer.';}});
document.querySelectorAll('[data-request-status]').forEach(el=>el.addEventListener('change',async()=>{const status=el.closest('article').querySelector('.form-status');try{await send('api/admin/requests/'+el.dataset.requestStatus,'PUT',{status:el.value});status.textContent='Enregistré.';}catch(_){status.textContent='Impossible d’enregistrer.';}}));
