# water-meter-serial

Librería para leer datos de contadores de agua a través del puerto serie. Si tienes un contador digital o inteligente que habla por serie, puedes conectarlo a un ordenador y obtener las lecturas programáticamente.

Útil para automatización de viviendas inteligentes, monitorización de consumo, o simplemente para hacer que tus datos no queden atrapados en una pantalla LCD.

## Instalación

```
pip install water-meter-serial
```

Necesitas Python 3.6+. También necesitarás `pyserial` que se instala automáticamente.

## Conexión

Conecta el contador al puerto serie de tu PC (COM1 en Windows, /dev/ttyUSB0 en Linux, /dev/tty.usbserial en Mac). Si usas un adaptador USB-serie, funciona igual.

## Uso básico

```python
from water_meter import WaterMeter

meter = WaterMeter('/dev/ttyUSB0', baudrate=9600)
lectura = meter.read()

print(f"Consumo: {lectura.volume} litros")
print(f"Hora: {lectura.timestamp}")
```

Especificas el puerto donde está conectado y la velocidad en baudios. La mayoría de contadores usan 9600. Luego llamas a read() y sacas los datos.

## Lo que obtienen

Volumen acumulado, consumo actual, hora de la lectura, estado del dispositivo. Algunos contadores dan más información: temperatura, presión, alarmas. La librería los parsea y te los devuelve en un objeto.

## Protocolos soportados

Modbus RTU, que es lo más común. DNP3 si tienes un contador más antiguo. El protocolo se detecta automáticamente aunque lo puedes especificar tú.

## Limitaciones

Depende de que tu contador tenga puerto serie. Los más viejos mecánicos no. También necesitas saber la configuración exacta del puerto, porque si no coinciden los parámetros, simplemente no recibes nada. Algunos contadores son muy poco tolerantes con errores de comunicación.

## Error handling

Si algo falla, la librería lanza excepciones claras. Si el puerto no existe, timeout, basura en los datos, todo eso lo reporta sin ambigüedad.

## Casos de uso

Domótica: lee el consumo cada hora y alerta si es anormal. Sistema de facturación automática. Detección de fugas: si el consumo no baja por la noche, algo roto hay.

## Contribuir

Probamos con varios modelos pero no todos. Si tienes un contador exótico, avísanos si no funciona. Los logs de comunicación ayudan.

MIT License. Úsalo.
