# Notas de la versión 2.0

Esta versión introduce cambios importantes en la arquitectura interna de la aplicación y en la forma de organizar las notas. Recomendamos leer esta página completa antes de actualizar, especialmente el apartado de cambios incompatibles.

## Novedades

- **Espacios de trabajo**: ahora es posible organizar las notas en espacios de trabajo independientes, cada uno con su propia configuración, plantillas y ajustes de sincronización. Útil para separar notas personales de proyectos de trabajo.
- **Editor de bloques**: el editor de texto plano se sustituye por un sistema de bloques que permite reordenar párrafos, imágenes, listas y tablas arrastrándolos directamente.
- **Búsqueda semántica**: además de la búsqueda por palabra clave, la aplicación ahora permite buscar por significado, encontrando notas relacionadas aunque no compartan los términos exactos.
- **Vinculación bidireccional**: al enlazar una nota con otra usando `[[nombre]]`, ambas notas muestran automáticamente la referencia cruzada en un panel lateral.
- **Modo sin conexión mejorado**: la sincronización ahora resuelve conflictos de edición simultánea de forma automática en la mayoría de los casos, en lugar de duplicar la nota como ocurría en la versión 1.x.
- **Exportación a más formatos**: se añade exportación nativa a PDF, DOCX y Markdown con metadatos, además del formato propio ya existente.
- **Temas personalizables**: se pueden crear e importar temas de color propios, más allá de los modos claro y oscuro predefinidos.

## Cambios incompatibles

Antes de actualizar, ten en cuenta lo siguiente:

- **Formato de almacenamiento**: las notas creadas o editadas en la versión 2.0 usan un nuevo formato de archivo interno. La actualización migra automáticamente las notas existentes, pero **no es posible volver a la versión 1.x** una vez completada la migración sin restaurar una copia de seguridad previa.
- **API de plugins**: la API utilizada por extensiones de terceros ha cambiado de forma sustancial. Los plugins desarrollados para la versión 1.x dejarán de funcionar y deberán ser actualizados por sus autores para ser compatibles con la nueva versión.
- **Eliminación de las etiquetas anidadas con el separador `/`**: las etiquetas que usaban `/` para crear jerarquías (por ejemplo, `trabajo/proyectos`) se convierten en etiquetas planas independientes. Se recomienda revisar el sistema de etiquetas antes de actualizar si se depende de esta jerarquía.
- **Cambios en atajos de teclado**: varios atajos por defecto se han reasignado para evitar conflictos con las nuevas funciones del editor de bloques. La lista completa de atajos modificados está disponible en la sección de configuración.
- **Fin del soporte para la versión antigua de sincronización**: los dispositivos que ejecuten versiones anteriores a la 1.8 no podrán sincronizar con cuentas que ya hayan actualizado a la versión 2.0.

## Recomendaciones antes de actualizar

1. Realiza una copia de seguridad completa de tus notas desde el menú de configuración.
2. Comprueba que los plugins que utilizas tienen una versión compatible publicada por sus autores.
3. Revisa tu sistema de etiquetas si usas jerarquías con `/`.
4. Actualiza primero un solo dispositivo y confirma que todo funciona correctamente antes de actualizar el resto.

## Soporte

Si encuentras algún problema durante la actualización, puedes consultar la documentación ampliada o abrir una incidencia en el canal de soporte habitual. El equipo seguirá dando soporte a la versión 1.x durante un periodo transitorio, aunque no recibirá nuevas funciones.
