# PhotoRename

Renombra todas las fotos de una carpeta según la fecha en que las sacó la cámara. Echas tus vacaciones en una carpeta, ejecutas esto y te quedan todas rebautizadas como 2024-07-15 Playa.jpg, 2024-07-15 Montaña.jpg, sin perder la información de la fecha original.

Lee los datos EXIF de la foto, coge la fecha que la cámara guardó y genera un nombre limpio. Si varias fotos las hiciste el mismo día, añade un número secuencial para que no se sobrescriban.

Necesitas Python 3.8 o superior. Se instala con pip y se usa por terminal. Apuntas a una carpeta, le dices un patrón para el nombre y ya. Que las quieras como YYYY-MM-DD o como 15 de julio de 2024, lo configuras.

Funciona con fotos de cualquier cámara y también con screenshots. Si no encuentra la fecha EXIF, usa la del sistema de archivos y te avisa de dónde vino.

No toca las fotos originales, solo el nombre. Si algo falla en el proceso o no estás seguro, pasa el parámetro de prueba y te muestra los cambios que haría sin hacerlos.

Hay un problema con ciertas cámaras antiguas que guardan la fecha en un formato no estándar. En esos casos tienes que revisar uno a uno, pero es excepcional. Cuando lo encuentres, puedes reportarlo y se añade el soporte.

Si las fotos están desordenadas, esto te las deja organizadas desde el nombre. Desde ahí es fácil arrastrarlas a carpetas por mes o año si quieres.

El código es tuyo, lo modificas como necesites. Si quieres otro formato de fecha o añadir la hora a los nombres, es cosa de dos líneas.
