# PDF2Calc

¿Cansado de meter a mano los datos de tus facturas en hojas de cálculo? Este proyecto automatiza eso. Tira un PDF de factura a la carpeta de entrada y saca una fila en Excel sin tocar nada más.

Lo que hace es básicamente leer el PDF, sacar los números que le interesan (cantidad, concepto, total, IVA, todo eso) y te lo deja formateado y listo en una hoja de cálculo. Vale para facturas de prácticamente cualquier proveedor porque la detección es bastante flexibilidad.

## Cómo instalarlo

Clona el repo y mete `npm install`. Necesitas Node 16 o superior. Si tienes un Mac, probablemente funcione igual. En Windows también, aunque depende un poco del PDF que tengas.

## Usar el proyecto

Hay dos formas de hacerlo. La más sencilla es arrastra el PDF a la carpeta `/input` y el proyecto se encarga del resto. En cinco segundos, si todo va bien, tienes el resultado en `/output` como CSV o Excel. 

Si prefieres algo más avanzado, puedes meterte en la configuración y ajustar qué datos quieres extraer. Por defecto saca fecha, concepto, cantidad y total, pero a veces hay campos raros que se te escapan.

## Lo que funciona bien

La precisión es bastante buena con facturas estándar. Hemos probado con Vodafone, Amazon, startups pequeñas, clientes de SaaS. Los resultados son lo suficientemente fiables como para no tener que revisar cada línea. Algunos PDFs tienen formatos raros y ahí sí que puede fallar, pero es raro.

## Lo que todavía no

Si tu factura tiene tablas anidadas o diseños muy creativos, probablemente le cueste. Las imágenes insertadas en el PDF tampoco las lee. Y si tienes facturas en idiomas que no sean español o inglés, avísanos.

## Contribuir

Tenemos un sistema de tests básico. Antes de enviar un PR, asegúrate de que los tests pasen. Si encuentras un PDF que no funciona, abre un issue con el fichero (sin datos sensibles) y miramos qué pasa.

La licencia es MIT. Úsalo como quieras.
