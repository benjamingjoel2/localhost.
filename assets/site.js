(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- reveal on scroll, with automatic stagger ----
  const auto = ['.page-title', '.sec > *', '.list > a', '.cells > *', '.cities > *', '.grid4 > *', '.band > div', '.stats > *', '.two > *', '.side > *', '.posts > *', '.hosts > *', '.box'];
  document.querySelectorAll(auto.join(',')).forEach(el => { if (!el.closest('.reveal') && !el.classList.contains('reveal')) el.classList.add('reveal'); });
  const groups = new Map();
  document.querySelectorAll('.reveal').forEach(el => { const p = el.parentElement; const n = groups.get(p) ?? 0; groups.set(p, n + 1); el.style.setProperty('--d', Math.min(n, 8) * 0.06 + 's'); });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .06, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---- cross-page transitions: native view transitions where supported, JS fade otherwise ----
  const nativeVT = 'startViewTransition' in document && CSS.supports('view-transition-name: root');
  if (!nativeVT && !reduce) {
    document.documentElement.classList.add('js-enter');
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname && url.hash) return;
      if (!/\.html?$|\/$/.test(url.pathname)) return;
      e.preventDefault();
      document.documentElement.classList.add('is-leaving');
      setTimeout(() => { location.href = url.href; }, 220);
    });
    addEventListener('pageshow', e => { if (e.persisted) document.documentElement.classList.remove('is-leaving'); });
  }

  // ---- menu ----
  const menu = document.getElementById('menu'), mb = document.getElementById('menuBtn');
  if (menu && mb) {
    const open = o => { if (o) menu.setAttribute('open', ''); else menu.removeAttribute('open'); mb.setAttribute('aria-expanded', String(o)); document.body.style.overflow = o ? 'hidden' : ''; };
    mb.addEventListener('click', () => open(true));
    const mc = document.getElementById('menuClose'); if (mc) mc.addEventListener('click', () => open(false));
    menu.querySelectorAll('[data-close]').forEach(a => a.addEventListener('click', () => open(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
  }

  // ---- segmented controls ----
  document.querySelectorAll('[data-seg]').forEach(g => g.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); })));

  // ---- forms (prototype: confirm in place) ----
  document.querySelectorAll('form[data-subscribe]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const inp = f.querySelector('input[type=email]'); const v = inp && inp.value; f.innerHTML = '<p class="ok" style="padding:12px 14px;font-size:14px">thanks' + (v ? ', ' + v : '') + '. first email lands monday.</p>'; }));
  document.querySelectorAll('form[data-contact]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const t = f.querySelector('[data-thanks]'); if (t) t.hidden = false; f.querySelector('button[type=submit]').disabled = true; }));
  const topic = new URLSearchParams(location.search).get('topic'), sel = document.getElementById('topic');
  if (topic && sel && [...sel.options].some(o => o.value === topic)) sel.value = topic;

  // ---- copy link, follow ----
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); const t = b.textContent; b.textContent = 'copied'; setTimeout(() => (b.textContent = t), 1500); } catch (e) { prompt('copy this link', location.href); } }));
  document.querySelectorAll('[data-follow]').forEach(b => { let on = false; const n = Number(b.dataset.count || 0); b.addEventListener('click', () => { on = !on; b.textContent = on ? 'following · ' + (n + 1).toLocaleString('en-US') : 'follow · ' + n.toLocaleString('en-US'); }); });
})();
