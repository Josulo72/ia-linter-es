# FotoLimpia

FotoLimpia es una herramienta de software libre para eliminar metadatos de fotografías antes de publicarlas o compartirlas. Su objetivo es reducir la información privada que puede quedar incrustada en una imagen, como coordenadas GPS, modelo de cámara, fecha de captura, número de serie del dispositivo o datos del software utilizado para editarla.

## Características

* Elimina metadatos EXIF, IPTC y XMP.
* Conserva la imagen visible sin modificar su resolución.
* Permite procesar una sola fotografía o una carpeta completa.
* Puede mostrar qué metadatos se eliminarán antes de realizar cambios.
* Admite JPEG, PNG, TIFF y WebP.
* Funciona desde la línea de comandos.
* No necesita conexión a Internet.

## Instalación

Requiere Python 3.10 o superior.

```bash
git clone https://example.org/fotolimpia.git
cd fotolimpia
pip install -e .
```

## Uso

Para limpiar una imagen:

```bash
fotolimpia foto.jpg
```

Por defecto, FotoLimpia crea una copia limpia y conserva el archivo original.

Para procesar todas las imágenes de una carpeta:

```bash
fotolimpia ./vacaciones --recursive
```

Para consultar los metadatos detectados sin modificar nada:

```bash
fotolimpia foto.jpg --inspect
```

## Privacidad

Todo el procesamiento se realiza de forma local. FotoLimpia no sube imágenes, metadatos ni estadísticas a servidores externos.

Eliminar metadatos puede reducir la exposición accidental de información, pero no garantiza el anonimato de una fotografía. El propio contenido visual puede revelar lugares, personas u otros datos identificables.

## Contribuir

Las contribuciones son bienvenidas. Puedes abrir una incidencia para informar de errores, proponer mejoras o enviar una solicitud de cambios.

Antes de enviar código, ejecuta las pruebas:

```bash
pytest
```

## Licencia

FotoLimpia se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para conocer los términos completos.
