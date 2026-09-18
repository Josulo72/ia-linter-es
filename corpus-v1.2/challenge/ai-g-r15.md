# Mostrador

Esto está pensado para una tienda pequeña de verdad. Un local, una persona detrás del mostrador y puede que otra por las tardes. Mi hermana tiene una mercería y llevaba el género en un cuaderno cuadriculado, y cuando le pregunté qué le hacía falta no me habló de gráficas ni de la nube, me dijo que quería saber cuántas cremalleras negras del 40 le quedaban sin ir al cajón a contarlas.

Se maneja entero desde la terminal, con el teclado y sin ratón. Das de alta un artículo, metes una entrada cuando llega el pedido del proveedor, apuntas las ventas y de vez en cuando haces un recuento para cuadrar lo que dice el programa con lo que hay en la estantería.

    mostrador vender 8412345678905 2
    mostrador stock cremallera

Los códigos se pueden teclear o pasar con un lector, que para el ordenador es lo mismo que teclearlos. Si un artículo no trae código de barras le asignas uno interno y le pegas una etiqueta.

Todo vive en un fichero SQLite. La copia de seguridad consiste en copiar ese fichero a un pendrive, y con eso está hecha. Me pareció importante que la seguridad de los datos no dependiera de entender nada.

Saca tres informes y ninguno más: lo que está por debajo del mínimo que le hayas puesto, lo que no se ha movido en los últimos seis meses y las ventas de un día o de un mes. En pantalla, en columnas, sin colores.

No hace facturas, no habla con Hacienda, no se conecta al datáfono y no lleva ficha de clientes. Para eso hay programas de verdad con su contrato de mantenimiento. Aquí lo único que se guarda es qué hay, cuánto hay y qué ha salido.

Lleva funcionando desde marzo con unas mil cuatrocientas referencias. El recuento anual, que antes eran dos tardes de domingo, este año se hizo en una.
