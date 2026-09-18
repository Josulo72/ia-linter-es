# Recibitos

Coge una hoja de cálculo en la que cada fila es un cobro y te saca un PDF por fila.

    recibitos socios.xlsx --plantilla cuota.html --salida pdf/

La plantilla es un HTML normal con los nombres de las columnas entre llaves dobles, así que el diseño del recibo lo haces con CSS y lo ves en el navegador antes de generar nada. Me pareció más razonable que aprender a colocar cajas en coordenadas dentro de una librería de PDF. La conversión final la hace un motor de impresión sin ventana, y eso es lo único pesado que hay que instalar.

Pide seis columnas por su nombre: numero, fecha, concepto, importe, nombre y nif. Todas las demás que tengas en la hoja quedan disponibles en la plantilla por si las quieres usar. Lee .xlsx, .ods y .csv.

Antes de escribir un solo fichero repasa la hoja entera. Si hay un número de recibo repetido, un hueco en la numeración, una fecha que no entiende o un importe que no es un número, se para y te dice en qué fila está el problema. La numeración nunca se la inventa: sale de la hoja y el programa se limita a comprobar que tiene sentido.

Los importes los escribe con dos decimales y coma, y también en letra si la plantilla lo pide, que para cuotas y donativos lo suelen pedir.

Por defecto genera un PDF por cada fila, con el número de recibo en el nombre del archivo. Con --unir te los deja todos en un solo documento, que es lo cómodo si los vas a llevar a imprimir.

Firmar los PDF no sabe, ni con certificado ni de ninguna otra forma. Mandarlos por correo tampoco, aunque es lo que más me han pedido y algún día caerá.

En la asociación donde lo uso son ciento ochenta recibos de cuota al año y los saca en unos cuarenta segundos.
