(() => {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  const menu = document.getElementById('menu'), mb = document.getElementById('menuBtn');
  if (menu && mb) {
    const open = o => { if (o) menu.setAttribute('open', ''); else menu.removeAttribute('open'); mb.setAttribute('aria-expanded', String(o)); document.body.style.overflow = o ? 'hidden' : ''; };
    mb.addEventListener('click', () => open(true));
    const mc = document.getElementById('menuClose'); if (mc) mc.addEventListener('click', () => open(false));
    menu.querySelectorAll('[data-close]').forEach(a => a.addEventListener('click', () => open(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
  }
  document.querySelectorAll('[data-seg]').forEach(g => g.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); })));
})();
