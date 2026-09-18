# Meloteca

Meloteca es una herramienta de software libre para ordenar automáticamente una colección de música almacenada en una carpeta. Lee los metadatos de los archivos de audio y los organiza en directorios separados por artista y disco, evitando tener que clasificar manualmente bibliotecas grandes.

La estructura generada tiene este aspecto:

```text
Musica/
├── Artista A/
│   ├── Disco 1/
│   │   ├── 01 - Canción.ogg
│   │   └── 02 - Otra canción.ogg
│   └── Disco 2/
└── Artista B/
    └── Álbum/
```

## Características

* Organización por artista y álbum.
* Lectura de etiquetas habituales como artista, disco, título y número de pista.
* Compatibilidad con MP3, FLAC, OGG y M4A.
* Renombrado opcional de las canciones.
* Modo de simulación para comprobar los cambios antes de mover archivos.
* Tratamiento separado de canciones sin metadatos.
* Detección de posibles conflictos de nombres.
* Registro de todas las operaciones realizadas.

## Instalación

```bash
git clone https://example.org/meloteca.git
cd meloteca
pip install .
```

Después de la instalación estará disponible el comando `meloteca`.

## Uso

Para organizar el contenido de una carpeta:

```bash
meloteca ordenar ~/Descargas/Musica --destino ~/Musica
```

Antes de modificar nada es recomendable utilizar el modo de simulación:

```bash
meloteca ordenar ~/Descargas/Musica --destino ~/Musica --simular
```

Si quieres copiar los archivos en lugar de moverlos:

```bash
meloteca ordenar ./entrada --destino ./biblioteca --copiar
```

Los archivos que no contengan información suficiente pueden enviarse a una carpeta especial llamada `Sin clasificar`.

## Seguridad

Meloteca nunca elimina archivos deliberadamente. Aun así, se recomienda conservar una copia de seguridad antes de reorganizar una biblioteca importante y ejecutar primero `--simular`.

## Contribuciones

Puedes abrir una incidencia para comunicar errores o proponer mejoras. También se aceptan solicitudes de cambios acompañadas de pruebas.

## Licencia

Este proyecto se publica bajo la licencia GPL-3.0.
