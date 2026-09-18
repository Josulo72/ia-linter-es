# Facturamax

Pasa facturas en PDF a una hoja de cálculo lista para meter en el contable. Le das un directorio con PDFs y te genera un Excel con todos los datos: fecha, proveedor, importe, VAT, base imponible. Cada fila es una factura.

Funciona con facturas estructuradas. He probado con formatos de empresas grandes, pequeños proveedores, facturas emitidas desde software de contabilidad estándar. Algunos PDFs vienen escaneados y en esos casos falla más, pero los que están correctamente digitalizados los lee sin problemas.

Lo mejor es que no necesita conexión a internet. Todo el trabajo se hace en tu ordenador, los datos no se suben a ningún lado. Encriptas tu carpeta de facturas, configuras el programa y ya está.

Se instala por terminal. Una vez lo tienes, llamas al comando con el directorio donde tengas las facturas y genera el Excel automáticamente. Si algo no está bien, te avisa en qué fila falló y qué campo está mal.

Todavía no maneja ciertas plantillas de facturas catalanas antiguas. Lo tengo en la lista de mejoras. También hay un problema con los números de serie que tienen caracteres especiales, aunque poco frecuentes.

Para revisar las cosas antes de meterlas en contabilidad tienes ahí el Excel con todo. Si falta un campo o está incorrecto, lo ves enseguida y lo corriges manualmente. Después lo importas a tu software de contabilidad sin preocupaciones.

El código está completamente abierto. Si tienes otra plantilla de factura que el programa no lee bien, añades la regla y lo adaptas a tu caso. Las contribuciones son bienvenidas.
