# FestivosCCAA

FestivosCCAA es una biblioteca de software libre para consultar y trabajar con días festivos de las comunidades autónomas de España. Su objetivo es ofrecer una interfaz sencilla para aplicaciones que necesiten comprobar si una fecha es festiva, obtener calendarios anuales o combinar festividades nacionales y autonómicas.

La biblioteca separa los datos del código de consulta para facilitar la actualización de calendarios cuando se publican nuevos festivos oficiales.

## Características

* Consulta de festivos por comunidad autónoma y año.
* Inclusión de festivos nacionales.
* Búsqueda por fecha.
* Obtención de calendarios completos.
* Nombres normalizados para cada festividad.
* Soporte para objetos `date` de Python.
* API sencilla y sin dependencias pesadas.

Los festivos locales de cada municipio no se incluyen por defecto, ya que dependen de calendarios municipales independientes.

## Instalación

```bash
pip install festivos-ccaa
```

Para trabajar con la versión de desarrollo:

```bash
git clone https://example.org/festivos-ccaa.git
cd festivos-ccaa
pip install -e .
```

## Uso

```python
from datetime import date
from festivos_ccaa import Calendario

calendario = Calendario("CL", 2026)

print(calendario.es_festivo(date(2026, 4, 23)))
```

También puedes recorrer todos los festivos disponibles:

```python
for festivo in calendario.festivos():
    print(festivo.fecha, festivo.nombre)
```

O consultar varias comunidades:

```python
from festivos_ccaa import obtener_festivos

festivos = obtener_festivos(
    anio=2026,
    comunidad="GAL"
)
```

Los identificadores de las comunidades se documentan en la API y pueden utilizarse tanto mediante abreviaturas como mediante nombres normalizados.

## Actualización de datos

Los calendarios cambian cada año. Si detectas una fecha incorrecta, abre una incidencia indicando la comunidad, el año y la fuente oficial correspondiente.

## Contribuir

Las contribuciones son bienvenidas, especialmente las correcciones de datos, nuevas pruebas y mejoras de documentación.

## Licencia

FestivosCCAA se publica bajo licencia MIT.
