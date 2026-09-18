# BuscaDuplicados

BuscaDuplicados encuentra archivos repetidos dentro de una carpeta y sus subcarpetas. Le das una ruta, la recorre y te enseña qué documentos son iguales aunque tengan nombres distintos.

No decide por el nombre del archivo. Primero compara el tamaño y, cuando hay coincidencias, calcula el hash del contenido. Así no marca como duplicados dos `factura.pdf` que en realidad son documentos diferentes.

Funciona con cualquier tipo de archivo. PDF, documentos de LibreOffice, fotos, ZIP o lo que tengas guardado por ahí.

## Uso

Necesitas Python 3.11 o posterior.

```bash
git clone https://github.com/usuario/buscaduplicados.git
cd buscaduplicados
python -m pip install .
```

Para revisar una carpeta:

```bash
buscaduplicados ~/Documentos
```

La salida es parecida a esta:

```text
3 copias, 428 KB cada una

/home/ana/Documentos/factura.pdf
/home/ana/Documentos/copias/factura-vieja.pdf
/home/ana/Descargas/factura_2024.pdf
```

Por defecto no borra nada. Solo busca y muestra los grupos de archivos repetidos. Si quieres guardar el resultado para mirarlo después puedes sacarlo como JSON:

```bash
buscaduplicados ~/Documentos --json duplicados.json
```

También puedes excluir carpetas:

```bash
buscaduplicados ~/Documentos --ignorar .git node_modules copias
```

## Qué hace y qué no

Los archivos se consideran iguales solo cuando su contenido es idéntico byte a byte. Dos PDF que se ven iguales pero llevan metadatos distintos no cuentan como duplicados.

De momento tampoco busca fotos parecidas ni versiones casi idénticas de un documento. Eso requeriría comparar el contenido de otra forma y prefiero mantener esta herramienta predecible.

Con carpetas grandes puede tardar un rato la primera vez, sobre todo si hay muchos archivos del mismo tamaño. No carga los archivos enteros en memoria, así que debería aguantar bien colecciones bastante grandes.

## Licencia

El código está publicado bajo la licencia MIT.
