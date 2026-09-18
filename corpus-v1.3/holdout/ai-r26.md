# Duplicados

**Duplicados** es una herramienta de software libre para localizar archivos repetidos dentro de una carpeta de documentos. Está pensada para ayudar a ordenar archivos personales, carpetas compartidas, copias de seguridad y repositorios donde pueden acumularse varias copias del mismo contenido con nombres diferentes.

La aplicación compara los archivos por su contenido, no únicamente por el nombre. Primero agrupa los candidatos por tamaño y después calcula una huella digital de cada archivo para identificar duplicados reales. De esta forma, `informe.pdf` y `copia_informe.pdf` pueden detectarse como iguales aunque tengan nombres distintos.

## Características

* Búsqueda recursiva en subcarpetas.
* Comparación mediante hashes.
* Exclusión de extensiones o directorios.
* Salida legible en terminal.
* Exportación de resultados a JSON.
* Modo seguro: nunca elimina archivos automáticamente.

## Instalación

Requiere Python 3.10 o posterior.

```bash
git clone https://example.org/duplicados.git
cd duplicados
pip install .
```

También puede instalarse en modo de desarrollo:

```bash
pip install -e .
```

## Uso

Para analizar una carpeta:

```bash
duplicados ~/Documentos
```

Para guardar el resultado:

```bash
duplicados ~/Documentos --json resultado.json
```

Para ignorar determinados tipos de archivo:

```bash
duplicados ~/Documentos --ignorar .tmp .bak
```

El programa muestra los grupos de archivos idénticos junto con su tamaño y ubicación. La decisión de conservar o borrar cada copia queda siempre en manos del usuario.

## Desarrollo

Las contribuciones son bienvenidas. Puedes abrir una incidencia para comunicar errores o proponer mejoras. Para ejecutar las pruebas:

```bash
pytest
```

Procura incluir pruebas para cualquier cambio de comportamiento.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Puedes usarlo, modificarlo y redistribuirlo respetando los términos de la licencia.
