# Repes

Junté en una sola carpeta lo que había en tres discos duros viejos y me salieron sesenta y un mil archivos. Al mirarlo con calma, casi veinte mil eran el mismo documento guardado dos, tres o cinco veces. Escribí esto para encontrarlos sin tener que abrirlos uno por uno.

Trabaja en tres pasadas y ese es todo el truco. Primero agrupa por tamaño, que es gratis y descarta la mayoría. De los grupos que quedan calcula el hash de los primeros ocho kilobytes, que tampoco cuesta casi nada y se lleva por delante otro montón. Solo lo que sobrevive a las dos cribas se lee entero. Sobre esos sesenta y un mil archivos, unos treinta gigas, tarda menos de cuatro minutos en un disco mecánico.

No borra. Te deja un informe con los grupos de repetidos, el tamaño de cada uno y lo que ahorrarías, y hasta ahí llega por su cuenta. Si después de mirarlo quieres actuar, con --enlazar deja una copia real y sustituye las demás por enlaces duros, y con --borrar hace lo que parece, pero pidiendo confirmación grupo a grupo.

Para decidir cuál se queda usa la ruta más corta, que suele ser la carpeta buena y no la de "copia de seguridad 2014 (2)". Se puede cambiar con --preferir y darle una carpeta que mande sobre las demás, o pedirle que respete siempre el archivo más antiguo.

Busca copias idénticas, byte a byte. Eso quiere decir que el mismo informe guardado en .doc y exportado a .pdf le parecen dos archivos distintos, porque lo son. Una foto reescalada tampoco la va a emparejar con el original. Para eso hacen falta comparaciones por contenido o por huella visual y es otro problema, bastante más resbaladizo, en el que no me he metido.

Los enlaces simbólicos no los sigue, para no acabar contando dos veces la misma carpeta o dando vueltas en círculo.
