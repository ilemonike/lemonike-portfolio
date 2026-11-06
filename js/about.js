(() => {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.fonts.ready.then(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const splits = [];
      const tweens = [];
      document.querySelectorAll('.about-reveal').forEach((row) => {
        const texts = row.querySelectorAll('[data-reveal-text]');
        if (!texts.length) {
          tweens.push(gsap.fromTo(row, { opacity: 0, y: 18 }, {
            opacity: 1, y: 0, ease: 'none',
            scrollTrigger: { trigger: row, start: 'top 95%', end: 'top 65%', scrub: 0.6 },
          }));
          return;
        }
        texts.forEach((text, index) => {
          splits.push(SplitText.create(text, {
            type: 'words,lines', linesClass: 'line', mask: 'lines', autoSplit: true,
            onSplit: (self) => gsap.fromTo(self.lines, { yPercent: 105, opacity: 0 }, {
              yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out',
              scrollTrigger: {
                trigger: row,
                start: `top ${94 - Math.min(index, 2) * 2}%`,
                end: `top ${68 - Math.min(index, 2) * 2}%`,
                scrub: 0.6,
              },
            }),
          }));
        });
      });
      ScrollTrigger.refresh();
      return () => {
        splits.forEach((split) => split.revert());
        tweens.forEach((tween) => tween.revert());
      };
    });
  });
})();
