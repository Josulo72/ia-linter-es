# CarpetaAlerta

CarpetaAlerta es una pequeña utilidad de software libre que vigila una carpeta del sistema y avisa cuando aparece un fichero nuevo. Puede utilizarse para controlar directorios de descargas, carpetas compartidas, exportaciones automáticas, resultados de procesos o cualquier ubicación en la que interese reaccionar ante la llegada de nuevos archivos.

La aplicación funciona en segundo plano y mantiene la vigilancia mediante eventos del sistema de archivos, evitando comprobaciones continuas innecesarias siempre que la plataforma lo permita.

## Características

* Vigilancia en tiempo real de una carpeta.
* Detección de nuevos ficheros.
* Notificaciones en el escritorio.
* Registro opcional de eventos.
* Filtros por extensión.
* Modo recursivo para incluir subcarpetas.
* Ejecución sencilla desde la línea de comandos.
* Compatible con Linux, macOS y Windows.

## Instalación

```bash
git clone https://example.org/carpeta-alerta.git
cd carpeta-alerta
pip install -e .
```

También puedes instalar una versión publicada:

```bash
pip install carpeta-alerta
```

## Uso

Para vigilar una carpeta:

```bash
carpeta-alerta ~/Descargas
```

Cuando aparezca un nuevo fichero, la aplicación mostrará una notificación con su nombre y ubicación.

Para incluir subdirectorios:

```bash
carpeta-alerta ~/Documentos --recursivo
```

Para recibir avisos solo de archivos PDF:

```bash
carpeta-alerta ~/Entrada --extension .pdf
```

El registro de eventos puede guardarse en un archivo:

```bash
carpeta-alerta ~/Entrada --log eventos.log
```

## Casos de uso

CarpetaAlerta puede resultar útil para detectar nuevas descargas, supervisar carpetas sincronizadas, controlar la llegada de facturas o informes y comprobar si otro programa ha generado correctamente sus archivos de salida.

## Contribuir

Se aceptan informes de errores, propuestas de nuevas funciones y *pull requests*. Antes de enviar cambios importantes, se recomienda abrir una incidencia para comentar la propuesta.

## Licencia

CarpetaAlerta se distribuye bajo la licencia GPL-3.0.
