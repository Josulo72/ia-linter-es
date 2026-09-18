# HojaARecibo

HojaARecibo genera recibos en PDF a partir de una hoja de cálculo. Preparas una fila por recibo, ejecutas el programa y te deja los PDF listos en una carpeta.

Lo hice para evitar copiar nombres, importes y fechas a mano cada mes. La plantilla del recibo es la misma, pero los datos salen directamente del fichero.

Admite hojas `.xlsx` y `.ods`.

## La hoja

Cada fila debe tener estas columnas:

```text
numero
fecha
nombre
concepto
importe
```

Por ejemplo:

```text
001 | 2026-01-05 | Marta López | Cuota enero | 35.00
002 | 2026-01-05 | Luis García | Cuota enero | 35.00
```

La primera fila se usa como cabecera. El orden de las columnas puede cambiar, pero los nombres tienen que coincidir.

## Instalación

Necesitas Python 3.11 o posterior.

```bash
git clone https://github.com/usuario/hoja-a-recibo.git
cd hoja-a-recibo
python -m pip install .
```

Después puedes generar los recibos así:

```bash
hoja-a-recibo socios.xlsx
```

Los PDF se guardan en `recibos/`.

Si quieres otra carpeta:

```bash
hoja-a-recibo socios.xlsx --salida pdf-enero
```

También puedes pasar una plantilla propia:

```bash
hoja-a-recibo socios.xlsx --plantilla mi-recibo.html
```

La plantilla usa HTML y unas cuantas variables sencillas como `nombre`, `fecha`, `concepto` e `importe`. Hay una de ejemplo en el repositorio.

## Comprobaciones

Antes de generar nada, el programa revisa que estén las columnas necesarias, que los importes sean números y que las fechas se puedan leer. Si encuentra una fila mal, dice cuál es y no genera ese recibo.

No lleva contabilidad ni controla si un recibo ya se ha cobrado. Tampoco firma los PDF ni los envía por correo. Solo convierte los datos de la hoja en documentos.

He intentado que la salida sea aburrida y predecible. Si hay 80 filas válidas, salen 80 PDF.

## Licencia

MIT.
