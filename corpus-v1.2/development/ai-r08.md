# subtimer

Biblioteca de Python para leer archivos de subtítulos y corregir sus tiempos de forma sencilla. Soporta los formatos más comunes (SRT, VTT y ASS) y permite desplazar, escalar o sincronizar los tiempos de aparición de cada línea.

## Motivación

Es habitual descargar subtítulos que no coinciden exactamente con el vídeo, ya sea porque provienen de una versión distinta o porque tienen un pequeño desfase constante. `subtimer` nació para resolver ese problema de manera programática, sin depender de herramientas gráficas.

## Instalación

```bash
pip install subtimer
```

## Uso básico

```python
from subtimer import Subtitulos

subs = Subtitulos.desde_archivo("pelicula.srt")

# Desplazar todos los tiempos 2.5 segundos hacia adelante
subs.desplazar(segundos=2.5)

# Escalar los tiempos si el vídeo tiene un fotograje distinto
subs.escalar(factor=1.04)

subs.guardar("pelicula_corregida.srt")
```

## Sincronización automática

La biblioteca incluye una función para calcular el desfase automáticamente a partir de dos puntos de referencia conocidos:

```python
subs.sincronizar(
    punto_original=(00, 12, 500),
    punto_deseado=(00, 15, 200)
)
```

## Formatos soportados

| Formato | Lectura | Escritura |
|---------|---------|-----------|
| SRT     | Sí      | Sí        |
| VTT     | Sí      | Sí        |
| ASS     | Sí      | Parcial   |

## API principal

- `Subtitulos.desde_archivo(ruta)`: carga un archivo de subtítulos.
- `desplazar(segundos)`: mueve todos los tiempos.
- `escalar(factor)`: ajusta la duración total.
- `sincronizar(punto_original, punto_deseado)`: calcula y aplica el ajuste necesario.
- `guardar(ruta)`: exporta el resultado.

## Tests

El proyecto incluye una batería de pruebas con `pytest`:

```bash
pytest tests/
```

## Contribuir

Las *pull requests* son bienvenidas. Para cambios grandes, abre primero un *issue* para discutir qué te gustaría cambiar.

## Licencia

MIT
