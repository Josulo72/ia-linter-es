rutabus calcula cómo ir de una parada a otra en autobús urbano, usando los datos abiertos que publican los ayuntamientos en formato GTFS.

Le pasas un archivo GTFS, el que descargas de la web de transporte de tu ciudad, y te devuelve las combinaciones de líneas que te llevan de un punto a otro, con los tiempos de espera incluidos. No calcula rutas a pie ni mezcla con metro, de momento solo autobús.

## Instalación

```
pip install rutabus
```

## Uso

```python
from rutabus import Red

red = Red.desde_gtfs("datos_gtfs.zip")
opciones = red.buscar_ruta(origen="Parada 145", destino="Parada 302", hora="08:30")

for opcion in opciones:
    print(opcion.lineas, opcion.duracion_minutos)
```

Si tu ciudad no publica GTFS todavía, esto no te sirve, tendría que ser la propia empresa de transporte la que lo saque. La mayoría de capitales de provincia en España ya lo hacen, lo he probado con Zaragoza, Valencia y Madrid.

## Qué falta

No tiene en cuenta retrasos en tiempo real, trabaja con el horario teórico, así que si un autobús va tarde el cálculo no lo sabe. Tampoco optimiza por número de trasbordos, solo por tiempo total, con lo cual a veces da una ruta con dos cambios cuando había una con uno que tardaba casi lo mismo. Lo iré afinando.

Con redes muy grandes, de más de quinientas paradas, tarda unos segundos en cargar el GTFS la primera vez. Luego va rápido porque lo deja en memoria.

Licencia MIT. Los datos GTFS de cada ciudad tienen su propia licencia, revísala antes de redistribuir nada.
