(function(){
  function init(){
    var t = document.getElementById('navToggle');
    var m = document.getElementById('navMenu');
    if (t && m) {
      t.addEventListener('click', function(e){
        e.stopPropagation();
        m.classList.toggle('open');
      });
      document.addEventListener('click', function(e){
        if (!t.contains(e.target) && !m.contains(e.target)) m.classList.remove('open');
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
