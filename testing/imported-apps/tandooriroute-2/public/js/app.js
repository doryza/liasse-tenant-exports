(function(){
function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);}
ready(function(){
  var filters=document.querySelectorAll('[data-filter]');
  if(filters.length){
    filters.forEach(function(btn){
      btn.addEventListener('click',function(){
        var f=btn.getAttribute('data-filter');
        filters.forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        document.querySelectorAll('[data-gallery-item]').forEach(function(it){
          var c=it.getAttribute('data-category');
          it.style.display=(f==='all'||c===f)?'':'none';
        });
      });
    });
  }
  var form=document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var msg=document.getElementById('formMsg');
      var btn=form.querySelector('button[type=submit]');
      var data={name:form.name.value,email:form.email.value,phone:form.phone.value,message:form.message.value};
      if(!data.name||!data.message){if(msg){msg.textContent=form.getAttribute('data-err');msg.className='form-msg error';}return;}
      if(btn)btn.disabled=true;
      fetch('api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
        .then(function(res){if(res.ok&&res.j.success){if(msg){msg.textContent=form.getAttribute('data-ok');msg.className='form-msg success';}form.reset();}else{throw new Error();}})
        .catch(function(){if(msg){msg.textContent=form.getAttribute('data-err');msg.className='form-msg error';}})
        .then(function(){if(btn)btn.disabled=false;});
    });
  }
});
})();
