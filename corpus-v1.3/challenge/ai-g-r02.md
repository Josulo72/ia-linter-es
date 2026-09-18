# fecha-foto

fecha-foto renombra muchas fotos de golpe usando la fecha que guardó la cámara en los datos EXIF. En vez de acabar con `IMG_4837.JPG`, `IMG_4838.JPG` y compañía, puedes tener nombres como `2026-08-14_18-32-07.jpg`.

No modifica la imagen ni cambia su fecha de captura. Solo cambia el nombre del archivo.

## Instalación

Necesitas Python 3.10 o posterior.

```bash
pip install fecha-foto
```

Si quieres trabajar con el repositorio:

```bash
git clone https://github.com/ejemplo/fecha-foto.git
cd fecha-foto
pip install -e .
```

## Uso

Pásale una carpeta con fotos:

```bash
fecha-foto ~/Fotos/Vacaciones
```

Por defecto primero enseña qué nombres cambiaría, pero no toca nada. Para hacer los cambios de verdad:

```bash
fecha-foto ~/Fotos/Vacaciones --aplicar
```

El formato normal es este:

```text
2026-08-14_18-32-07.jpg
```

Si dos fotos tienen exactamente la misma fecha y hora, añade un número al final:

```text
2026-08-14_18-32-07.jpg
2026-08-14_18-32-07_02.jpg
```

También puedes añadir un texto fijo.

```bash
fecha-foto ~/Fotos/Viaje --prefijo portugal --aplicar
```

El resultado sería algo como `2026-08-14_18-32-07_portugal.jpg`.

## Fotos sin fecha EXIF

Algunas imágenes no tienen fecha de cámara. Pasa mucho con capturas de pantalla, imágenes descargadas de internet o fotos que han pasado por ciertas aplicaciones.

Por defecto esos archivos se dejan como están. Puedes ver cuáles son con:

```bash
fecha-foto ~/Fotos --sin-fecha
```

No uso la fecha de modificación del archivo como sustituto porque puede haber cambiado al copiar la foto de un disco a otro.

## Formatos

Ahora mismo funciona con JPEG y TIFF. El soporte de HEIC está en pruebas y todavía puede fallar con archivos de algunos móviles.

## Licencia

fecha-foto es software libre y se publica con licencia GPL-3.0.
