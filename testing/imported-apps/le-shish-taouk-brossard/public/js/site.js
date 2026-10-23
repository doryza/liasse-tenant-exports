// Menu page: highlight the section being read in the sticky category bar,
// and keep that chip in view inside the horizontally scrolling bar.
(function () {
  var nav = document.querySelector('.cat-nav-row');
  if (!nav || !('IntersectionObserver' in window)) return;
  var links = {};
  Array.prototype.forEach.call(nav.querySelectorAll('a[data-cat]'), function (a) { links[a.getAttribute('data-cat')] = a; });
  var current = null;
  function activate(slug) {
    if (slug === current || !links[slug]) return;
    if (current && links[current]) links[current].classList.remove('on');
    current = slug;
    var a = links[slug];
    a.classList.add('on');
    var left = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) activate(e.target.id); });
  }, { rootMargin: '-80px 0px -70% 0px' });
  Array.prototype.forEach.call(document.querySelectorAll('.menu-cat'), function (s) { io.observe(s); });
})();
