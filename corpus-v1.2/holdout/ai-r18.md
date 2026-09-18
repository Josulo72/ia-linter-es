# es-holidays

Librería para consultar días festivos españoles según la comunidad autónoma. Si tu sistema necesita saber cuándo no hay clases, cuándo no abre el banco, o simplemente qué festividades se celebran en cada región, aquí está.

Maneja los festivos nacionales obligatorios, los autonómicos, y hasta los locales si los necesitas. Todo centralizado en una librería que no cambia cada vez que alguien publica una ley nueva.

## Instalación

```
pip install es-holidays
```

Python 3.7+.

## Uso

```python
from es_holidays import holidays

dias = holidays('Catalonia', 2024)
print(dias['2024-11-01'])  # "Día de Todos los Santos"

# O para un día concreto
es_festivo = holidays.is_holiday('2024-12-25', 'Madrid')
print(es_festivo)  # True
```

Especificas la comunidad, el año, y te devuelve un diccionario con los días y sus nombres. O compruebas un día concreto directamente.

## Comunidades soportadas

Andalucía, Aragón, Asturias, Baleares, Canarias, Cantabria, Castilla y León, Castilla-La Mancha, Cataluña, Ceuta, Extremadura, Galicia, La Rioja, Madrid, Melilla, Murcia, Navarra, País Vasco, Valencia. Todas.

Cada una tiene sus propias celebraciones además de las nacionales. Por ejemplo, la Diada en Cataluña, San Fermín en Navarra, la Mercè en Barcelona. Aquí están todas registradas.

## Características

Detecta automáticamente puentes (cuando un festivo cae junto a un fin de semana). Puedes pedir los festivos de un rango de fechas, de un mes, de un año entero. Los nombres están en español, por supuesto.

## Limitaciones

Los datos son históricos y proyectados hacia adelante basándose en patrones. Si el gobierno cambia algo inesperadamente, los datos pueden estar desfasados. En ese caso, abre un issue y actualizamos.

No cubre festividades locales de pueblos específicos. Solo comunidades autónomas y provincias.

## Por qué importa

Si haces un calendario, un planificador, o un gestor de recursos humanos en España, necesitas esto. Evita que tu programa crea que el 1 de enero es un día normal.

## Contribuir

Si encuentras un festivo mal registrado o una comunidad mal configurada, avísanos. Contribuciones bienvenidas.

MIT License. Úsalo libremente.
