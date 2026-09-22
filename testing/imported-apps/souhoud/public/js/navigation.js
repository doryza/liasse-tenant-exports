(function () {
  var nav = document.getElementById('site-nav');
  var toggle = document.querySelector('[data-menu-toggle]');
  var backdrop = document.querySelector('[data-nav-backdrop]');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    document.body.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('show', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeNav);

  // Dropdown groups: click on touch/small screens, hover on pointer devices.
  var groups = Array.prototype.slice.call(document.querySelectorAll('.nav-group'));
  groups.forEach(function (group) {
    var button = group.querySelector('button');
    if (!button) return;
    button.addEventListener('click', function (event) {
      event.preventDefault();
      var open = !group.classList.contains('open');
      groups.forEach(function (other) { other.classList.remove('open'); var b = other.querySelector('button'); if (b) b.setAttribute('aria-expanded', 'false'); });
      group.classList.toggle('open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  document.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('.nav-group')) return;
    groups.forEach(function (group) { group.classList.remove('open'); var b = group.querySelector('button'); if (b) b.setAttribute('aria-expanded', 'false'); });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    groups.forEach(function (group) { group.classList.remove('open'); });
    closeNav();
  });

  // Close the drawer when a link inside it is followed.
  if (nav) nav.addEventListener('click', function (event) { if (event.target.closest('a')) closeNav(); });
})();
