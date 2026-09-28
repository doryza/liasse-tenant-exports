(function () {
  'use strict';
  // Keep « Save contact » within thumb reach on a phone once the card's own
  // button has scrolled away.
  var dock = document.getElementById('dock');
  var save = document.getElementById('save');
  if (dock && save && 'IntersectionObserver' in window) {
    dock.hidden = false;
    dock.classList.add('is-hidden');
    new IntersectionObserver(function (entries) {
      dock.classList.toggle('is-hidden', entries[0].isIntersecting);
    }).observe(save);
  }

  var share = document.querySelector('[data-share]');
  if (share) {
    share.addEventListener('click', function () {
      var url = document.querySelector('link[hreflang="' + document.documentElement.lang + '"]');
      var href = url ? url.href : location.href;
      var label = share.querySelector('span');
      var original = label.textContent;
      if (navigator.share) {
        navigator.share({ title: share.getAttribute('data-title'), url: href }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(href).then(function () {
          label.textContent = share.getAttribute('data-copied');
          setTimeout(function () { label.textContent = original; }, 1800);
        });
      }
    });
  }
})();
