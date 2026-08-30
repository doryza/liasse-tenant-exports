(function(){
  var BK=window.M360_BK||{};
  var root=document.getElementById('bkModule');
  if(!root) return;
  var state={ service:'', serviceName:'', date:'', time:'' };
  var panels=root.querySelectorAll('.bk-panel');
  var tabs=root.querySelectorAll('.step-tab');
  var n1=root.querySelector('#bkNext1'), n2=root.querySelector('#bkNext2'), b2=root.querySelector('#bkBack2'), b3=root.querySelector('#bkBack3'), sub=root.querySelector('#bkSubmit');
  var dateI=root.querySelector('#bkDate'), slotBox=root.querySelector('#bkSlots');
  function pad(n){ return (n<10?'0':'')+n; }
  function go(n){
    panels.forEach(function(p){ p.style.display=(p.getAttribute('data-step')===String(n))?'':'none'; });
    var suc=root.querySelector('#bkSuccess'); if(suc) suc.style.display='none';
    tabs.forEach(function(tb){ var tn=Number(tb.getAttribute('data-tab')); tb.classList.toggle('active', tn===n); tb.classList.toggle('done', tn<n); });
  }
  root.querySelectorAll('.bk-service').forEach(function(c){
    c.addEventListener('click', function(){
      root.querySelectorAll('.bk-service').forEach(function(x){ x.classList.remove('selected'); });
      c.classList.add('selected');
      state.service=c.getAttribute('data-id')||'';
      state.serviceName=c.getAttribute('data-name')||'';
      if(n1) n1.disabled=false;
    });
  });
  if(n1) n1.addEventListener('click', function(){ go(2); });
  if(b2) b2.addEventListener('click', function(){ go(1); });
  if(n2) n2.addEventListener('click', function(){ go(3); });
  if(b3) b3.addEventListener('click', function(){ go(2); });
  if(dateI){
    var td=new Date(); dateI.min=td.getFullYear()+'-'+pad(td.getMonth()+1)+'-'+pad(td.getDate());
    dateI.addEventListener('change', function(){ state.date=dateI.value; state.time=''; if(n2) n2.disabled=true; loadSlots(); });
  }
  function loadSlots(){
    if(!slotBox) return;
    if(!state.date){ slotBox.innerHTML=`<p class='bk-hint'>${BK.selectDateFirst||''}</p>`; return; }
    slotBox.innerHTML=`<p class='bk-hint'>${BK.loading||'...'}</p>`;
    fetch('api/availability?date='+encodeURIComponent(state.date)+(state.service?('&serviceId='+encodeURIComponent(state.service)):'')).then(function(r){ return r.json(); }).then(function(d){
      var slots=(d&&d.slots)||[];
      if(!slots.length){ slotBox.innerHTML=`<p class='bk-hint'>${BK.noSlots||''}</p>`; return; }
      slotBox.innerHTML='';
      slots.forEach(function(s){
        var btn=document.createElement('button'); btn.type='button'; btn.className='slot'; btn.textContent=s;
        btn.addEventListener('click', function(){ slotBox.querySelectorAll('.slot').forEach(function(x){ x.classList.remove('selected'); }); btn.classList.add('selected'); state.time=s; if(n2) n2.disabled=false; });
        slotBox.appendChild(btn);
      });
    }).catch(function(){ slotBox.innerHTML=`<p class='bk-hint'>${BK.error||''}</p>`; });
  }
  if(sub) sub.addEventListener('click', function(){
    var name=(root.querySelector('#bkName').value||'').trim();
    var phone=(root.querySelector('#bkPhone').value||'').trim();
    var email=(root.querySelector('#bkEmail').value||'').trim();
    var vehicle=(root.querySelector('#bkVehicle').value||'').trim();
    var notes=(root.querySelector('#bkNotes').value||'').trim();
    if(!name || (!phone && !email)){ alert(BK.required||''); return; }
    if(!state.date || !state.time){ alert(BK.selectDateFirst||''); go(2); return; }
    sub.disabled=true; var orig=sub.textContent; sub.textContent=BK.sending||'...';
    fetch('api/appointments',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ customer_name:name, phone:phone, email:email, vehicle:vehicle, notes:notes, service_id:state.service, appt_date:state.date, appt_time:state.time }) }).then(function(r){ return r.json().then(function(d){ return { ok:r.ok, d:d }; }); }).then(function(res){
      if(!res.ok || !res.d.success){ alert(res.d && res.d.error==='taken' ? (BK.noSlots||'') : (BK.error||'')); sub.disabled=false; sub.textContent=orig; return; }
      success(res.d);
    }).catch(function(){ alert(BK.error||''); sub.disabled=false; sub.textContent=orig; });
  });
  function success(d){
    panels.forEach(function(p){ p.style.display='none'; });
    var suc=root.querySelector('#bkSuccess'); if(suc) suc.style.display='';
    tabs.forEach(function(tb){ tb.classList.add('done'); tb.classList.remove('active'); });
    var set=function(id,v){ var e=root.querySelector(id); if(e) e.textContent=v; };
    set('#pRef', d.ref||''); set('#pService', d.service||state.serviceName||'—'); set('#pWhen', (d.date||state.date)+' · '+(d.time||state.time)); set('#pName', d.name||'');
  }
  var an=root.querySelector('#bkAnother'); if(an) an.addEventListener('click', function(){ location.reload(); });
  var params=new URLSearchParams(location.search); var pre=params.get('service');
  if(pre){ root.querySelectorAll('.bk-service').forEach(function(c){ if(c.getAttribute('data-id')===pre){ c.classList.add('selected'); state.service=pre; state.serviceName=c.getAttribute('data-name')||''; if(n1) n1.disabled=false; } }); go(2); }
})();
