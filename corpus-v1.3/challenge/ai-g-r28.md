# Meteocasa

Meteocasa es una biblioteca de Python para consultar los datos de una estación meteorológica casera. Lee temperatura, humedad, presión, lluvia y viento desde un pequeño servidor que tengas en la red local.

La idea es separar el cacharro que recoge las mediciones del código que luego las usa. Puedes tener una Raspberry Pi con los sensores en el tejado y consultar los datos desde otro programa sin preocuparte por cómo están conectados.

## Instalación

```bash
python -m pip install meteocasa
```

O desde el repositorio:

```bash
git clone https://github.com/usuario/meteocasa.git
cd meteocasa
python -m pip install .
```

## Uso

```python
from meteocasa import Estacion

estacion = Estacion("http://192.168.1.40:8080")

datos = estacion.actual()
print(datos.temperatura)
print(datos.humedad)
print(datos.presion)
```

Para consultar las últimas mediciones:

```python
for dato in estacion.historial(horas=24):
    print(dato.fecha, dato.temperatura)
```

Las fechas se devuelven con zona horaria. Las temperaturas van en grados Celsius, la presión en hPa, la lluvia en milímetros y el viento en km/h.

## Formato esperado

La estación debe exponer un endpoint `/actual` que devuelva JSON:

```json
{
  "fecha": "2026-09-18T18:30:00+02:00",
  "temperatura": 21.4,
  "humedad": 63,
  "presion": 1016.8,
  "lluvia": 0.0,
  "viento": 7.2
}
```

En `docs/protocolo.md` está el formato completo, incluido el historial.

La biblioteca valida los campos antes de devolverlos. Si falta una medida, conserva el resto y deja ese valor como `None`. Si el servidor no responde o manda algo que no es JSON, lanza una excepción clara para que el programa que la use pueda decidir qué hacer.

De momento solo funciona por HTTP. Quiero añadir MQTT, pero todavía no está hecho.

## Licencia

Meteocasa se publica bajo licencia MIT.
