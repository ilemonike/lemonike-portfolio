(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!window.gsap || !window.SplitText || !('IntersectionObserver' in window)) return;
  gsap.registerPlugin(SplitText);

  const splits = new Map();
  const animations = new Map();
  const imageAnimations = [];
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const animation = gsap.to(target, { opacity: 1, duration: 1, ease: 'power1.out' });
      imageAnimations.push(animation);
      imageObserver.unobserve(target);
    });
  }, { threshold: 0.08 });
  const visible = new WeakSet();
  const selector = '.project-title, .project-description, .project-facts dt, .project-facts dd, .project-extra, .project-quote, .project-related h2, .related-project p, .card strong, .card .meta, .design-catalog > h1, .catalog-category h2, .catalog-project h3, .art-heading h1, .art-work h2';
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      visible.add(target);
      animations.get(target)?.play();
      observer.unobserve(target);
    });
  }, { threshold: 0.1 });

  function scan() {
    if (reducedMotion.matches) return;
    // Los filtros de los catálogos generan nuevas tarjetas.
    splits.forEach((instance, target) => {
      if (target.isConnected) return;
      observer.unobserve(target);
      instance.revert();
      splits.delete(target);
      animations.delete(target);
    });
    document.querySelectorAll(selector).forEach((target) => {
      if (splits.has(target)) return;
      splits.set(target, SplitText.create(target, {
        type: 'words,lines',
        linesClass: 'line',
        autoSplit: true,
        mask: 'lines',
        onSplit: (self) => {
          const animation = gsap.from(self.lines, {
            duration: 0.6,
            yPercent: 100,
            opacity: 0,
            stagger: 0.1,
            ease: 'expo.out',
            paused: !visible.has(target),
          });
          animations.set(target, animation);
          return animation;
        },
      }));
      observer.observe(target);
    });
  }

  document.fonts.ready.then(() => {
    scan();
    if (!reducedMotion.matches) {
      document.querySelectorAll('.project-image-section, .related-image, .catalog-image, .art-work:not(.art-placeholder) .art-image').forEach((target) => {
        gsap.set(target, { opacity: 0 });
        imageObserver.observe(target);
      });
    }
    const grid = document.getElementById('grid');
    if (grid) new MutationObserver(scan).observe(grid, { childList: true });
  });
  reducedMotion.addEventListener('change', ({ matches }) => {
    if (!matches) return;
    observer.disconnect();
    imageObserver.disconnect();
    imageAnimations.forEach((animation) => animation.kill());
    gsap.set('.project-image-section, .related-image, .catalog-image, .art-image', { clearProps: 'opacity' });
    splits.forEach((instance) => instance.revert());
    splits.clear();
    animations.clear();
  });
})();
