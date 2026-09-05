(function(){
  'use strict';
  var form=document.getElementById('demoForm');
  form.addEventListener('submit',function(event){
    event.preventDefault();
    if(!form.reportValidity())return;
    form.reset();form.hidden=true;
    var done=document.getElementById('demoSuccess');done.hidden=false;done.focus();
  });
})();
