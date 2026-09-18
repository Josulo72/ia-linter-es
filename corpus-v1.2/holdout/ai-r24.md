# horario-clase-img

Biblioteca para generar una imagen con el horario de clase a partir de una lista de asignaturas, días y horas. Pensada para estudiantes y centros educativos que quieran producir horarios visuales de forma automática, sin tener que diseñarlos a mano.

## Descripción

A partir de un archivo con la información de las asignaturas (nombre, día de la semana, hora de inicio, hora de fin y, opcionalmente, aula y color), la biblioteca dibuja una tabla con el horario semanal completo y la exporta como imagen PNG o SVG.

## Instalación

```bash
pip install horario-clase-img
```

## Uso básico

```python
from horario_clase_img import GeneradorHorario

horario = GeneradorHorario()

horario.agregar_clase("Matemáticas", dia="Lunes", inicio="09:00", fin="10:30", aula="A12")
horario.agregar_clase("Historia", dia="Lunes", inicio="10:45", fin="12:00", aula="B03")
horario.agregar_clase("Física", dia="Martes", inicio="09:00", fin="10:30", aula="A12")

horario.generar_imagen("horario_semanal.png")
```

## Carga desde un archivo

También se puede cargar el horario completo desde un archivo CSV o JSON:

```python
horario = GeneradorHorario.desde_csv("mis_clases.csv")
horario.generar_imagen("horario.png")
```

Formato esperado del CSV:

```csv
asignatura,dia,inicio,fin,aula,color
Matemáticas,Lunes,09:00,10:30,A12,#3b82f6
Historia,Lunes,10:45,12:00,B03,#f97316
```

## Personalización

- `tema`: paleta de colores predefinida (`claro`, `oscuro`, `pastel`).
- `formato`: `png`, `svg` o `pdf`.
- `mostrar_aula`: si se incluye el aula dentro de cada bloque.
- `idioma`: nombres de los días en varios idiomas.

```python
horario.generar_imagen("horario.svg", tema="oscuro", formato="svg")
```

## Requisitos

- Python 3.9 o superior.
- Pillow para la generación de imágenes rasterizadas.

## Tests

```bash
pytest tests/
```

## Contribuir

Se aceptan aportaciones para añadir nuevas plantillas visuales o mejorar la disposición de los bloques cuando hay solapamientos. Consulta `CONTRIBUTING.md`.

## Licencia

MIT
