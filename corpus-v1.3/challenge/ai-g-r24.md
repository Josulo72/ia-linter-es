# HorarioPNG

HorarioPNG es una biblioteca de Python para convertir un horario de clase en una imagen. Le das las asignaturas, los días y las horas y genera un PNG que puedes poner en una web, mandar por un grupo o imprimir.

No lleva editor gráfico. El horario se construye desde Python o desde un fichero JSON.

## Instalación

```bash
pip install horariopng
```

Necesitas Python 3.10 o posterior.

## Ejemplo

```python
from horariopng import Horario

horario = Horario(
    dias=["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    horas=["08:30", "09:30", "10:30", "11:30", "12:30"],
)

horario.clase("Lunes", "08:30", "Matemáticas")
horario.clase("Lunes", "09:30", "Lengua")
horario.clase("Martes", "08:30", "Historia")
horario.clase("Miércoles", "10:30", "Física", aula="2B")

horario.guardar("horario.png")
```

Si una clase ocupa dos horas:

```python
horario.clase(
    "Jueves",
    "10:30",
    "Tecnología",
    duracion=2,
)
```

También puedes cargar los datos desde JSON:

```python
horario = Horario.desde_json("horario.json")
horario.guardar("horario.png")
```

## Aspecto

Se pueden cambiar el tamaño de las celdas, la fuente, los márgenes y los colores de cada asignatura. Si no configuras nada, usa un diseño sencillo pensado para que siga siendo legible al verlo en un móvil.

```python
horario.estilo(
    ancho_celda=180,
    alto_celda=70,
    tamano_fuente=22,
)
```

Las clases largas se parten en varias líneas automáticamente. Si metes demasiado texto en una celda, la biblioteca reduce la fuente hasta un límite y después recorta. No intenta hacer milagros con nombres de asignaturas de cuatro párrafos.

Ahora mismo genera PNG. Tengo pendiente añadir SVG y una forma más cómoda de definir recreos y franjas sin clase.

## Licencia

HorarioPNG tiene licencia MIT.
