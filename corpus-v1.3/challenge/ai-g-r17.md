# CarpetaOjo

CarpetaOjo vigila una carpeta y avisa cuando aparece un fichero nuevo. Lo puedes dejar corriendo en segundo plano para controlar descargas, ficheros que deja otro programa o una carpeta compartida.

No toca los archivos. Solo mira qué hay y lanza el aviso.

## Instalación

Necesitas Python 3.10 o posterior.

```bash
pip install carpetaojo
```

Para vigilar una carpeta:

```bash
carpetaojo ~/Descargas
```

A partir de ahí, si aparece `informe.pdf`, verás algo parecido a esto:

```text
Nuevo fichero: /home/ana/Descargas/informe.pdf
```

También puedes hacer que ejecute un comando cada vez que llega algo:

```bash
carpetaojo ~/entrada --exec 'echo "{file}"'
```

`{file}` se sustituye por la ruta completa del fichero nuevo. Esto viene bien para enganchar CarpetaOjo a un script propio, mandar una notificación o empezar otro proceso.

Por defecto solo avisa de archivos creados después de arrancar. Lo que ya estaba en la carpeta se ignora.

## Filtros

Puedes limitar lo que quieres vigilar por extensión:

```bash
carpetaojo ~/entrada --ext pdf --ext csv
```

Y con `--recursive` también mira las subcarpetas:

```bash
carpetaojo ~/proyectos --recursive
```

He intentado que el programa haga poco y sea predecible. Si se mueve un fichero dentro de la carpeta, según el sistema operativo puede llegar como creación de un fichero nuevo. Es una de las cosas que todavía quiero afinar.

Funciona en Linux, macOS y Windows. Las notificaciones de escritorio no están disponibles igual en todos los sistemas, así que el aviso por terminal es el comportamiento base.

## Licencia

CarpetaOjo usa la licencia GPL-3.0.
