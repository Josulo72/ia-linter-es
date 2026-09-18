# Ordenamus

Ordenamus ordena la música de una carpeta usando las etiquetas de los propios archivos. Lee el artista, el disco y el número de pista, crea las carpetas que hagan falta y mueve cada canción a su sitio.

Por ejemplo, esto:

```text
musica/
  pista01.mp3
  pista02.flac
  cosa-que-baje-ayer.mp3
```

puede acabar así:

```text
musica/
  Massive Attack/
    Mezzanine/
      01 - Angel.mp3
      02 - Risingson.flac
```

Funciona con MP3, FLAC, OGG y M4A. No intenta sacar el artista del nombre del fichero. Si una canción no tiene las etiquetas necesarias, la deja donde está y lo avisa.

## Instalación

Necesitas Python 3.10 o posterior.

```bash
git clone https://github.com/ejemplo/ordenamus.git
cd ordenamus
pip install .
```

Antes de mover nada puedes ver qué haría:

```bash
ordenamus ~/Música --dry-run
```

Si el resultado te cuadra:

```bash
ordenamus ~/Música
```

Por defecto crea una estructura `Artista/Disco/NN - Título.ext`. También se puede cambiar la plantilla:

```bash
ordenamus ~/Música --formato "{artista}/{año} - {disco}/{pista} {titulo}"
```

Cuando encuentra dos archivos que acabarían con el mismo nombre, no sobrescribe ninguno. Para, muestra el conflicto y sigue con el resto.

He intentado que haga pocas cosas y que las haga de forma previsible. No descarga carátulas, no corrige etiquetas y no consulta MusicBrainz ni ningún otro servicio. Trabaja solo con lo que ya tienen los archivos.

Conviene probar primero con `--dry-run`, sobre todo si la carpeta es grande o lleva años acumulando música con etiquetas raras.

Está publicado bajo licencia GPL-3.0.
