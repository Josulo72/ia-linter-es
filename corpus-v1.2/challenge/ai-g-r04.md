# EuroFormat

Una biblioteca de JavaScript para formatear cantidades de dinero en euros. Le pasas un número y te devuelve un string con el formato correcto: puntos de miles, dos decimales, símbolo del euro al final según la costumbre española.

Entra el número 1500.5 y sale "1.500,50 €". Igual de simple con valores negativos, ceros, o números grandes. Es lo que necesitas cuando muestras precios en una página web, un recibo o un presupuesto.

Se instala con npm o yarn. Una línea de import y ya lo tienes en tu proyecto. Funciona en navegador y en Node.js.

Soporta diferentes opciones. Si quieres los decimales opcionales para números enteros, lo especificas. Si prefieres el símbolo delante, puedes configurarlo. Pero por defecto usa la notación española.

Para aplicaciones que usan locales diferentes, tienes versiones para otros países. Pero si trabajas solo en España, ni necesitas pensar en eso.

He probado con miles de valores distintos. Números con muchos decimales se redondean bien, negativos funcionan, números muy grandes sin problema. La velocidad es instantánea.

Un problema que encuentras con librerías pesadas de internacionalización es que traen un montón de idiomas que nunca usas. Esta es pequeña, solo hace euros españoles bien. Si necesitas otra moneda, buscas otra.

La usamos en un proyecto que tiene tienda online. Cada producto muestra el precio bien formateado. Los clientes no ven locuras raras como 1500.5€ ni 1,500.50 €.

El código está abierto, es simple, se ve todo. Si encuentras un caso que no maneja bien, me avisas y lo arreglamos.
