# Integrar Leona en una página

Sube la carpeta `leona-three` completa a tu sitio, conservando `vendor`. Inserta este bloque donde quieras mostrarla:

```html
<iframe
  src="/leona-three/index.html?embed=1"
  title="Personaliza Leona en 3D"
  style="width:100%;height:780px;border:0;border-radius:20px"
  loading="lazy">
</iframe>
```

No necesita servidor de aplicación ni claves: son archivos estáticos. Usa HTTPS al publicarlo. La dirección localhost es solo de vista previa y no sirve para visitantes. Los trazos viven en memoria hasta exportar PNG; al recargar se pierden.
