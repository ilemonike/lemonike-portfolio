# Portafolio Arte / Diseño — GitHub Pages

Puro HTML/CSS/JS, sin terceros.

## Cómo agregar un proyecto (replicable)
1. Copia un bloque en `js/data.js`
2. Cambia `slug`, `titulo`, imágenes en `assets/`
3. Listo: aparece solo en `arte.html` o `diseno.html` y en `proyecto.html?slug=...`

## Probar local
```sh
python3 -m http.server
# abre http://localhost:8000
```

## Subir a GitHub Pages
1. Crea repo, sube estos archivos a rama `main`
2. Settings → Pages → Deploy from branch → `main` / root
3. Tu URL: `https://tu-usuario.github.io/tu-repo/`

Usa rutas relativas (ya están así). No uses `/css/...` con slash inicial.

## Figma
Pasa link con lectura. Cambiamos en `css/style.css`:
colores, tipografías, cards, hero split, ficha proyecto.
Codex puede pulir ahí sin romper `data.js`.
