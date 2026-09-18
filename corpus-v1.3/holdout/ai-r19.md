# AguaSerial

AguaSerial es una biblioteca de software libre para leer los datos enviados por un contador de agua mediante un puerto serie. Está diseñada para integrarse en sistemas de monitorización, pequeños servidores domésticos, equipos industriales y proyectos de adquisición de datos.

La biblioteca se ocupa de abrir la conexión serie, recibir las tramas del contador, comprobar su formato y convertir los valores obtenidos en estructuras fáciles de utilizar desde una aplicación.

## Características

* Comunicación mediante puerto serie.
* Lectura continua o bajo demanda.
* Decodificación de tramas del contador.
* Validación básica de los mensajes recibidos.
* Acceso al consumo acumulado y otros campos disponibles.
* Configuración de velocidad, paridad y tiempo de espera.
* API independiente del sistema de almacenamiento utilizado.
* Registro opcional de datos sin procesar para diagnóstico.

## Instalación

```bash
pip install aguaserial
```

También puedes instalar el código del repositorio:

```bash
git clone https://example.org/aguaserial.git
cd aguaserial
pip install -e .
```

## Uso

```python
from aguaserial import Contador

contador = Contador(
    puerto="/dev/ttyUSB0",
    velocidad=9600
)

lectura = contador.leer()

print(lectura.consumo_litros)
```

Para recibir lecturas continuamente:

```python
for lectura in contador.escuchar():
    print(lectura.fecha, lectura.consumo_litros)
```

En Windows, el puerto puede especificarse mediante nombres como `COM3` o `COM4`.

## Compatibilidad

Los fabricantes pueden utilizar protocolos y formatos de trama diferentes. AguaSerial incluye una arquitectura de adaptadores para implementar variantes sin modificar el núcleo de la biblioteca.

Antes de conectar un dispositivo, consulta su documentación técnica para conocer los parámetros correctos del puerto serie y los niveles eléctricos utilizados. No todos los contadores pueden conectarse directamente a un adaptador serie convencional.

## Contribuir

Puedes colaborar añadiendo soporte para nuevos modelos, pruebas automatizadas o documentación. Los ejemplos de tramas deben anonimizar cualquier identificador del dispositivo.

## Licencia

AguaSerial se distribuye bajo licencia LGPL-3.0.
