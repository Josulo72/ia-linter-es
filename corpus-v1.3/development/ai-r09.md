# RutaBus

RutaBus es una biblioteca de software libre para calcular trayectos en autobús utilizando datos abiertos de transporte público. Lee redes descritas en formatos estándar, construye un grafo con paradas y servicios, y permite buscar itinerarios entre dos puntos teniendo en cuenta horarios y transbordos.

El proyecto está orientado a aplicaciones de movilidad, estudios académicos y prototipos que necesiten trabajar con transporte público sin depender de una API propietaria.

## Datos compatibles

RutaBus puede importar conjuntos de datos GTFS que incluyan, entre otros:

* Paradas.
* Líneas y recorridos.
* Horarios.
* Calendarios de servicio.
* Correspondencias entre paradas.

Los datos se validan durante la carga y los errores habituales se notifican con mensajes que indican el fichero y la fila afectada.

## Instalación

```bash
pip install rutabus
```

Para instalar desde el código fuente:

```bash
git clone https://example.org/rutabus.git
cd rutabus
pip install -e .
```

## Ejemplo

```python
from rutabus import Red

red = Red.desde_gtfs("datos/gtfs.zip")

ruta = red.buscar_ruta(
    origen="PARADA_001",
    destino="PARADA_148",
    salida="08:30"
)

for tramo in ruta.tramos:
    print(tramo)
```

Por defecto, el algoritmo intenta minimizar el tiempo total de viaje. También es posible dar prioridad a rutas con menos transbordos:

```python
ruta = red.buscar_ruta(
    origen="PARADA_001",
    destino="PARADA_148",
    salida="08:30",
    criterio="transbordos"
)
```

## Limitaciones

La calidad del resultado depende de la información publicada por cada operador. Los retrasos en tiempo real no se tienen en cuenta salvo que la aplicación que utiliza RutaBus proporcione datos adicionales.

## Contribuir

Se aceptan mejoras en algoritmos, compatibilidad con nuevos formatos, documentación y juegos de pruebas. Antes de enviar cambios importantes, se recomienda abrir una incidencia para discutir el enfoque.

## Licencia

RutaBus se publica bajo la licencia Apache-2.0.
