# FotoFecha

FotoFecha es una utilidad de software libre para renombrar fotografías en bloque utilizando la fecha y hora almacenadas por la cámara en los metadatos EXIF. Su objetivo es sustituir nombres poco descriptivos como `IMG_4832.JPG` por nombres ordenados y fáciles de localizar.

Por ejemplo:

```text
IMG_4832.JPG
```

puede convertirse en:

```text
2026-08-14_18-32-07.jpg
```

## Características

* Lee la fecha de captura desde los metadatos EXIF.
* Renombra cientos o miles de imágenes en una sola operación.
* Permite personalizar el formato del nombre.
* Evita sobrescribir archivos cuando existen fechas duplicadas.
* Incluye un modo de simulación para comprobar los cambios antes de aplicarlos.
* Puede recorrer subcarpetas.
* Compatible con JPEG y otros formatos que contengan metadatos de fecha reconocibles.

## Instalación

FotoFecha requiere Python 3.10 o superior.

```bash
git clone https://example.org/fotofecha.git
cd fotofecha
pip install -r requirements.txt
```

## Uso

Para renombrar las fotografías de una carpeta:

```bash
python fotofecha.py ./mis-fotos
```

Para ver primero qué cambios se realizarían:

```bash
python fotofecha.py ./mis-fotos --simular
```

También puedes elegir un formato personalizado:

```bash
python fotofecha.py ./mis-fotos --formato "%Y-%m-%d_%H-%M-%S"
```

Si dos fotografías tienen exactamente la misma fecha y hora, FotoFecha añade un sufijo incremental para conservar ambos archivos.

## Recomendaciones

Haz una copia de seguridad antes de renombrar colecciones importantes. Algunas imágenes editadas, descargadas de Internet o exportadas por determinadas aplicaciones pueden no conservar la fecha original de la cámara.

## Contribuir

Puedes colaborar corrigiendo errores, añadiendo compatibilidad con nuevos formatos o mejorando la documentación. Las propuestas y solicitudes de cambios son bienvenidas.

## Licencia

FotoFecha se publica bajo la licencia GPL-3.0. Consulta `LICENSE` para conocer las condiciones completas.
