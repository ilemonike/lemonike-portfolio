(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const running = new Set();
  const activeTargets = new WeakSet();
  const canSplit = Boolean(window.gsap && window.SplitText);
  const textSplits = [];
  let textObserver;
  const motionTargets = document.querySelectorAll(canSplit ? '.work' : '.work, .site-footer');
  if (canSplit) {
    gsap.registerPlugin(SplitText);
    document.fonts.ready.then(() => {
      if (reducedMotion.matches) return;
      const animations = new Map();
      const visible = new WeakSet();
      textObserver = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          visible.add(target);
          animations.get(target)?.play();
          textObserver.unobserve(target);
        });
      }, { threshold: 0.15 });
      document.querySelectorAll('.work-caption span, .site-footer strong').forEach((target) => {
        target.classList.add('split');
        const instance = SplitText.create(target, {
          type: 'words,lines',
          linesClass: 'line',
          autoSplit: true,
          mask: 'lines',
          onSplit: (self) => {
            // Las líneas se recalculan al cambiar las fuentes o el ancho.
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
        });
        textSplits.push(instance);
        textObserver.observe(target);
      });
    });
  }
  const motionObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('motion-visible');
      motionObserver.unobserve(target);
    });
  }, { threshold: 0.08 });
  motionTargets.forEach((target) => {
    target.classList.add('motion-ready');
    motionObserver.observe(target);
  });

  function revealPixels(target) {
    if (activeTargets.has(target)) return;
    const image = target.querySelector('img') || new Image();
    const isFlower = Boolean(target.dataset.pixelSrc);
    let started = false;
    const start = () => {
      if (started || reducedMotion.matches || !image.naturalWidth || !target.isConnected || activeTargets.has(target)) return;
      if (isFlower && !target.matches(':hover')) return;
      started = true;
      const canvas = document.createElement('canvas');
      const buffer = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const lowRes = buffer.getContext('2d');
      if (!context || !lowRes) return;
      const rect = target.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(rect.width * density));
      canvas.height = Math.max(1, Math.round(rect.height * density));
      canvas.className = 'pixel-overlay';
      canvas.setAttribute('aria-hidden', 'true');
      target.append(canvas);
      activeTargets.add(target);
      context.imageSmoothingEnabled = false;
      let frame;
      let startTime;
      const stop = () => {
        cancelAnimationFrame(frame);
        canvas.remove();
        target.classList.remove('pixel-running', 'pixel-resolved');
        running.delete(stop);
        activeTargets.delete(target);
      };
      running.add(stop);

      const draw = (time) => {
        startTime ??= time;
        const progress = Math.min((time - startTime) / (isFlower ? 1200 : 850), 1);
        // Pasos de píxeles definidos y un fundido hacia la imagen original.
        const sizes = isFlower ? [12, 18, 28, 44, 72, 120, 220, 400] : [40, 64, 100, 160, 260, 400, 600];
        const columns = sizes[Math.min(Math.floor(progress * sizes.length), sizes.length - 1)];
        buffer.width = Math.min(canvas.width, columns);
        buffer.height = Math.max(1, Math.round(buffer.width * canvas.height / canvas.width));
        const scale = isFlower
          ? Math.min(buffer.width / image.naturalWidth, buffer.height / image.naturalHeight)
          : Math.max(buffer.width / image.naturalWidth, buffer.height / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        lowRes.clearRect(0, 0, buffer.width, buffer.height);
        lowRes.drawImage(image, (buffer.width - width) / 2, (buffer.height - height) / 2, width, height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(buffer, 0, 0, canvas.width, canvas.height);
        target.classList.add('pixel-running');
        if (progress > 0.78) {
          target.classList.add('pixel-resolved');
          canvas.style.opacity = String((1 - progress) / 0.22);
        }
        if (progress < 1) frame = requestAnimationFrame(draw);
        else stop();
      };
      frame = requestAnimationFrame(draw);
    };
    if (isFlower) image.src = target.dataset.pixelSrc;
    if (image.complete) start();
    else image.addEventListener('load', start, { once: true });
  }

  const pixelObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      pixelObserver.unobserve(target);
      revealPixels(target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.work-image').forEach((target) => pixelObserver.observe(target));
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-pixel-src]').forEach((target) => {
      target.addEventListener('pointerenter', () => revealPixels(target));
    });
  }

  reducedMotion.addEventListener('change', ({ matches }) => {
    if (!matches) return;
    motionObserver.disconnect();
    pixelObserver.disconnect();
    textObserver?.disconnect();
    textSplits.forEach((instance) => instance.revert());
    motionTargets.forEach((target) => target.classList.remove('motion-ready', 'motion-visible'));
    [...running].forEach((stop) => stop());
  });
})();
