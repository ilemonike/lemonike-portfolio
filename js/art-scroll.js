(() => {
  document.querySelectorAll('.art-scroll-row').forEach((row) => {
    const originals = [...row.children];
    if (!originals.length) return;
    const copy = () => originals.map((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      if (clone.matches('a')) clone.tabIndex = -1;
      clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
      return clone;
    });
    row.prepend(...copy());
    row.append(...copy());
    row.classList.add('art-scroll-infinite');
    let period = 0;

    function measure() {
      const previous = period;
      const position = row.scrollLeft;
      period = originals[0].offsetLeft - row.children[0].offsetLeft;
      if (!period) return;
      row.scrollLeft = previous ? position / previous * period : period;
    }

    function loop() {
      if (!period) return;
      if (row.scrollLeft < period * 0.5) row.scrollLeft += period;
      else if (row.scrollLeft > period * 1.5) row.scrollLeft -= period;
    }

    row.addEventListener('scroll', loop, { passive: true });
    // Teclado: mantiene el enlace enfocado en su posición, sin recentrarlo.
    row.addEventListener('focusin', (event) => {
      if (event.target === row) return;
      const bounds = event.target.getBoundingClientRect();
      const viewport = row.getBoundingClientRect();
      if (bounds.left < viewport.left || bounds.right > viewport.right) {
        row.scrollLeft += bounds.left - viewport.left - viewport.width * 0.17;
      }
    });
    measure();
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(measure);
      observer.observe(row);
      observer.observe(originals[0]);
    } else {
      window.addEventListener('resize', measure);
    }
  });
})();
