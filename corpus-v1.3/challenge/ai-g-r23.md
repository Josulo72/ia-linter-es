# Trocea

Trocea es una biblioteca de Python para partir ficheros grandes en trozos y volver a juntarlos después. No interpreta lo que hay dentro. Para ella un vídeo, una copia de seguridad o un fichero de datos son simplemente bytes.

La uso cuando un fichero no cabe en el medio por el que tengo que moverlo o cuando quiero procesarlo por partes sin cargarlo entero en memoria.

## Instalación

```bash
pip install trocea
```

Necesita Python 3.9 o posterior y no tiene dependencias externas.

## Partir un fichero

```python
from trocea import partir

partir(
    "copia.tar",
    destino="trozos/",
    tamano=100 * 1024 * 1024,
)
```

Esto crea ficheros de 100 MiB:

```text
trozos/
├── copia.tar.0001
├── copia.tar.0002
├── copia.tar.0003
└── copia.tar.trocea.json
```

El fichero JSON guarda el nombre original, el tamaño, el número de partes y el SHA-256 de cada una.

También se puede usar desde terminal:

```bash
trocea partir copia.tar --tamano 100MiB --destino trozos/
```

## Volver a juntarlo

Desde Python:

```python
from trocea import juntar

juntar(
    "trozos/copia.tar.trocea.json",
    salida="copia-restaurada.tar",
)
```

O desde terminal:

```bash
trocea juntar trozos/copia.tar.trocea.json
```

Antes de escribir el fichero final se comprueba cada parte. Si falta una, está truncada o su hash no coincide, se lanza un error y no se da el resultado por bueno.

## Sin cargarlo entero en RAM

Tanto `partir()` como `juntar()` trabajan por bloques. He probado ficheros de varios cientos de gigabytes con un consumo de memoria prácticamente constante.

No hay compresión ni cifrado. Si necesitas cualquiera de las dos cosas, hazlo antes de partir el fichero. Tampoco hay subida a S3, Google Drive ni servicios parecidos. La biblioteca solo lee y escribe ficheros.

## Licencia

Trocea se publica bajo licencia BSD de 3 cláusulas.
