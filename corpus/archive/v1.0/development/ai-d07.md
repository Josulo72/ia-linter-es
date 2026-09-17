# photo-renamer

Herramienta de línea de comandos que renombra fotos automáticamente según la fecha de captura.

## Descripción

`photo-renamer` es una utilidad ligera diseñada para organizar colecciones de fotografías sin esfuerzo. Lee los metadatos EXIF de imágenes digitales y renombra los archivos siguiendo un patrón personalizable basado en la fecha de captura, la hora y otros atributos de la foto.

## Características

- Renombrado automático según fecha y hora de captura
- Soporte para múltiples formatos de imagen (JPEG, PNG, TIFF, RAW)
- Patrones de nombres personalizables
- Operación por lotes en directorios completos
- Vista previa de cambios antes de aplicar
- Preservación de archivos originales (opcional)
- Registro de cambios para auditoría

## Requisitos

- Python 3.8 o superior
- piexif (para lectura de metadatos EXIF)
- click (para interfaz de línea de comandos)

## Instalación

```bash
pip install photo-renamer
```

## Uso básico

```bash
photo-renamer /ruta/a/fotos
```

Este comando renombra todas las fotos en el directorio usando el patrón por defecto: `YYYYMMDD_HHMMSS_seqnum.ext`

### Patrones personalizados

```bash
photo-renamer /ruta/a/fotos --pattern "{year}-{month}-{day}_{camera_model}"
photo-renamer /ruta/a/fotos --pattern "{year}/{month}/{day}_{seqnum}"
```

Tokens disponibles: `year`, `month`, `day`, `hour`, `minute`, `second`, `camera_model`, `seqnum`, `iso`, `aperture`.

### Vista previa

```bash
photo-renamer /ruta/a/fotos --preview
```

Muestra los cambios propuestos sin modificar archivos.

### Preservar originales

```bash
photo-renamer /ruta/a/fotos --backup
```

Crea copias de seguridad de los originales antes de renombrar.

## Ejemplos

Organizar fotos por año y mes:

```bash
photo-renamer ~/Descargas --pattern "{year}/{month}/foto_{seqnum}"
```

Agrupar por cámara:

```bash
photo-renamer ~/fotos --pattern "{camera_model}/{year}-{month}-{day}"
```

Combinar con secuencia:

```bash
photo-renamer ~/viaje --pattern "viaje_{seqnum}_{year}{month}{day}"
```

## Notas

Las fotos sin metadatos EXIF se renombran con la fecha de modificación del archivo. Si dos fotos tienen la misma hora, se añade un número secuencial.

## Licencia

MIT