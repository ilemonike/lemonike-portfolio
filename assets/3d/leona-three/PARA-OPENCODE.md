# Instrucciones para integrar Leona

Integra este visor Three.js en mi página existente. Primero revisa el framework y la estructura del proyecto. Mantén el diseño de la página y coloca el visor en la sección adecuada; si no está indicada y no se puede inferir, pregúntame dónde.

El archivo index.html contiene el SVG original incrustado, la geometría extruida, los materiales y la pintura. vendor/ incluye las dependencias locales de Three.js. No reconstruyas ni sustituyas el asset.

La integración más sencilla es copiar esta carpeta completa a los archivos públicos del proyecto y embeber index.html?embed=1 en un iframe responsive. Ajusta la ruta al despliegue real. También puedes convertirlo a un componente del framework si es necesario, conservando su funcionalidad y liberando renderer, geometrías, materiales, texturas y listeners al desmontarlo.

Conserva: selector de material y color, profundidad de 2 a 150 (inicial 40), bisel, rugosidad, iconos de pincel y borrador, color y grosor del pincel, deshacer, limpiar y exportación PNG transparente. No agregues texto editable ni los encabezados eliminados ni los botones Frontal/Ver volumen.

En modo pintar o borrar, desactiva el giro. El control activo debe verse seleccionado. Los trazos actualmente son temporales y se pierden al recargar; no prometas persistencia.

Verifica en escritorio y móvil: encuadre, controles accesibles sin recortes, pintura, borrador, deshacer, cambio de materiales y exportación PNG. No uses localhost:8765 en la versión publicada. No publiques sin que yo lo solicite.
