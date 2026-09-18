difprecios compara dos listas de precios, la vieja y la nueva, y te dice qué productos han subido, cuáles han bajado y cuáles han desaparecido de una lista a otra.

Lo empecé para el bar de un amigo, que cada vez que le llegaba una tarifa nueva del proveedor se pasaba una tarde entera mirando línea a línea qué había cambiado. Ahora le mete los dos Excel y en unos segundos tiene la diferencia.

## Instalación

```
pip install difprecios
```

## Uso

```
difprecios lista_antigua.xlsx lista_nueva.xlsx --salida diferencias.xlsx
```

Necesita que las dos listas tengan una columna con el nombre o código del producto y otra con el precio. Si las columnas se llaman distinto en cada archivo, se indica así:

```
difprecios lista_antigua.xlsx lista_nueva.xlsx --columna-nombre "Producto" --columna-precio "PVP"
```

El archivo de salida marca en rojo las subidas, en verde las bajadas y en gris los productos que ya no están.

## Qué falta

Empareja los productos por el nombre exacto, así que si un proveedor escribe "Tomate pera 1kg" en una lista y "Tomate Pera 1Kg" en la otra, no lo detecta del todo bien, aunque ya ignora mayúsculas y espacios de más. Nombres realmente distintos para el mismo producto no los reconoce, eso habría que enseñárselo aparte.

Solo lee Excel y CSV, no PDF, que es como mandan la tarifa muchos proveedores. Está en la lista, pero convertir un PDF a tabla de forma fiable no es trivial.

Licencia MIT.
