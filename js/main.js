function getSlug() {
  return new URLSearchParams(location.search).get("slug");
}

function cardHTML(p) {
  return `<a class="card" href="proyecto.html?slug=${p.slug}">
    <img src="${p.portada}" alt="${p.titulo}" onerror="this.style.visibility='hidden'" />
    <div><strong>${p.titulo}</strong><br/><span class="meta">${p.anio || ""} · ${p.categoria || ""}</span></div>
  </a>`;
}

function relatedHTML(projects) {
  if (!projects.length) return '';
  return `<section class="project-related" aria-labelledby="related-title">
    <h2 id="related-title">Si te gustó, ve esto otro…</h2>
    <div class="related-grid">${projects.map((project) => `<a class="related-project" href="proyecto.html?slug=${project.slug}">
      <div class="related-image"><img src="${project.portada}" alt="${project.titulo}" loading="lazy" /></div>
      <p class="related-title">${project.titulo}</p>
      ${project.frase || project.servicios || project.tecnica ? `<p class="related-description">${project.frase || project.servicios || project.tecnica}</p>` : ''}
    </a>`).join('')}</div>
  </section>`;
}

const designCategories = document.getElementById('design-categories');
const artRows = document.getElementById('art-rows');
if (artRows) {
  const works = PROYECTOS.filter((project) => project.vertical === 'arte' && !project.slug.startsWith('obra-ejemplo'));
  const rowCount = Math.max(2, Math.ceil(works.length / 10));
  artRows.innerHTML = Array.from({ length: rowCount }, (_, row) => `
    <section class="art-scroll-row" tabindex="0" aria-label="Obras de arte, fila ${row + 1}. Desplázate horizontalmente para ver los 10 cuadros.">
      ${Array.from({ length: 10 }, (_, column) => {
        const work = works[row * 10 + column];
        return work ? `<a class="art-work" href="proyecto.html?slug=${work.slug}">
          <div class="art-image"><img src="${work.portada}" alt="${work.titulo}" loading="lazy" /></div>
          <h2>${work.titulo}</h2>
        </a>` : `<div class="art-work art-placeholder" aria-hidden="true"><div class="art-image"></div></div>`;
      }).join('')}
    </section>`).join('');
}
if (designCategories) {
  const projects = PROYECTOS.filter((project) => project.vertical === 'diseno');
  const categories = [['branding', 'Branding'], ['packaging', 'Packaging'], ['editorial', 'Editorial'], ['identidad', 'Identidad visual'], ['ilustracion', 'Ilustración']];
  designCategories.innerHTML = categories.map(([slug, title]) => {
    const items = projects.filter((project) => (project.categorias || [project.categoria]).includes(slug));
    if (!items.length) return '';
    return `<section class="catalog-category" aria-labelledby="category-${slug}">
      <h2 id="category-${slug}">${title}</h2>
      <div class="catalog-grid">${items.map((project) => `<a class="catalog-project" href="proyecto.html?slug=${project.slug}">
        <div class="catalog-image"><img src="${project.portada}" alt="${project.titulo}" loading="lazy" /></div>
        <h3>${project.titulo}</h3>
      </a>`).join('')}</div>
    </section>`;
  }).join('');
  const recommendations = PROYECTOS.filter((project) => !project.slug.startsWith('obra-ejemplo'))
    .sort((a, b) => Number(a.vertical === 'diseno') - Number(b.vertical === 'diseno')).slice(0, 3);
  designCategories.insertAdjacentHTML('afterend', relatedHTML(recommendations));
}

function carruselHTML(p, images = [p.portada, ...(p.galeria || [])]) {
  const gal = [...new Set(images.filter(Boolean))];
  if (!gal.length) return "";
  const multi = gal.length > 1;
  return `<div class="carrusel">
    ${multi ? `<button class="car-btn direction-button prev" aria-label="Imagen anterior"><span class="direction-arrow arrow-left" aria-hidden="true"></span></button>` : ""}
    <img id="car-img" class="car-main" src="${gal[0]}" alt="${p.titulo}" />
    ${multi ? `<button class="car-btn direction-button next" aria-label="Imagen siguiente"><span class="direction-arrow" aria-hidden="true"></span></button>` : ""}
  </div>
  ${multi ? `<p class="meta car-count">1 / ${gal.length}</p>
  <div class="car-thumbs">${gal.map((g, k) => `<img src="${g}" data-full="${g}" loading="lazy" alt="" class="${k === 0 ? "active" : ""}" />`).join("")}</div>` : ""}`;
}

function initCarrusel() {
  const thumbs = [...document.querySelectorAll(".car-thumbs img")];
  const main = document.getElementById("car-img");
  const count = document.querySelector(".car-count");
  if (!main || thumbs.length < 2) return;
  let i = 0;
  const show = (n) => {
    i = (n + thumbs.length) % thumbs.length;
    main.src = thumbs[i].dataset.full;
    if (count) count.textContent = `${i + 1} / ${thumbs.length}`;
    thumbs.forEach((t, k) => t.classList.toggle("active", k === i));
  };
  document.querySelector(".car-btn.prev")?.addEventListener("click", () => show(i - 1));
  document.querySelector(".car-btn.next")?.addEventListener("click", () => show(i + 1));
  thumbs.forEach((t, k) => t.addEventListener("click", () => show(k)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(i - 1);
    if (e.key === "ArrowRight") show(i + 1);
  });
}

// Listas en arte.html / diseno.html
const grid = document.getElementById("grid");
if (grid) {
  const vertical = document.body.dataset.vertical;
  const render = (filtro = "all") => {
    const items = PROYECTOS.filter((p) => p.vertical === vertical && (filtro === "all" || p.categoria === filtro));
    grid.innerHTML = items.map(cardHTML).join("") || "<p>Agrega tu primer proyecto en js/data.js</p>";
  };
  render();
  document.querySelectorAll(".filters button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".filters button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      render(b.dataset.filter);
    })
  );
}

// Detalle en proyecto.html
const detalle = document.getElementById("detalle");
if (detalle) {
  const p = PROYECTOS.find((x) => x.slug === getSlug());
  if (!p) {
    detalle.innerHTML = "<p>Proyecto no encontrado. Vuelve a <a href='index.html'>inicio</a>.</p>";
  } else {
    const images = [...new Set([p.portada, ...(p.galeria || [])].filter(Boolean))];
    // Cada proyecto puede repetir bloques y elegir su propia secuencia editorial.
    const composition = p.composicion || [];
    if (!composition.length) {
      for (let index = 0; index < images.length;) {
        const count = Math.min([3, 2, 1][composition.length % 3], images.length - index);
        composition.push({ tipo: count === 3 ? 'tres' : count === 2 ? 'dos' : 'ancha', indices: Array.from({ length: count }, (_, offset) => index + offset) });
        index += count;
      }
    }
    const imageBlocks = composition.map((block, blockIndex) => {
      const items = block.indices.filter((index) => images[index]);
      if (!items.length) return '';
      const content = block.tipo === 'carrusel'
        ? carruselHTML(p, items.map((index) => images[index]))
        : `<div class="project-images project-block-${block.tipo}" style="--columns: ${items.length}; --image-ratio: ${block.proporcion || (items.length === 1 ? '1200 / 800' : '4 / 5')}">
            ${items.map((index) => `<figure><img src="${images[index]}" alt="${p.titulo} — imagen ${index + 1}" loading="lazy" /></figure>`).join('')}
          </div>`;
      return `<section class="project-image-section" aria-label="Imágenes del proyecto, bloque ${blockIndex + 1}">${content}</section>
        ${blockIndex === 0 && p.extra ? `<p class="project-extra">${p.extra}</p>` : ''}`;
    }).join('');
    const related = PROYECTOS.filter((project) => project.slug !== p.slug && !project.slug.startsWith('obra-ejemplo'))
      .sort((a, b) => Number(b.vertical === p.vertical) - Number(a.vertical === p.vertical)).slice(0, 3);
    detalle.classList.add('project-detail');
    detalle.innerHTML = `
      <h1 class="project-title">${p.titulo}</h1>
      <div class="project-intro">
        <dl class="project-facts">
          ${p.cliente ? `<div><dt>Cliente</dt><dd>${p.cliente}</dd></div>` : ''}
          ${p.servicios ? `<div><dt>Servicio</dt><dd>${p.servicios}</dd></div>` : ''}
          ${p.tecnica ? `<div><dt>Técnica</dt><dd>${p.tecnica}</dd></div>` : ''}
          ${p.medidas ? `<div><dt>Medidas</dt><dd>${p.medidas}</dd></div>` : ''}
          ${p.anio ? `<div><dt>Año</dt><dd>${p.anio}</dd></div>` : ''}
        </dl>
        <p class="project-description">${p.descripcion || ''}</p>
      </div>
      ${imageBlocks}
      ${p.aprendizaje ? `<blockquote class="project-quote">${p.aprendizaje}</blockquote>` : ''}
      ${relatedHTML(related)}`;
    initCarrusel();
  }
}
