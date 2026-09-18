# Trastienda

Trastienda es una aplicación de consola para llevar el inventario de una tienda pequeña. Guarda productos, existencias y movimientos. No necesita servidor ni conexión a internet, los datos se quedan en un fichero SQLite en el ordenador.

La idea es poder consultar en unos segundos cuántas unidades quedan de algo y apuntar entradas o ventas sin abrir una hoja de cálculo enorme.

## Instalación

Necesitas Python 3.11 o posterior.

```bash
pip install trastienda
```

La primera vez crea la base de datos:

```bash
trastienda init
```

Para añadir un producto:

```bash
trastienda producto añadir \
  --ref CAM-001 \
  --nombre "Camiseta negra M" \
  --stock 12
```

Puedes ver el inventario completo con:

```bash
trastienda stock
```

O buscar algo concreto:

```bash
trastienda stock "camiseta"
```

Cuando entra mercancía:

```bash
trastienda entrada CAM-001 8
```

Y cuando salen dos unidades:

```bash
trastienda salida CAM-001 2
```

Cada cambio queda guardado en el historial con la fecha, la cantidad y una nota opcional. Así se puede ver de dónde sale el stock actual:

```bash
trastienda movimientos CAM-001
```

También hay un aviso sencillo para productos que están por debajo del mínimo configurado:

```bash
trastienda bajos
```

Trastienda no lleva facturas, clientes, caja ni contabilidad. Para una tienda que necesite un TPV completo se queda corta. La hice para el caso más simple, saber qué hay, qué ha entrado y qué ha salido.

Se puede sacar una copia de los datos copiando el fichero `trastienda.db`. También hay exportación a CSV para abrir el inventario en LibreOffice o Excel.

Tengo pendiente añadir importación desde CSV y una orden para corregir movimientos introducidos por error.

El proyecto se publica bajo licencia GPL-3.0.
