export function initChaos(header) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'chaos-button';
  button.innerHTML = '<span class="chaos-icon" aria-hidden="true"></span><span>Un poco de caos</span>';
  header.append(button);

  const status = document.createElement('span');
  status.className = 'chaos-status';
  status.setAttribute('role', 'status');
  document.body.append(status);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const restorers = new Set();
  const effects = ['disorder', 'fire', 'aura', 'sparks', 'glitch'];
  const labels = { disorder: 'Un pequeño desorden. Todo vuelve a su lugar.', fire: '¡Fueguitos!', aura: 'Una nube de color.', sparks: '¡Estrellas, giros y colores arcoíris!', glitch: 'Glitch de color. Todo vuelve a la normalidad.' };
  let previous;
  let overlay;
  let timer;
  let busy = false;
  let runId = 0;

  function animate(element, frames, options) {
    const animation = element.animate(frames, { fill: 'backwards', ...options });
    animations.add(animation);
    return animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  }

  function animateUnclipped(element, frames, options) {
    let parent = element.parentElement;
    let clipped = false;
    while (parent && parent !== document.body) {
      const style = getComputedStyle(parent);
      if (/(hidden|clip|auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)) {
        clipped = true;
        break;
      }
      parent = parent.parentElement;
    }
    if (!clipped) return animate(element, frames, options);

    // La copia visual sale del contenedor; el original conserva su espacio.
    const bounds = element.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > innerHeight || bounds.right < 0 || bounds.left > innerWidth) {
      return animate(element, frames, options);
    }
    const ghost = element.cloneNode(true);
    ghost.removeAttribute('id');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.classList.add('chaos-ghost');
    ghost.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    const computed = getComputedStyle(element);
    ['font', 'color', 'line-height', 'letter-spacing', 'text-align', 'text-transform'].forEach((property) => {
      ghost.style.setProperty(property, computed.getPropertyValue(property));
    });
    Object.assign(ghost.style, { position: 'absolute', margin: '0', width: `${bounds.width}px`, height: `${bounds.height}px`, pointerEvents: 'none' });
    const position = () => {
      const rect = element.getBoundingClientRect();
      ghost.style.left = `${rect.left}px`;
      ghost.style.top = `${rect.top}px`;
    };
    position();
    overlay.append(ghost);
    const visibility = element.style.visibility;
    element.style.visibility = 'hidden';
    window.addEventListener('scroll', position, { passive: true, capture: true });
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      element.style.visibility = visibility;
      window.removeEventListener('scroll', position, true);
      ghost.remove();
      restorers.delete(restore);
    };
    restorers.add(restore);
    return animate(ghost, frames, options).finally(restore);
  }

  function cleanup() {
    runId++;
    clearTimeout(timer);
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    [...restorers].forEach((restore) => restore());
    overlay?.remove();
    overlay = null;
    busy = false;
    button.removeAttribute('aria-disabled');
    button.removeAttribute('aria-busy');
  }

  function particle(className, x, y, color) {
    const element = document.createElement('span');
    element.className = `chaos-particle ${className}`;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.setProperty('--spark-color', color);
    overlay.append(element);
    return element;
  }

  button.addEventListener('click', async () => {
    if (busy) cleanup();
    const currentRun = ++runId;
    busy = true;
    button.setAttribute('aria-busy', 'true');
    const choices = effects.filter((effect) => effect !== previous);
    // La primera sorpresa es inmediata y evidente; después se alternan al azar.
    const effect = previous ? choices[Math.floor(Math.random() * choices.length)] : 'fire';
    previous = effect;
    status.textContent = labels[effect];
    overlay = document.createElement('div');
    overlay.className = 'chaos-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.append(overlay);
    let staticEffect = false;
    try {

    // Una sorpresa estática, sin desplazamientos, si se solicita menos movimiento.
    if (motion.matches) {
      staticEffect = true;
      overlay.classList.add('chaos-still');
      timer = setTimeout(cleanup, 1600);
      return;
    }

    const rect = button.getBoundingClientRect();
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const colors = ['#ff9176', '#bc94ff', '#647dff', '#ffc5e9', '#f4c856'];
    const tasks = [];
    tasks.push(animate(button.querySelector('.chaos-icon'), [
      { transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' },
    ], { duration: 280, easing: 'ease-out' }));
    if (effect === 'disorder') {
      // El desorden afecta toda la página, no solo los elementos del primer viewport.
      const targets = [...document.querySelectorAll('.nav .logo, .nav-role, .home-wordmark, .home-role, .nav nav a, .floating-nav a, .imagine-link, .forward-link, .home-leona, .chrome-sculpture, .work-image, .work-caption, .catalog-image, .catalog-project h3, .art-image, .art-work h2, .project-images figure, .related-image, .related-project p, main h1, main h2, .project-description, .project-extra, .project-quote, .project-facts div, .cv-row, .about-portrait, .about-bio p, .site-footer > *')];
      targets.forEach((target, index) => {
        const direction = () => Math.random() < 0.5 ? -1 : 1;
        const x = direction() * (35 + Math.random() * 65);
        const y = direction() * (20 + Math.random() * 45);
        const rotation = direction() * (8 + Math.random() * 16);
        tasks.push(animateUnclipped(target, [
          { transform: 'translate(0, 0) rotate(0deg)', offset: 0 },
          { transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`, offset: 0.15 },
          { transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`, offset: 0.72 },
          { transform: 'translate(0, 0) rotate(0deg)', offset: 1 },
        ], { duration: 6500, delay: Math.min(index * 35, 900), easing: 'cubic-bezier(.22,.65,.3,1)' }));
      });
    } else if (effect === 'glitch') {
      const targets = document.querySelectorAll('.logo img, .home-wordmark img, .nav-role, .home-role, .nav nav a, .floating-nav a, .imagine-link, .forward-link, .home-leona, .chrome-sculpture, .work-image, .work-caption, .catalog-image, .catalog-project h3, .art-image, .art-work h2, .project-images figure, .related-image, .related-project p, main h1, main h2, .project-description, .project-extra, .project-quote, .project-facts div, .cv-row, .about-portrait, .about-bio p, .site-footer > *');
      targets.forEach((target, index) => {
        const style = getComputedStyle(target);
        const base = style.transform === 'none' ? '' : style.transform;
        const filter = style.filter === 'none' ? '' : style.filter;
        const original = { transform: style.transform, filter: style.filter, textShadow: style.textShadow };
        const glitch = (x, skew, hue) => ({
          transform: `${base} translate(${x}px, 0) skewX(${skew}deg)`,
          filter: `${filter} drop-shadow(3px 0 #ff639f) drop-shadow(-3px 0 #63d8ff) hue-rotate(${hue}deg)`,
          textShadow: '3px 0 #ff639f, -3px 0 #63d8ff',
        });
        tasks.push(animateUnclipped(target, [
          { ...original, offset: 0 },
          { ...glitch(-5, -1.5, 0), offset: 0.12 },
          { ...glitch(6, 2, 25), offset: 0.27 },
          { ...original, offset: 0.42 },
          { ...glitch(-7, -2, -20), offset: 0.58 },
          { ...glitch(3, 1, 10), offset: 0.74 },
          { ...original, offset: 0.88 },
          { ...original, offset: 1 },
        ], { duration: 1600, delay: Math.min(index * 18, 350), easing: 'steps(1, end)' }));
      });
    } else if (effect === 'aura') {
      for (let index = 0; index < 3; index++) {
        const cloud = particle('chaos-cloud', innerWidth * (0.2 + index * 0.3), innerHeight * (0.35 + Math.random() * 0.3), colors[index]);
        tasks.push(animate(cloud, [
          { opacity: 0, transform: 'translate(-50%, -50%) scale(.4)' },
          { opacity: 0.35, transform: 'translate(-50%, -55%) scale(1)', offset: 0.35 },
          { opacity: 0, transform: 'translate(-50%, -65%) scale(1.35)' },
        ], { duration: 2300, delay: index * 120, easing: 'ease-in-out' }));
      }
    } else {
      const fire = effect === 'fire';
      const visibleSources = (selector, count) => [...document.querySelectorAll(selector)]
        .map((element) => element.getBoundingClientRect())
        .filter((bounds) => bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth)
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .map((bounds) => {
          const left = Math.max(0, bounds.left);
          const right = Math.min(innerWidth, bounds.right);
          const top = Math.max(0, bounds.top);
          const bottom = Math.min(innerHeight, bounds.bottom);
          return { x: left + (right - left) * (0.2 + Math.random() * 0.6), y: top + (bottom - top) * 0.5 };
        });
      const sources = fire ? [
        origin,
        ...visibleSources('.logo img, .home-wordmark img', 1),
        ...visibleSources('.nav nav a, .floating-nav a, .imagine-link, .forward-link', 3),
        ...visibleSources('.work-image, .catalog-image, .art-work:not(.art-placeholder) .art-image, .project-images figure, .related-image, .about-portrait, .chrome-sculpture', 4),
      ] : [origin];
      const count = fire ? sources.length * 9 : 34;
      for (let index = 0; index < count; index++) {
        const source = sources[index % sources.length];
        const element = particle(fire ? 'chaos-flame' : 'chaos-star', source.x, source.y, colors[index % colors.length]);
        const angle = Math.random() * Math.PI * 2;
        const distance = 70 + Math.random() * 260;
        const x = Math.cos(angle) * distance;
        const y = fire ? -70 - Math.random() * 300 : Math.sin(angle) * distance;
        tasks.push(animate(element, [
          { opacity: 0, transform: 'translate(-50%, -50%) scale(.25)' },
          { opacity: 1, transform: `translate(calc(-50% + ${x * 0.3}px), calc(-50% + ${y * 0.3}px)) scale(1)`, offset: 0.2 },
          { opacity: 0, transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${Math.random() * 240 - 120}deg) scale(.2)` },
        ], { duration: 1100 + Math.random() * 900, delay: index === 0 ? 0 : Math.random() * (fire ? 700 : 200), easing: 'cubic-bezier(.15,.5,.35,1)' }));
      }
      if (!fire) {
        const targets = [...document.querySelectorAll('.logo img, .home-wordmark img, .nav-role, .home-role, .home-leona, .chrome-sculpture, .nav nav a, .floating-nav a, .imagine-link, .forward-link, .work-image, .work-caption, .catalog-image, .catalog-project h3, .art-image, .art-work h2, .project-images figure, .car-main, .car-thumbs img, .car-btn, .related-image, .related-project p, main h1, main h2, .project-description, .project-extra, .project-quote, .project-facts div, .about-bio p, .cv-row, .about-portrait, .footer-credit, .footer-social')];
        targets.forEach((target, index) => {
          const style = getComputedStyle(target);
          const baseTransform = style.transform === 'none' ? '' : style.transform;
          const hue = Math.floor(Math.random() * 360);
          const rainbow = `hsl(${hue} 90% 62%)`;
          const isTag = target.matches('.nav nav a, .pill');
          const original = { color: style.color, backgroundColor: style.backgroundColor, filter: style.filter };
          tasks.push(animateUnclipped(target, [
            { ...original, transform: `${baseTransform} perspective(700px) rotateY(0deg)`, offset: 0 },
            { color: isTag ? '#111' : rainbow, backgroundColor: isTag ? rainbow : original.backgroundColor, filter: `hue-rotate(${hue}deg) saturate(1.5)`, transform: `${baseTransform} perspective(700px) rotateY(180deg)`, offset: 0.35 },
            { color: isTag ? '#111' : `hsl(${(hue + 120) % 360} 90% 62%)`, backgroundColor: isTag ? `hsl(${(hue + 120) % 360} 90% 72%)` : original.backgroundColor, filter: `hue-rotate(${hue + 120}deg) saturate(1.5)`, transform: `${baseTransform} perspective(700px) rotateY(180deg)`, offset: 0.6 },
            { ...original, transform: `${baseTransform} perspective(700px) rotateY(360deg)`, offset: 1 },
          ], { duration: 3400, delay: Math.min(index * 35, 600), easing: 'cubic-bezier(.22,.65,.3,1)' }));
        });
      }
    }
    await Promise.allSettled(tasks);
    } catch (error) {
      console.warn('No se pudo completar el efecto de caos.', error);
    } finally {
      if (!staticEffect && currentRun === runId) cleanup();
    }
  });
  motion.addEventListener('change', cleanup);
  window.addEventListener('pagehide', cleanup);
}
