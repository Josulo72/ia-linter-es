limpiafotos quita los metadatos EXIF de tus fotos antes de subirlas a internet: la ubicación GPS, el modelo de cámara o de móvil, la fecha exacta, todo eso que va escondido dentro del archivo y que casi nadie mira.

Lo hice después de darme cuenta de que llevaba años publicando fotos con la ubicación exacta de mi casa metida en el archivo, sin saberlo. Con esto le pasas una carpeta de fotos y te devuelve copias limpias, dejando los originales intactos.

## Instalación

```
pip install limpiafotos
```

## Uso

```
limpiafotos ./fotos_vacaciones --salida ./fotos_para_subir
```

Por defecto quita todos los metadatos. Si quieres conservar algo, por ejemplo la orientación de la foto para que no se vea girada, usa `--conservar orientacion`.

```
limpiafotos ./fotos_vacaciones --salida ./fotos_para_subir --conservar orientacion
```

Funciona con JPEG y PNG. Con HEIC, el formato de los iPhone, hace falta tener instalado `libheif` en el sistema, si no lo tienes, esas fotos las salta y te avisa por la terminal.

## Qué falta

No toca los metadatos que algunas redes sociales añaden después, al subir la foto, eso ya no depende de mí. Tampoco limpia vídeos, solo imágenes, aunque lo tengo en la lista porque los vídeos llevan el mismo problema de ubicación.

Con carpetas de miles de fotos va un poco lento porque procesa una por una, en algún momento lo paralelizaré.

Licencia MIT.
