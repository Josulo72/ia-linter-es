# Trocea

Trocea es una biblioteca de software libre para dividir ficheros grandes en fragmentos más pequeños y reconstruir posteriormente el archivo original. Puede resultar útil para almacenamiento, transferencia de datos, sistemas con límites de tamaño o procesos que necesiten trabajar con bloques manejables.

La biblioteca opera sobre datos binarios, por lo que puede utilizarse con vídeos, copias de seguridad, imágenes de disco, archivos comprimidos o cualquier otro tipo de fichero.

## Instalación

Requiere Python 3.10 o superior.

```bash
pip install trocea
```

También puedes instalar la versión de desarrollo:

```bash
git clone https://example.org/trocea.git
cd trocea
pip install -e .
```

## Dividir un fichero

```python
from trocea import split_file

split_file(
    "archivo_grande.zip",
    output_dir="partes",
    chunk_size=100 * 1024 * 1024
)
```

Este ejemplo crea fragmentos de aproximadamente 100 MB dentro del directorio `partes`.

Trocea genera además un manifiesto con el orden de los fragmentos, el tamaño original y sumas de comprobación para detectar archivos dañados.

## Reconstruir el fichero

```python
from trocea import join_file

join_file(
    "partes/manifest.json",
    output_path="archivo_recuperado.zip"
)
```

Antes de unir las partes, la biblioteca puede verificar su integridad.

## Línea de comandos

El paquete incluye una interfaz sencilla:

```bash
trocea split copia.img --size 500M
trocea join copia.img.parts/manifest.json
```

Los tamaños admiten sufijos como `K`, `M` y `G`.

## Integridad

Trocea no comprime ni cifra los datos. Los fragmentos contienen partes del archivo original y deben protegerse de acuerdo con la sensibilidad de la información almacenada.

Las sumas de comprobación sirven para detectar corrupción accidental, no para proporcionar seguridad criptográfica frente a modificaciones maliciosas.

## Contribuir

Se aceptan informes de errores, documentación y mejoras de código. Ejecuta la suite de pruebas con:

```bash
pytest
```

## Licencia

Trocea se distribuye bajo la licencia Apache 2.0.
