# FolderWatch

Vigila una carpeta y te avisa cuando alguien tira un archivo nuevo dentro. Útil para monitorizar carpetas compartidas, directorios de descargas, o cualquier sitio donde esperabas que llegara un fichero.

Cuando detecta algo nuevo, te manda una notificación. Tú decides si quieres que sea un beep, un email, una llamada a una URL, lo que necesites.

## Instalar

```
npm install folder-watch
```

O descarga el ejecutable de releases si quieres algo que funcione directo sin dependencias.

## Usar

```javascript
const watch = require('folder-watch');

watch('/ruta/a/vigilar', (archivo) => {
  console.log(`Llegó: ${archivo}`);
});
```

Y listo. Mientras el proceso está corriendo, monitoriza esa carpeta. Cuando llega algo nuevo, se ejecuta la función.

## Más opciones

Puedes filtrar por extensión. Solo .pdf, solo .zip, lo que sea:

```javascript
watch('/descargas', {
  filter: '*.pdf'
}, (archivo) => {
  console.log(`PDF nuevo: ${archivo}`);
});
```

También hay opciones para ignorar archivos temporales, ocultos, o cosas que están siendo copiadas todavía.

## Notificaciones

Viene con integraciones para enviar notificaciones desktop, email, o webhooks. Si quieres algo más raro, la API está abierta para que lo hagas tú.

## Limitaciones

Depende del sistema de archivos. En Windows NTFS es rápido. En algunos sistemas más lentos o remotos, puede haber pequeños delays. Redes compartidas van más lento que discos locales. Pero en general, detect cosas en menos de un segundo.

## Casos de uso

Alguien sube un ticket a una carpeta y el sistema genera automáticamente un caso. Monitoriza una carpeta de backups y avisa si no llega nada en 24 horas. Vigila logs nuevos y ejecuta un análisis. Los usos son infinitos.

## Contribuir

Si te toca un caso edge donde no funciona bien, cuéntanos. Tests en Mocha si quieres revisar la lógica.

MIT License. Libre de usar y modificar.
