# Melomano

Melomano organiza una carpeta de música desordenada creando una estructura limpia por artista y disco. Lee las etiquetas de cada fichero de audio, decide dónde debe ir y mueve o copia los archivos a su sitio.

## Qué hace

Partiendo de un directorio con ficheros sueltos, Melomano genera una jerarquía del tipo:

```
Musica/
  Radio Futura/
    1984 - La ley del desierto/
      01 - En alas de la noche.mp3
      02 - Semilla negra.mp3
  Extremoduro/
    1996 - Agila/
      01 - Standby.mp3
```

Los ficheros sin etiquetas suficientes se dejan en una carpeta `_sin_clasificar` en lugar de adivinar.

## Formatos admitidos

MP3 (ID3v1 e ID3v2), FLAC, Ogg Vorbis, Opus, M4A y WAV con metadatos RIFF.

## Instalación

```bash
pipx install melomano
```

## Uso básico

```bash
melomano ordenar ~/Descargas/musica --destino ~/Musica
```

Por defecto la operación se ejecuta en modo simulación: muestra lo que haría sin tocar nada. Para aplicar los cambios hay que añadir `--aplicar`.

```bash
melomano ordenar ~/Descargas/musica --destino ~/Musica --aplicar
```

## Opciones principales

| Opción | Descripción |
| --- | --- |
| `--plantilla` | Patrón de rutas. Por defecto `{artista}/{anio} - {album}/{pista:02d} - {titulo}` |
| `--copiar` | Copia en lugar de mover |
| `--artista-album` | Usa la etiqueta de artista del álbum en vez de la de pista |
| `--normalizar` | Elimina acentos y caracteres problemáticos de los nombres |
| `--duplicados` | Qué hacer con colisiones: `omitir`, `renombrar` o `reemplazar` |

## Preguntas frecuentes

**¿Modifica las etiquetas?** No. Melomano solo lee metadatos y mueve ficheros. Para editar etiquetas hay herramientas específicas.

**¿Qué pasa con los recopilatorios?** Si el fichero tiene la marca de recopilación, se agrupa bajo `Varios artistas` conservando el nombre del disco.

**¿Es reversible?** Cada ejecución escribe un registro en `~/.local/share/melomano/`. El comando `melomano deshacer` revierte la última operación aplicada.

## Licencia

MIT. Se agradecen informes de fallos y aportaciones de código en el repositorio del proyecto.
