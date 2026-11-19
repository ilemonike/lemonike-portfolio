(() => {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.fonts.ready.then(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const splits = [];
      const tweens = [];
      const textElements = document.querySelectorAll('.about-page [data-reveal-text]');

      textElements.forEach((text) => {
        const split = SplitText.create(text, {
          type: 'words,lines',
          linesClass: 'line',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) => gsap.fromTo(self.lines, { yPercent: 105, opacity: 0 }, {
            yPercent: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: text,
              start: 'top 90%',
              end: 'top 62%',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }),
        });
        splits.push(split);
      });

      document.querySelectorAll('.about-reveal:not(:has([data-reveal-text]))').forEach((element) => {
        tweens.push(gsap.fromTo(element, { opacity: 0, y: 18 }, {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: element, start: 'top 95%', end: 'top 65%', scrub: 0.6 },
        }));
      });
      ScrollTrigger.refresh();
      return () => {
        splits.forEach((split) => split.revert());
        tweens.forEach((tween) => tween.revert());
      };
    });
  });
})();
