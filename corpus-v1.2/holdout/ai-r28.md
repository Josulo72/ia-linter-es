# estacion-lib

Biblioteca para consultar los datos de una estación meteorológica casera. Habla con los modelos domésticos más extendidos y devuelve las lecturas como objetos de Python, con unidades explícitas y marcas de tiempo fiables.

## Estaciones compatibles

- Familias basadas en el protocolo Fine Offset (WH1080, WH2900, WH3000 y derivados vendidos con otras marcas).
- Estaciones con salida Davis VantagePro2 por puerto serie o convertidor USB.
- Cualquier dispositivo que publique en una consola con firmware Ecowitt, mediante su servidor local.
- Sensores genéricos 433 MHz a través de `rtl_433`.

## Instalación

```bash
pip install estacion-lib
```

## Ejemplo

```python
from estacion import Estacion

with Estacion.detectar() as est:
    lectura = est.leer()
    print(lectura.temperatura_exterior)   # 14.3 °C
    print(lectura.humedad_exterior)       # 72 %
    print(lectura.presion_nivel_mar)      # 1017.4 hPa
    print(lectura.viento.velocidad)       # 3.2 m/s
    print(lectura.viento.direccion)       # 215° (SO)
```

`Estacion.detectar()` recorre los puertos USB y serie disponibles. Si se conoce el dispositivo, es mejor indicarlo:

```python
est = Estacion.abrir("fineoffset", puerto="/dev/ttyUSB0")
```

## Unidades

Todas las magnitudes se devuelven en unidades del sistema internacional y se convierten a petición:

```python
lectura.temperatura_exterior.en("F")
lectura.presion_nivel_mar.en("mmHg")
```

La presión reducida al nivel del mar requiere conocer la altitud de la estación; se configura una sola vez en `Estacion.abrir(..., altitud=680)`.

## Histórico

Las estaciones con memoria interna permiten descargar los registros acumulados:

```python
for r in est.historico(desde="2024-03-01"):
    print(r.fecha, r.temperatura_exterior)
```

## Registro continuo

El paquete incluye un pequeño demonio, `estaciond`, que lee cada cierto intervalo y escribe en SQLite, InfluxDB o un fichero CSV. No pretende sustituir a soluciones completas de monitorización, pero es suficiente para tener una serie propia sin depender de servicios en la nube.

## Aviso

Los sensores domésticos tienen derivas y errores sistemáticos. La biblioteca entrega lo que el aparato mide; la calibración y la interpretación corren de cuenta de quien los use.

## Licencia

Apache-2.0.
