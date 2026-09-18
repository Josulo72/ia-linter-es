# Antigua

En el almacén donde estuve trabajando hay un programa de gestión de 1997 que sigue encendido todos los días y que guarda su configuración en ficheros .CFG de un formato que se inventó el fabricante. El fabricante ya no existe. Nadie quiere tocar el programa, pero cada vez que se abre una nueva sección o cambia una ruta de red hay que entrar en esos ficheros. Esta biblioteca los lee y los escribe desde Python sin dejarlos inservibles.

El formato es por bloques con el nombre entre corchetes, claves con signo igual, comentarios que empiezan por punto y coma y valores largos que se parten poniendo una barra invertida al final de la línea. Suena a los .ini de toda la vida y no lo es: la codificación es CP850, los finales de línea son CRLF y si se los cambias el programa arranca pero se deja los acentos por el camino.

Lo que más me importaba al hacerla es que abrir un fichero y volver a guardarlo sin cambiar nada te devuelva exactamente los mismos bytes. Comentarios en su sitio, orden de las claves, espacios antes y después del igual, líneas en blanco. Hay una prueba que hace justo eso con los once ficheros reales que pude sacar de allí.

    cfg = antigua.abrir("SETUP.CFG")
    cfg["ALMACEN2"]["RUTA"] = "D:\DATOS\ALM2"
    cfg.guardar()

Al escribir respeta la codificación original, así que si metes una cadena con un carácter que no existe en CP850 te da error en vez de guardar un interrogante.

Hay una cosa fea que no he sabido resolver bien. El formato permite dos bloques con el mismo nombre y el programa se queda con el último, así que la biblioteca los conserva los dos, pero para llegar al primero tienes que ir por índice y queda incómodo de escribir. Y los valores binarios en hexadecimal los devuelve como cadena tal cual, sin interpretarlos, porque no sé qué significan.
