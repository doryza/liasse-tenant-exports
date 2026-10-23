(() => {
  const input = document.getElementById('menuSearch');
  if (!input) return;
  const clean = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const dishes = Array.from(document.querySelectorAll('.dish'));
  const sections = Array.from(document.querySelectorAll('.menu-category'));
  input.addEventListener('input', () => {
    const query = clean(input.value.trim()); let matches = 0;
    dishes.forEach(d => { d.hidden = !clean(d.dataset.search).includes(query); if (!d.hidden) matches++; });
    sections.forEach(s => { s.hidden = !Array.from(s.querySelectorAll('.dish')).some(d => !d.hidden); });
    document.getElementById('noResults').hidden = matches > 0;
  });
  document.querySelectorAll('.category-nav a').forEach(a => a.addEventListener('click', () => {
    input.value = ''; input.dispatchEvent(new Event('input'));
  }));
})();
