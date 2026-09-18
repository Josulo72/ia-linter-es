# Ordenadiscos

    ordenadiscos ~/Descargas/musica --destino ~/Musica

Con eso coge todo lo que tengas suelto en la carpeta de descargas y lo deja colocado en Artista/Álbum/01 - Canción.mp3. Esa es la idea entera del programa.

Se guía por las etiquetas de dentro del fichero, nunca por el nombre. Los nombres de archivo que traen las descargas son un desastre y no hay manera de sacar nada fiable de ahí, mientras que las etiquetas al menos las puso alguien a propósito. Entiende mp3 con ID3v2, FLAC, Ogg Vorbis y m4a. Los WMA no los toca, los deja donde estén.

Si a un fichero le falta el artista o el álbum, no se lo inventa ni intenta adivinarlo por el nombre de la carpeta. Lo deja en una carpeta aparte que se llama sin-clasificar y lo apunta en el resumen del final. Prefiero mirar cuatro archivos a mano que encontrarme un disco entero metido en "Unknown Artist".

El lío de siempre es que el mismo grupo aparezca escrito de tres maneras. Hay un fichero de alias donde pones "The Beatles = Beatles" y una línea por cada caso, y te evitas tres carpetas para lo mismo. Yo tengo unas cuarenta líneas ahí después de dos años.

En los recopilatorios mira primero la etiqueta de artista del álbum. Si existe, manda esa. Si no, todo el disco va a una carpeta que pone Varios.

Por defecto copia, no mueve. Así si algo sale mal todavía tienes el original donde estaba. Con --mover hace lo otro, pero solo después de comprobar que la copia está bien escrita.

Dos cosas que no están. Las carátulas no las toca: ni las descarga ni las incrusta ni las saca a un cover.jpg. Y en los discos dobles pone el número delante, 1-01 y 2-01, en lugar de crear una subcarpeta por disco. A mí me viene bien así, pero entiendo que mucha gente lo quiera del otro modo.
