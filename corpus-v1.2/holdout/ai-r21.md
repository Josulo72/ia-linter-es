# LimpiaMetadatos

Herramienta de línea de comandos para eliminar los metadatos de fotografías antes de publicarlas en internet. Elimina información sensible como la ubicación GPS, el modelo de cámara, la fecha exacta de la toma y otros datos EXIF que no siempre conviene compartir públicamente.

## ¿Por qué es necesario?

Muchas fotografías tomadas con cámaras y teléfonos móviles incluyen metadatos EXIF que revelan más información de la que el usuario imagina, como las coordenadas exactas del lugar donde se hizo la foto. `LimpiaMetadatos` procesa las imágenes y elimina esos datos antes de subirlas a redes sociales, blogs o cualquier plataforma pública.

## Instalación

```bash
pip install limpiametadatos
```

También puede instalarse desde el código fuente:

```bash
git clone https://github.com/usuario/limpiametadatos.git
cd limpiametadatos
pip install .
```

## Uso

Limpiar una sola imagen:

```bash
limpiametadatos foto.jpg
```

Limpiar todas las imágenes de una carpeta, incluyendo subcarpetas:

```bash
limpiametadatos --recursivo ./fotos/
```

Por defecto, la herramienta crea una copia limpia y conserva el original. Para sobrescribir directamente los archivos:

```bash
limpiametadatos --sobrescribir foto.jpg
```

## Metadatos eliminados

- Coordenadas GPS.
- Fecha y hora de captura.
- Modelo y marca de la cámara o el teléfono.
- Software utilizado para editar la imagen.
- Miniaturas incrustadas.

## Opciones avanzadas

Es posible conservar algunos campos concretos usando la opción `--conservar`:

```bash
limpiametadatos --conservar orientacion,colorspace foto.jpg
```

## Formatos soportados

JPEG, PNG, TIFF y WebP.

## Tests

```bash
pytest
```

## Contribuir

Las contribuciones son bienvenidas, especialmente para añadir soporte a nuevos formatos de imagen o a metadatos específicos de ciertos fabricantes de cámaras.

## Licencia

Distribuido bajo licencia MIT.
