# libconfvieja

`libconfvieja` es una biblioteca en C con enlaces para Python que lee y escribe ficheros de configuración en formato INI-EXT, el que usaban las aplicaciones de escritorio de los años noventa y que todavía sobrevive en sistemas industriales y en software heredado.

## Motivación

El formato no está estandarizado. Cada implementación histórica añadió sus propias particularidades: comentarios con punto y coma o con almohadilla, secciones anidadas con barras, valores continuados en varias líneas, codificaciones de página de código distintas según el idioma del sistema. Los analizadores modernos de INI fallan con estos ficheros o, peor, los leen mal en silencio.

`libconfvieja` reproduce el comportamiento original con fidelidad y, sobre todo, conserva intacto lo que no se modifica.

## Principio de mínima alteración

Al escribir, la biblioteca mantiene el orden de las claves, los comentarios, los espacios de sangrado y los finales de línea originales. Si se cambia una sola clave, el resto del fichero queda byte a byte como estaba. Esto permite usarla en migraciones sin generar diferencias inmanejables en el control de versiones.

## Compilación

```bash
meson setup build
meson compile -C build
meson test -C build
sudo meson install -C build
```

## Uso en C

```c
#include <confvieja.h>

cv_doc *doc = cv_abrir("sistema.cfg", CV_CP437);
const char *valor = cv_leer(doc, "Impresora", "Puerto");
cv_escribir(doc, "Impresora", "Puerto", "LPT2");
cv_guardar(doc, NULL);
cv_cerrar(doc);
```

## Uso en Python

```python
import confvieja

doc = confvieja.abrir("sistema.cfg", codificacion="cp437")
doc["Impresora"]["Puerto"] = "LPT2"
doc.guardar()
```

## Codificaciones

Se admiten CP437, CP850, CP1252, ISO-8859-1, ISO-8859-15 y UTF-8 con y sin marca de orden. Si no se indica ninguna, la biblioteca intenta deducirla a partir de los bytes presentes y avisa cuando la deducción es dudosa.

## Limitaciones conocidas

- No se admiten valores binarios incrustados en base64, presentes en algunas variantes propietarias.
- Las secciones duplicadas se fusionan al leer, pero al guardar se escriben unificadas.

## Licencia

MPL-2.0. Las aportaciones se aceptan por correo en la lista del proyecto o mediante solicitudes de cambio en el repositorio.
