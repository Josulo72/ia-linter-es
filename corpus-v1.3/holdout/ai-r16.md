# ApuntesWeb

ApuntesWeb es una herramienta de software libre que convierte una colección de apuntes escritos en Markdown en una web estática lista para publicar. Está pensada para estudiantes, docentes, equipos de documentación y cualquier persona que quiera mantener sus contenidos en archivos de texto sencillos sin renunciar a una navegación cómoda desde el navegador.

El proyecto recorre una carpeta de archivos `.md`, transforma cada documento a HTML y genera automáticamente índices, enlaces internos y una estructura de navegación. El resultado no necesita base de datos ni servidor de aplicaciones: basta con copiar la carpeta generada a cualquier alojamiento capaz de servir archivos estáticos.

## Características

* Conversión de Markdown a HTML.
* Navegación automática entre carpetas y documentos.
* Índice general generado a partir de la estructura de archivos.
* Soporte para bloques de código, tablas, listas y enlaces.
* Plantillas personalizables.
* Generación completamente local.
* Salida compatible con alojamientos estáticos.

## Instalación

```bash
git clone https://example.org/apuntesweb.git
cd apuntesweb
pip install -e .
```

## Uso

Guarda tus apuntes dentro de una carpeta, por ejemplo:

```text
apuntes/
├── matematicas.md
├── historia.md
└── programacion/
    └── python.md
```

Después ejecuta:

```bash
apuntesweb build apuntes/ --output sitio/
```

La web generada quedará en `sitio/`. Puedes abrir `sitio/index.html` directamente o publicarla mediante cualquier servidor web.

Para regenerar el sitio automáticamente mientras editas:

```bash
apuntesweb watch apuntes/
```

## Configuración

Puedes crear un archivo `apuntesweb.toml` para definir el nombre del sitio, la plantilla, el idioma y otras opciones de generación.

## Contribuir

Las contribuciones son bienvenidas. Puedes abrir una incidencia para informar de errores o proponer mejoras, o enviar un *pull request* con tus cambios.

## Licencia

ApuntesWeb se distribuye bajo la licencia MIT.
