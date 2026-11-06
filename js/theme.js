(() => {
  const header = document.querySelector('header');
  if (!header) return;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'theme-switch';
  toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-checked', 'false');
  toggle.setAttribute('aria-label', 'Dark theme');
  toggle.innerHTML = '<span class="theme-track" aria-hidden="true"></span>';
  header.append(toggle);
  import('./chaos.js').then(({ initChaos }) => initChaos(header)).catch(() => {});
  let saved;
  try { saved = localStorage.getItem('lemonike-theme') || localStorage.getItem('lemonike-art-theme'); } catch {}
  const apply = (dark) => {
    document.body.dataset.theme = dark ? 'dark' : 'light';
    toggle.setAttribute('aria-checked', String(dark));
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  };
  apply(saved === 'dark');
  toggle.addEventListener('click', () => {
    const dark = toggle.getAttribute('aria-checked') !== 'true';
    apply(dark);
    try { localStorage.setItem('lemonike-theme', dark ? 'dark' : 'light'); } catch {}
  });
})();
