trocea es una biblioteca para partir un archivo grande en trozos más pequeños y volver a juntarlos después, sin depender de zip ni de ninguna herramienta del sistema.

La hice pensando en subir archivos a sitios que ponen un límite de tamaño, o para mandar algo por partes cuando la conexión es mala y prefieres que si falla un trozo no tengas que volver a mandar el archivo entero.

## Instalación

```
pip install trocea
```

## Uso

```python
from trocea import partir, unir

partir("video.mp4", tamano_mb=50, salida="trozos/")
# genera video.mp4.001, video.mp4.002, etc.

unir("trozos/", salida="video_reconstruido.mp4")
```

Cada trozo lleva un hash SHA-256 en un archivo `.json` que se genera junto a los trozos, así que al unir comprueba que ninguno se ha corrompido por el camino. Si falta un trozo o no coincide el hash, avisa con un error claro en vez de darte un archivo roto sin decir nada.

## Qué falta

No cifra los trozos, si necesitas eso tienes que cifrar el archivo antes de partirlo, con otra herramienta. Tampoco comprime, parte el archivo tal cual está, así que el tamaño total de los trozos es el mismo que el del archivo original.

Lo he probado con archivos de hasta 20 GB sin problema. Con más no lo he probado y no sé qué tal iría, la biblioteca lee por bloques así que en teoría no debería depender de la memoria RAM que tengas, pero no lo garantizo hasta probarlo.

Licencia MIT.
