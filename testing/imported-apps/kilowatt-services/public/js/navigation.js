(function() {
  const button = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-nav');
  if (button && nav) {
    button.addEventListener('click',function() {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded',String(open));
      nav.classList.toggle('open',open);
    });
    document.addEventListener('keydown',function(event) {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        button.setAttribute('aria-expanded','false');
        button.focus();
      }
    });
  }
  function keyboardState() {
    const active = document.activeElement;
    const input = active && ['INPUT','TEXTAREA','SELECT'].includes(active.tagName);
    document.body.classList.toggle('keyboard-open',Boolean(input));
  }
  document.addEventListener('focusin',keyboardState);
  document.addEventListener('focusout',function() { setTimeout(keyboardState,0); });
})();