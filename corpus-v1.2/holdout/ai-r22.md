# ComparaPrecios

Herramienta que compara dos listas de precios y señala automáticamente las diferencias entre ellas: productos que han subido de precio, productos que han bajado y productos que han desaparecido o se han añadido de una lista a otra.

## Casos de uso

Pensada originalmente para comparar catálogos de proveedores mes a mes, esta herramienta resulta útil para cualquier persona que necesite detectar cambios de precio entre dos versiones de un mismo listado, ya sea en formato CSV, Excel o JSON.

## Instalación

```bash
pip install comparaprecios
```

## Uso desde la línea de comandos

```bash
comparaprecios lista_enero.csv lista_febrero.csv
```

El resultado se muestra en la terminal con un resumen como el siguiente:

```
Productos con subida de precio: 14
Productos con bajada de precio: 6
Productos nuevos: 3
Productos eliminados: 2
```

Para exportar el resultado detallado a un archivo:

```bash
comparaprecios lista_enero.csv lista_febrero.csv --salida diferencias.xlsx
```

## Formatos admitidos

- CSV (separado por comas o punto y coma).
- Excel (`.xlsx`).
- JSON.

Las columnas mínimas necesarias son el nombre o código del producto y su precio. El nombre de estas columnas se puede indicar mediante parámetros si no coincide con los valores por defecto:

```bash
comparaprecios a.csv b.csv --columna-nombre "producto" --columna-precio "precio_unitario"
```

## Umbral de diferencia

Por defecto se marca cualquier cambio de precio, por pequeño que sea. Es posible fijar un umbral mínimo para ignorar variaciones irrelevantes:

```bash
comparaprecios a.csv b.csv --umbral 0.5
```

## Uso como biblioteca

```python
from comparaprecios import Comparador

comparador = Comparador("lista_enero.csv", "lista_febrero.csv")
resultado = comparador.comparar()

for cambio in resultado.subidas:
    print(cambio.producto, cambio.precio_anterior, cambio.precio_nuevo)
```

## Tests

```bash
pytest tests/
```

## Contribuir

Las sugerencias y *pull requests* son bienvenidas. Revisa `CONTRIBUTING.md` antes de enviar cambios.

## Licencia

MIT
