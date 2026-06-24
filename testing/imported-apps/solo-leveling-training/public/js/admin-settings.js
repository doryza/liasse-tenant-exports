(function(){
  var FIELDS = window.__SETTINGS_FIELDS || [];
  var VALUES = {};
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function toast(msg, ok){
    var el=document.getElementById('adminToast');
    if(!el){ el=document.createElement('div'); el.id='adminToast'; el.className='admin-toast'; document.body.appendChild(el); }
    el.style.borderColor=(ok===false)?'#f87171':'#22d3ee';
    el.textContent=msg; el.classList.add('show');
    clearTimeout(el._t); el._t=setTimeout(function(){ el.classList.remove('show'); }, 2800);
  }
  function load(){ fetch('api/admin/settings').then(function(r){ return r.json(); }).then(function(j){ VALUES=(j&&j.settings)||{}; render(); }).catch(function(){ VALUES={}; render(); }); }
  function render(){
    var form=document.getElementById('settingsForm'); if(!form) return;
    var h='';
    FIELDS.forEach(function(f){
      var val=VALUES[f.name]!=null?VALUES[f.name]:'';
      h+="<div class='fld'>";
      h+="<label>"+esc(f.label)+"</label>";
      if(f.type==='textarea'){ h+="<textarea name='"+f.name+"' rows='4'>"+esc(val)+"</textarea>"; }
      else if(f.type==='image'){ h+="<div class='img-fld'><input type='text' name='"+f.name+"' value='"+esc(val)+"' placeholder='URL de l’image'><div class='img-actions'><button type='button' class='abtn abtn-sm' data-upload='"+f.name+"'>Téléverser</button><button type='button' class='abtn abtn-sm' data-ai='"+f.name+"'>Générer (IA)</button></div><img class='img-prev' data-prev='"+f.name+"' src='"+esc(val)+"' "+(val?'':"style='display:none'")+"></div>"; }
      else { h+="<input type='"+(f.type==='email'?'email':'text')+"' name='"+f.name+"' value='"+esc(val)+"'>"; }
      if(f.hint){ h+="<small class='hint'>"+esc(f.hint)+"</small>"; }
      h+="</div>";
    });
    h+="<div style='display:flex;gap:.6rem;margin-top:.6rem'><button type='submit' class='abtn abtn-primary'>Enregistrer les réglages</button></div>";
    form.innerHTML=h;
    form.querySelectorAll('[data-upload]').forEach(function(b){ b.addEventListener('click', function(e){ e.preventDefault(); doUpload(b.getAttribute('data-upload')); }); });
    form.querySelectorAll('[data-ai]').forEach(function(b){ b.addEventListener('click', function(e){ e.preventDefault(); doAI(b.getAttribute('data-ai')); }); });
    form.querySelectorAll("input[type=text]").forEach(function(inp){ var p=form.querySelector("[data-prev='"+inp.name+"']"); if(p){ inp.addEventListener('input', function(){ p.src=inp.value; p.style.display=inp.value?'block':'none'; }); } });
    form.addEventListener('submit', save);
  }
  function setField(name, url){ var f=document.getElementById('settingsForm'); var inp=f.querySelector("[name='"+name+"']"); if(inp) inp.value=url; var p=f.querySelector("[data-prev='"+name+"']"); if(p){ p.src=url; p.style.display='block'; } }
  function doUpload(name){
    var inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
    inp.onchange=function(){ var file=inp.files[0]; if(!file) return; var rd=new FileReader(); rd.onload=function(){ var btn=document.querySelector("[data-upload='"+name+"']"); var ot=btn?btn.textContent:''; if(btn){ btn.textContent='…'; btn.disabled=true; } fetch('api/admin/upload', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ dataUri: rd.result }) }).then(function(r){ return r.json(); }).then(function(j){ if(btn){ btn.textContent=ot; btn.disabled=false; } if(j.url){ setField(name, j.url); toast('Image téléversée',true); } else { toast(j.error||'Échec',false); } }).catch(function(){ if(btn){ btn.textContent=ot; btn.disabled=false; } toast('Échec du téléversement',false); }); }; rd.readAsDataURL(file); };
    inp.click();
  }
  function doAI(name){
    var p=prompt("Décris l'image à générer :"); if(!p) return;
    var ar=(name.indexOf('hero')>=0)?'16:9':'4:3';
    var btn=document.querySelector("[data-ai='"+name+"']"); var ot=btn?btn.textContent:''; if(btn){ btn.textContent='…'; btn.disabled=true; }
    fetch('api/admin/generate-image', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prompt:p, aspectRatio:ar }) }).then(function(r){ return r.json(); }).then(function(j){ if(btn){ btn.textContent=ot; btn.disabled=false; } if(j.imageUrl){ setField(name, j.imageUrl); toast('Image générée',true); } else { toast(j.error||'Échec',false); } }).catch(function(){ if(btn){ btn.textContent=ot; btn.disabled=false; } toast('Échec de génération',false); });
  }
  function save(e){
    e.preventDefault();
    var form=document.getElementById('settingsForm');
    var btn=form.querySelector("button[type=submit]"); var ot=btn?btn.textContent:''; if(btn){ btn.disabled=true; btn.textContent='Enregistrement…'; }
    var tasks=[];
    FIELDS.forEach(function(f){ var el=form.querySelector("[name='"+f.name+"']"); if(el){ tasks.push(fetch('api/admin/settings',{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ key:f.name, value:el.value }) })); } });
    Promise.all(tasks).then(function(){ if(btn){ btn.disabled=false; btn.textContent=ot; } toast('Réglages enregistrés ✓',true); }).catch(function(){ if(btn){ btn.disabled=false; btn.textContent=ot; } toast('Erreur lors de l’enregistrement',false); });
  }
  document.addEventListener('DOMContentLoaded', load);
})();
