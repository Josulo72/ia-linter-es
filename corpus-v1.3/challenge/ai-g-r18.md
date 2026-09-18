# FestivosCCAA

FestivosCCAA es una biblioteca de Python para consultar los días festivos de las comunidades autónomas españolas. Le das un año y una comunidad y devuelve las fechas con su nombre.

Está pensada para calendarios laborales, programas de turnos, informes y cualquier cosa donde necesites saber si un día es festivo sin copiar una tabla a mano.

## Instalación

```bash
pip install festivos-ccaa
```

## Uso

```python
from festivos_ccaa import festivos

dias = festivos(2026, "castilla-y-leon")

for dia in dias:
    print(dia.fecha, dia.nombre)
```

También puedes preguntar directamente por una fecha:

```python
from datetime import date
from festivos_ccaa import es_festivo

es_festivo(date(2026, 4, 23), "castilla-y-leon")
```

La función devuelve `True` o `False`.

Se pueden usar los identificadores de comunidad en minúsculas y con guiones, por ejemplo `galicia`, `madrid`, `andalucia` o `castilla-la-mancha`. La lista completa está en `festivos_ccaa.comunidades()`.

## Qué incluye

La biblioteca guarda los festivos estatales y autonómicos publicados para cada año soportado. Los festivos locales, como los del municipio de León o Vigo, no están incluidos porque dependen de cada ayuntamiento.

Los datos van dentro del paquete. Consultarlos no hace ninguna petición a internet.

Ahora mismo tengo cargados los calendarios desde 2020 hasta 2027. Cuando se publique un año nuevo habrá que añadirlo y sacar una versión de la biblioteca. Prefiero esto a intentar adivinar fechas futuras, sobre todo cuando una fiesta se traslada de día.

Si detectas una fecha incorrecta, abre una incidencia indicando la comunidad, el año y la fuente oficial.

## Licencia

FestivosCCAA se distribuye con licencia MIT.
