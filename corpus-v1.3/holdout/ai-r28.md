# MeteoCasa

**MeteoCasa** es una biblioteca de software libre para consultar los datos recogidos por una estación meteorológica casera. Proporciona una interfaz sencilla para acceder desde Python a mediciones como temperatura, humedad, presión atmosférica, precipitación o velocidad del viento sin depender directamente del formato utilizado por cada sensor.

La biblioteca está pensada tanto para pequeños proyectos de automatización doméstica como para paneles de visualización, registros históricos y experimentos educativos.

## Características

* Consulta de las últimas observaciones.
* Acceso a registros históricos.
* Lectura de temperatura, humedad, presión, lluvia y viento.
* Conversión básica de unidades.
* Respuestas mediante objetos Python fáciles de procesar.
* Adaptadores para distintas fuentes de datos.
* Posibilidad de usar una estación local sin conexión a servicios externos.

## Instalación

Requiere Python 3.10 o posterior.

```bash
pip install meteocasa
```

Para instalar la versión de desarrollo:

```bash
git clone https://example.org/meteocasa.git
cd meteocasa
pip install -e .
```

## Ejemplo

```python
from meteocasa import Estacion

estacion = Estacion("http://192.168.1.50")

datos = estacion.actual()

print(datos.temperatura)
print(datos.humedad)
print(datos.presion)
```

Para consultar un intervalo histórico:

```python
registros = estacion.historial(
    desde="2026-09-01",
    hasta="2026-09-07"
)

for registro in registros:
    print(registro.fecha, registro.temperatura)
```

La disponibilidad de cada variable depende del hardware de la estación y del adaptador utilizado.

## Contribuir

Las contribuciones son bienvenidas, especialmente nuevos adaptadores para estaciones y sensores. Puedes abrir una incidencia antes de implementar cambios importantes para comentar el diseño.

Las pruebas se ejecutan con:

```bash
pytest
```

## Licencia

MeteoCasa se distribuye bajo licencia MIT. Puedes utilizarla y modificarla libremente respetando las condiciones indicadas en `LICENSE`.
