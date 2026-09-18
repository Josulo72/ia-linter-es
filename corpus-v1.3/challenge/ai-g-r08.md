# Retim

Retim es una biblioteca para leer ficheros de subtítulos y corregir sus tiempos. Abre SRT y WebVTT, deja tocar cada entrada desde Python y vuelve a guardar el resultado.

La hice para arreglar subtítulos que están bien escritos pero empiezan demasiado pronto, demasiado tarde o se van desajustando poco a poco respecto al vídeo.

## Instalación

```bash
pip install retim
```

Uso básico:

```python
from retim import Subtitulos

subs = Subtitulos.abrir("pelicula.srt")
subs.desplazar(segundos=1.4)
subs.guardar("pelicula-corregida.srt")
```

Eso suma 1,4 segundos a todos los subtítulos. Para adelantarlos puedes usar un número negativo.

También se puede corregir un desfase que va creciendo. Si el primer diálogo encaja pero al final de la película los subtítulos llegan tres segundos tarde, indica dos puntos que sepas que deberían coincidir:

```python
subs.ajustar(
    original_inicio="00:10:00.000",
    correcto_inicio="00:10:00.000",
    original_fin="01:40:03.000",
    correcto_fin="01:40:00.000",
)
```

Retim recalcula los tiempos intermedios de forma proporcional.

Cada subtítulo se puede recorrer y modificar directamente:

```python
for entrada in subs:
    print(entrada.inicio, entrada.fin, entrada.texto)
```

La biblioteca conserva saltos de línea y etiquetas básicas. Intenta no tocar el texto cuando solo cambias tiempos.

Hay algunas cosas pendientes. Los estilos avanzados de WebVTT todavía no se conservan todos y ASS/SSA no está soportado. Tampoco analiza audio o vídeo para sincronizar automáticamente. Necesita que le digas cuánto hay que mover o qué puntos deben coincidir.

Para ejecutar las pruebas:

```bash
git clone https://github.com/ejemplo/retim.git
cd retim
pip install -e ".[dev]"
pytest
```

## Licencia

Retim se publica bajo licencia MIT.
