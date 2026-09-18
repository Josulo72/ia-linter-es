# AulaHorario

AulaHorario es una biblioteca de software libre para generar imágenes de horarios de clase a partir de datos estructurados. Permite representar asignaturas, aulas, profesores y franjas horarias en una cuadrícula preparada para imprimir, compartir o publicar en una web.

Está diseñada para que aplicaciones escolares, pequeños scripts y herramientas administrativas puedan producir horarios legibles sin tener que implementar manualmente todo el sistema de dibujo.

## Instalación

AulaHorario requiere Python 3.10 o superior.

```bash
pip install aulahorario
```

Para instalar la versión de desarrollo:

```bash
git clone https://example.org/aulahorario.git
cd aulahorario
pip install -e .
```

## Ejemplo

```python
from aulahorario import Horario

horario = Horario(
    dias=["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    horas=["08:30", "09:30", "10:30", "11:30"]
)

horario.add(
    dia="Lunes",
    hora="08:30",
    asignatura="Matemáticas",
    aula="2B"
)

horario.add(
    dia="Martes",
    hora="09:30",
    asignatura="Historia",
    aula="1A"
)

horario.render("horario.png")
```

## Características

* Exportación a PNG.
* Tamaño de imagen configurable.
* Tipografías personalizables.
* Celdas de duración variable.
* Soporte para descansos y recreos.
* Etiquetas opcionales de aula y profesor.
* Ajuste automático de texto.
* Temas visuales configurables.

También es posible cargar los datos desde un archivo JSON:

```python
from aulahorario import render_json

render_json("horario.json", "horario.png")
```

## Desarrollo

Para ejecutar las pruebas:

```bash
pytest
```

Las contribuciones son bienvenidas, especialmente nuevos formatos de exportación, mejoras de accesibilidad y ejemplos de integración.

Si encuentras un problema, abre una incidencia incluyendo un ejemplo mínimo que permita reproducirlo.

## Licencia

AulaHorario es software libre y se distribuye bajo la licencia MIT. Consulta `LICENSE` para obtener más información.
