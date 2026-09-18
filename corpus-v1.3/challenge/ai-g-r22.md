# PrecioDiff

PrecioDiff compara dos listas de precios y te dice qué ha cambiado. Está pensado para esos casos en los que un proveedor manda un Excel nuevo y quieres saber qué productos han subido, cuáles han bajado, cuáles han desaparecido y cuáles son nuevos.

Ahora mismo acepta CSV y XLSX. Para emparejar los productos usa una columna que tú eliges, normalmente una referencia, un SKU o un código interno. No intenta adivinar que "Tornillo M8" y "Tornillo métrico de 8 mm" son lo mismo.

## Instalación

Necesitas Python 3.10 o posterior.

```bash
pip install preciodiff
```

## Uso

Supongamos que tienes `precios-enero.xlsx` y `precios-febrero.xlsx`, y que ambos tienen las columnas `referencia` y `precio`.

```bash
preciodiff precios-enero.xlsx precios-febrero.xlsx \
  --clave referencia \
  --precio precio
```

El resultado sale por pantalla:

```text
A104   12,50 -> 13,10   +0,60
B220    8,90 ->  8,50   -0,40
C031   eliminado
D442   nuevo             4,25
```

También puedes guardarlo en CSV:

```bash
preciodiff anterior.xlsx nuevo.xlsx \
  --clave referencia \
  --precio precio \
  --salida cambios.csv
```

Si los encabezados están en otra hoja:

```bash
preciodiff anterior.xlsx nuevo.xlsx --hoja Tarifa
```

## Cómo compara

Los precios se leen como números decimales, no como `float`, para evitar resultados raros con céntimos. Se pueden comparar ficheros con coma o punto decimal y hay una opción para ignorar diferencias menores de una cantidad concreta:

```bash
preciodiff viejo.csv nuevo.csv --ignorar-menores 0.01
```

Si una referencia aparece dos veces en la misma lista, el programa para y lo avisa. Preferí hacerlo así antes que escoger una fila por su cuenta.

De momento no compara descuentos por volumen ni tarifas con varias monedas en el mismo fichero.

## Licencia

PrecioDiff tiene licencia GPL-3.0.
