# BarraLibre

BarraLibre es una biblioteca de software libre para generar códigos de barras utilizados en productos, etiquetas y documentos comerciales. Proporciona una API sencilla para crear representaciones de códigos habituales y exportarlas como imágenes o gráficos vectoriales.

Está orientada a aplicaciones de inventario, catálogos, sistemas de impresión de etiquetas y pequeños programas de gestión que necesiten generar códigos de barras sin depender de servicios externos.

## Formatos compatibles

Actualmente la biblioteca permite generar:

* EAN-13
* EAN-8
* UPC-A
* Code 128
* Code 39
* ITF

Cuando el formato lo requiere, BarraLibre puede calcular automáticamente el dígito de control y validar que el número proporcionado sea correcto.

## Instalación

```bash
pip install barralibre
```

También puedes instalar la versión de desarrollo:

```bash
git clone https://example.org/barralibre.git
cd barralibre
pip install -e .
```

## Ejemplo básico

```python
from barralibre import EAN13

codigo = EAN13("841234567890")
codigo.guardar("producto.svg")
```

Para generar una imagen PNG:

```python
codigo.guardar("producto.png", ancho=600, alto=240)
```

La biblioteca también permite obtener directamente el contenido SVG:

```python
svg = codigo.como_svg()
```

## Validación

Puedes comprobar un código antes de utilizarlo:

```python
from barralibre import validar

if validar("8412345678905", formato="ean13"):
    print("Código válido")
```

BarraLibre comprueba la longitud, los caracteres permitidos y, cuando corresponde, el dígito de control. La validación verifica la estructura matemática del código, pero no confirma que el identificador haya sido asignado oficialmente a un producto concreto.

## Desarrollo

Las pruebas se ejecutan con:

```bash
pytest
```

Las contribuciones son bienvenidas, especialmente las destinadas a añadir nuevos estándares, mejorar la documentación o ampliar las opciones de renderizado.

## Licencia

BarraLibre se distribuye bajo la licencia Apache-2.0.
