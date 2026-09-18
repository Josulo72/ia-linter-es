# Barras

Barras es una biblioteca pequeña para generar códigos de barras de productos. Recibe un número, comprueba que tenga sentido para el formato elegido y devuelve el código listo para guardar como SVG o PNG.

Ahora mismo admite EAN-13, EAN-8, UPC-A e ITF-14.

## Instalación

```bash
pip install barras
```

## Uso

Un EAN-13 se puede generar así:

```python
from barras import EAN13

codigo = EAN13("841234567890")
codigo.save("producto.svg")
```

Si pasas los 12 primeros dígitos, la biblioteca calcula el dígito de control:

```python
codigo = EAN13("841234567890")
print(codigo.numero)
```

También puedes pasar el número completo. En ese caso se comprueba el dígito de control y se lanza `InvalidChecksum` si está mal.

Para sacar un PNG:

```python
codigo.save("producto.png", escala=3)
```

La parte de validación se puede usar sin generar ninguna imagen:

```python
from barras import EAN13

if EAN13.valido("8412345678905"):
    print("Correcto")
```

Barras no mantiene una base de datos de productos. Que un EAN tenga una estructura válida no significa que esté asignado de verdad a un producto concreto. La biblioteca solo comprueba y genera el código.

El SVG no necesita dependencias externas. Para guardar PNG hace falta Pillow, que se instala con:

```bash
pip install "barras[png]"
```

Tengo pruebas con los ejemplos publicados por GS1 y con una colección de etiquetas que uso durante el desarrollo. Falta soporte para GS1-128 y para añadir texto con más opciones de tamaño y posición.

La API intenta quedarse bastante quieta. Si solo necesitas crear un código de barras para imprimir una etiqueta o meterlo en un PDF, no debería hacer falta configurar nada más.

El proyecto usa licencia MIT.
