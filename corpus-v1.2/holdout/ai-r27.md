# Recibofacil

Recibofacil convierte las filas de una hoja de cálculo en recibos en PDF. Una fila, un recibo. Pensado para asociaciones, academias, comunidades de vecinos y cualquiera que emita documentos repetitivos y no quiera hacerlos a mano.

## Funcionamiento

El programa toma dos cosas: una hoja de cálculo con los datos y una plantilla que define el aspecto del recibo. Por cada fila rellena la plantilla y genera un PDF.

```bash
recibofacil generar cuotas.xlsx --plantilla recibo.html --salida recibos/
```

## Formatos de entrada

XLSX, ODS y CSV. La primera fila debe contener los nombres de las columnas, que son los que se usan como variables en la plantilla.

| socio | importe | concepto | fecha |
| --- | --- | --- | --- |
| Ana Belmonte | 45,00 | Cuota primer trimestre | 2024-01-15 |
| Luis Ferrán | 45,00 | Cuota primer trimestre | 2024-01-15 |

## Plantillas

Las plantillas son HTML con marcadores entre llaves dobles, lo que permite dar el diseño que se quiera con CSS corriente:

```html
<h1>Recibo n.º {{ numero }}</h1>
<p>Recibí de <strong>{{ socio }}</strong> la cantidad de
{{ importe | moneda }} euros ({{ importe | letras }}).</p>
<p>En concepto de: {{ concepto }}</p>
<p>Fecha: {{ fecha | fecha_larga }}</p>
```

Los filtros disponibles incluyen `moneda`, `letras` (importe en palabras), `fecha_larga`, `mayusculas` y `nif`. El numerador `{{ numero }}` se asigna automáticamente y es correlativo.

## Salida

Por defecto se crea un PDF por fila, con el nombre construido a partir de una plantilla configurable. Con `--unido` se genera un único PDF con todos los recibos, cómodo para imprimir de una tirada.

## Envío por correo

Si la hoja incluye una columna de correo electrónico, `--enviar` adjunta cada recibo al destinatario correspondiente usando la configuración SMTP del fichero `recibofacil.toml`.

## Instalación

```bash
pipx install recibofacil
```

Requiere Python 3.10 o superior. La generación de PDF usa WeasyPrint, que a su vez necesita las bibliotecas Pango y Cairo del sistema.

## Estado del proyecto

Estable y en uso en producción en varias entidades. Se mantiene sin prisa: las incidencias se atienden y las funcionalidades nuevas se valoran con criterio conservador.

## Licencia

MIT.
