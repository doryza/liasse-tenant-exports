(function(){
var ham = document.getElementById('hamburger');
var menu = document.getElementById('mobileMenu');
var close = document.getElementById('mobileMenuClose');
if (ham && menu) { ham.addEventListener('click', function(){ menu.classList.add('open'); }); }
if (close && menu) { close.addEventListener('click', function(){ menu.classList.remove('open'); }); }
if (menu) { menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ menu.classList.remove('open'); }); }); }
// Highlight active nav link
try {
  var path = window.location.pathname.replace(/\/$/,'');
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function(a){
    var href = a.getAttribute('href');
    if (!href || href === '#') return;
    if (path.endsWith('/' + href) || (href === '.' && (path.endsWith('/mes-informations-personnelles') || path.endsWith('/')))) {
      a.classList.add('active');
    }
  });
} catch(e){}
})();