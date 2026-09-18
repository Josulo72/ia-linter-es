# Apuntaweb

Apuntaweb convierte una carpeta de apuntes en Markdown en una web estática. Escribes tus `.md`, ejecutas un comando y te deja el HTML listo para subir donde quieras. No necesita base de datos ni servidor.

La idea es poder mantener apuntes como ficheros normales, con Git si te viene bien, sin tener que escribir HTML cada vez que cambias una línea.

## Uso

Necesitas Python 3.11 o posterior.

```bash
pip install apuntaweb
```

Pon los apuntes en una carpeta:

```text
apuntes/
├── index.md
├── redes.md
└── bases-de-datos.md
```

Y genera la web:

```bash
apuntaweb build apuntes
```

El resultado queda en `public/`. Puedes abrir `public/index.html` directamente o subir esa carpeta a GitHub Pages, Netlify, un servidor con nginx o cualquier sitio que sirva archivos estáticos.

Los títulos, enlaces, listas, tablas y bloques de código de Markdown se convierten a HTML. Si un documento enlaza a `redes.md`, Apuntaweb cambia el enlace para que apunte a la página HTML correspondiente.

También hay un modo para trabajar mientras escribes:

```bash
apuntaweb serve apuntes
```

Levanta una web local y vuelve a generar las páginas cuando guardas un fichero.

## Configuración

Puedes crear `apuntaweb.toml` en la raíz para cambiar el nombre de la web, el idioma y algunas cosas del HTML generado.

```toml
title = "Apuntes de sistemas"
lang = "es"
```

De momento el diseño es bastante básico y solo hay un tema. Quiero añadir plantillas personalizadas y una tabla de contenidos automática para documentos largos.

## Licencia

Apuntaweb se publica con licencia MIT.
