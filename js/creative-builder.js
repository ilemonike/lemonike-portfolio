(() => {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.fonts.ready.then(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      document.querySelectorAll('.builder-reveal').forEach((element) => gsap.set(element, { opacity: 1, y: 0 }));
      const textElements = document.querySelectorAll('.builder-page h1, .builder-page h2, .builder-page h3, .builder-page p, .builder-page .builder-button');
      textElements.forEach((text) => {
        const split = SplitText.create(text, { type: 'words,lines', linesClass: 'line', mask: 'lines', autoSplit: true });
        gsap.fromTo(split.lines, { yPercent: 105, opacity: 0 }, {
          yPercent: 0,
          opacity: 1,
          duration: .7,
          stagger: .06,
          ease: 'expo.out',
          scrollTrigger: { trigger: text, start: 'top 88%', end: 'top 62%', scrub: .6, invalidateOnRefresh: true },
        });
      });
    });
  });
})();
