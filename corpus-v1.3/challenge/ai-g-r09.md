# Buscamino

Buscamino es una biblioteca para calcular rutas de autobús usando datos abiertos. Le das una red en formato GTFS, una parada de origen, una de destino y una hora. Devuelve las combinaciones que encuentra, incluidos los transbordos y los tramos a pie entre paradas cercanas.

No consulta Google Maps ni ningún servicio externo. El cálculo se hace con los datos que cargues tú.

## Instalación

```bash
pip install buscamino
```

Para abrir un fichero GTFS:

```python
from buscamino import Red

red = Red.desde_gtfs("gtfs.zip")
```

Y calcular una ruta:

```python
rutas = red.buscar(
    origen="parada_123",
    destino="parada_845",
    salida="08:15",
)

for ruta in rutas:
    print(ruta)
```

La biblioteca tiene en cuenta horarios, días de servicio, excepciones del calendario y tiempos de transbordo. Si dos paradas están cerca, puede conectarlas a pie:

```python
red = Red.desde_gtfs(
    "gtfs.zip",
    distancia_a_pie=400,
)
```

La distancia está en metros. El tiempo andando se calcula con una velocidad configurable.

Buscamino devuelve objetos Python normales. Puedes sacar de cada tramo la línea, las paradas, las horas previstas y el tiempo de espera. No trae interfaz gráfica.

El soporte de GTFS está bastante cubierto para redes normales, pero quedan casos raros. Los servicios con reglas muy complicadas de frecuencia todavía pueden dar resultados incompletos. Tampoco usa tráfico en tiempo real por ahora, así que si el autobús lleva veinte minutos de retraso la biblioteca no lo sabe.

Los ejemplos de `examples/` usan conjuntos de datos pequeños para que se puedan ejecutar rápido durante las pruebas.

```bash
git clone https://github.com/ejemplo/buscamino.git
cd buscamino
pip install -e ".[dev]"
pytest
```

## Licencia

Buscamino se distribuye bajo licencia Apache-2.0.
