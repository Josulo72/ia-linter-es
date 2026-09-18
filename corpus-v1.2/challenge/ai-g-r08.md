subtiempos es una biblioteca para leer archivos de subtítulos, SRT y VTT de momento, y corregir sus tiempos cuando van desincronizados del vídeo.

La uso sobre todo cuando bajo un subtítulo de una fuente y el vídeo tiene un fotograma distinto al original, esas cosas que hacen que a partir del minuto veinte todo vaya medio segundo tarde. Le das un desfase fijo, o dos puntos de referencia, y calcula el desfase progresivo entre ellos, que es lo que suele hacer falta.

## Instalación

```
pip install subtiempos
```

## Uso

```python
from subtiempos import Subtitulo

sub = Subtitulo.desde_archivo("pelicula.srt")
sub.desplazar(segundos=0.5)
sub.guardar("pelicula_corregido.srt")
```

Para el ajuste progresivo, en vez de un desplazamiento fijo:

```python
sub.ajustar_entre(
    punto_a=(120.0, 120.5),   # segundo real, segundo del subtítulo
    punto_b=(3600.0, 3602.1),
)
sub.guardar("pelicula_corregido.srt")
```

Internamente reescala todos los tiempos entre esos dos puntos, como una regla de tres.

## Qué falta

No toca el formato ASS todavía, aunque lo tengo apuntado. Tampoco detecta el desfase sola, eso lo tienes que calcular tú viendo el vídeo, no hay ningún tipo de reconocimiento de audio ni nada parecido. Y con archivos que mezclan varios idiomas en el mismo SRT a veces se lía con la codificación, mejor pasa el archivo a UTF-8 antes si puedes.

Los tests cubren SRT bien, VTT menos, así que si usas VTT y algo falla, un issue con el archivo, sin datos personales, ayuda mucho.

MIT.
