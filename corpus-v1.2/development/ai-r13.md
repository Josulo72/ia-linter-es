# barrapy

Biblioteca de Python para generar códigos de barras de productos. Cubre las simbologías más habituales en comercio minorista y logística, valida los dígitos de control y exporta a varios formatos de imagen.

## Simbologías admitidas

- EAN-13, EAN-8 y sus complementos de 2 y 5 dígitos
- UPC-A y UPC-E
- Code 128 (juegos A, B y C, con conmutación automática)
- Code 39 con y sin dígito de control
- ITF-14
- GS1-128 con analizador de identificadores de aplicación

## Instalación

```bash
pip install barrapy
```

Sin dependencias obligatorias para la salida SVG. Para PNG se necesita Pillow:

```bash
pip install barrapy[png]
```

## Ejemplo

```python
from barrapy import EAN13

codigo = EAN13("840000000001")
codigo.guardar("producto.svg")
```

El dígito de control se calcula solo si se pasan doce dígitos. Si se pasan trece, se comprueba y se lanza `DigitoControlInvalido` cuando no cuadra.

```python
from barrapy import Code128

Code128("LOTE-2024-A7").guardar("lote.png", ancho_modulo=0.4, alto=25)
```

## Parámetros de dibujo

Todas las clases aceptan los mismos ajustes de representación:

- `ancho_modulo`: anchura de la barra estrecha en milímetros.
- `alto`: altura de las barras en milímetros.
- `margen_silencio`: zona muda a izquierda y derecha, expresada en módulos.
- `texto`: si se imprime el valor legible bajo el código.
- `tipografia` y `cuerpo`: control del texto legible.

Los valores predeterminados siguen las recomendaciones de GS1 para impresión a tamaño nominal.

## Uso desde la línea de órdenes

```bash
python -m barrapy ean13 8400000000017 --salida etiqueta.svg
```

## Notas sobre calidad de impresión

Un código generado correctamente puede resultar ilegible si se imprime mal. Conviene no reducir el tamaño por debajo del 80 % del nominal, mantener la zona muda y evitar fondos de color con poco contraste. El rojo, en particular, resulta invisible para muchos lectores láser.

## Contribuciones

El repositorio incluye un juego de pruebas con vectores de referencia para cada simbología. Cualquier cambio en la codificación debe ir acompañado de sus casos de prueba.

## Licencia

LGPL-3.0.
