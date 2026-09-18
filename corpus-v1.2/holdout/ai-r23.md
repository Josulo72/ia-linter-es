# fragmenta

Biblioteca para partir ficheros grandes en trozos más pequeños y volver a juntarlos posteriormente, manteniendo la integridad de los datos originales. Disponible para Python y como utilidad de línea de comandos.

## ¿Para qué sirve?

Existen situaciones en las que no se puede transferir un archivo grande de una sola vez: límites de tamaño en un servicio de correo, restricciones de una unidad USB con un sistema de archivos antiguo, o la necesidad de subir un archivo por partes a un servidor con poca capacidad. `fragmenta` divide cualquier archivo en fragmentos del tamaño que se indique y permite reconstruirlo íntegramente más tarde.

## Instalación

```bash
pip install fragmenta
```

## Uso desde la línea de comandos

Dividir un archivo en trozos de 100 MB:

```bash
fragmenta dividir video.mp4 --tamano 100M
```

Esto genera archivos como `video.mp4.001`, `video.mp4.002`, etc., junto con un archivo de control `video.mp4.manifest` que contiene la suma de comprobación de cada fragmento.

Reconstruir el archivo original:

```bash
fragmenta unir video.mp4.manifest
```

## Uso como biblioteca en Python

```python
from fragmenta import dividir, unir

dividir("video.mp4", tamano="100M", destino="./partes")
unir("./partes/video.mp4.manifest", destino="video_reconstruido.mp4")
```

## Verificación de integridad

Cada fragmento incluye una suma SHA-256 en el manifiesto. Al reconstruir el archivo, `fragmenta` comprueba automáticamente que cada parte no haya sido alterada ni esté corrupta, y avisa si falta algún fragmento.

## Compresión opcional

Es posible comprimir los fragmentos antes de generarlos:

```bash
fragmenta dividir informe.pdf --tamano 10M --comprimir
```

## Rendimiento

La biblioteca procesa los archivos por bloques, por lo que el consumo de memoria se mantiene bajo incluso con archivos de varios gigabytes.

## Tests

```bash
pytest
```

## Contribuir

Si detectas un error o quieres proponer una mejora, abre un *issue* en el repositorio. Las *pull requests* deben incluir pruebas para el código nuevo.

## Licencia

Publicado bajo licencia MIT.
