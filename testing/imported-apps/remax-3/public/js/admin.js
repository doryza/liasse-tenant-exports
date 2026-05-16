(function(){
  var toggle = document.getElementById('adminMenuToggle');
  var sidebar = document.getElementById('adminSidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function(){ sidebar.classList.toggle('open'); });
    document.addEventListener('click', function(e){
      if (!sidebar.contains(e.target) && !toggle.contains(e.target) && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  }
  // Toast helper
  window.showToast = function(msg, type){
    var t = document.createElement('div');
    t.className = 'toast ' + (type || 'success');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.classList.add('show'); }, 10);
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 300); }, 3200);
  };
})();
