# Barras

No imprime. Lo digo lo primero porque me lo han preguntado ya varias veces. Lo que hace es generarte la imagen del código de barras, y la impresora la manejas tú con lo que uses normalmente.

Le pasas el número de un producto y te devuelve un SVG o un PNG. Sabe hacer EAN-13, EAN-8, UPC-A, Code 128, Code 39 e ITF-14, que es el de las cajas.

    from barras import ean13
    ean13("841234567890").svg(altura_mm=25)

El dígito de control lo calcula ella. Si le das las doce cifras de un EAN-13 te añade la decimotercera; si le das las trece completas, comprueba que cuadre y te avisa cuando no, en vez de dibujar tan tranquila un código que ningún lector va a aceptar.

Las proporciones salen de la norma, incluidos los márgenes blancos de los lados. Eso es más importante de lo que parece. La mayoría de los códigos que no se leen en caja no están mal generados, están escalados a ojo en un programa de diseño hasta que caben en la etiqueta y se han quedado sin margen o con las barras demasiado juntas. Por eso las medidas van en milímetros y no en píxeles, y por eso el SVG viene con el tamaño puesto.

Lo he probado con un lector láser de los baratos, con uno de imagen y con la cámara del móvil, imprimiendo en láser normal sobre folio y sobre etiquetas adhesivas. En térmica de 203 puntos por pulgada también, aunque ahí por debajo de 20 mm de ancho ya empieza a fallar.

Códigos de dos dimensiones no hace ninguno. Ni QR, ni DataMatrix, ni PDF417. Son otro mundo, con su corrección de errores y su codificación, y meterlos aquí sería otra biblioteca distinta compartiendo nombre.

No tiene dependencias. El SVG se escribe a mano y el PNG sale de Pillow, que es lo único opcional que pide.
