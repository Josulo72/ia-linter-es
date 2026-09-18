# md2site

Tomas tus apuntes en Markdown, los metes en una carpeta, y el proyecto te genera una web estática lista para publicar. Sin base de datos, sin servidor, solo archivos HTML que puedes hostear en GitHub Pages o donde sea.

Pensado para cuando tienes muchísimas notas ordenadas en carpetas y quieres que sean accesibles desde un navegador con un buscador que funcione, índice, navegación entre archivos, todo eso.

## Cómo se instala

```
npm install -g md2site
```

O clona el repo y corre `npm install` en la carpeta.

## Uso básico

Mete tus archivos Markdown en una carpeta. Luego:

```
md2site input/ output/
```

Esperas un poco y en la carpeta `output/` tienes la web generada. Entra por `index.html` y navega. Tan fácil como eso.

## Características

Convierte automáticamente los títulos en una navegación. Los enlaces entre Markdown (si pones `[esto](./otro.md)`) se convierten a HTML correctamente. Las imágenes se copian. El código con colores funciona. Genera un sitemap para Google. Y la búsqueda es local: funciona sin javascript complicado, desde el navegador.

## Personalización

Hay una carpeta de templates si quieres cambiar cómo se ve. CSS por defecto es responsivo y funciona en móviles. El color, las fuentes, todo se puede cambiar editando un fichero de configuración.

## Lo que no hace

No soporta Markdown muy complejo con plugins raros. Si usas GitLab o Obsidian syntax que sale del estándar, probablemente te de problemas. Tampoco genera dinámico, es estático, así que si necesitas un servidor y contactos, esto no vale.

## Por qué usarlo

Es rápido. Genera todo en segundos. Los archivos son pequeños. Puedes editarlos cuando quieras y regenerar. Y no tienes que aprender un CMS nuevo.

## Contribuir

Si encuentras una sintaxis Markdown que no se procesa bien, reporta un issue con un ejemplo. Aceptamos PRs para nuevas features si son simples.

MIT License. Usa, mejora, comparte.
