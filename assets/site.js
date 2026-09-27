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
  // subscribe forms: confirm in place (prototype, no backend)
  document.querySelectorAll('form[data-subscribe]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const inp = f.querySelector('input[type=email]'); const v = inp && inp.value; f.innerHTML = '<p class="ok" style="padding:12px 14px;background:var(--panel);font-size:14px">thanks' + (v ? ', ' + v : '') + '. first email lands monday.</p>'; }));
  // contact form: confirm in place
  document.querySelectorAll('form[data-contact]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const t = f.querySelector('[data-thanks]'); if (t) t.hidden = false; f.querySelector('button[type=submit]').disabled = true; }));
  // prefill contact topic from ?topic=
  const topic = new URLSearchParams(location.search).get('topic'), sel = document.getElementById('topic');
  if (topic && sel && [...sel.options].some(o => o.value === topic)) sel.value = topic;
  // copy link buttons
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); const t = b.textContent; b.textContent = 'copied'; setTimeout(() => (b.textContent = t), 1500); } catch (e) { prompt('copy this link', location.href); } }));
  // follow toggle (prototype)
  document.querySelectorAll('[data-follow]').forEach(b => { let on = false; const n = Number(b.dataset.count || 0); b.addEventListener('click', () => { on = !on; b.textContent = on ? 'following · ' + (n + 1).toLocaleString('en-US') : 'follow · ' + n.toLocaleString('en-US'); }); });
})();
