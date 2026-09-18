# Aguaserie

Aguaserie es una biblioteca de Python para leer por puerto serie los datos que envían algunos contadores de agua. Abre el puerto, recibe las tramas y devuelve valores que puedas usar sin tener que trabajar directamente con bytes.

La biblioteca no configura el contador ni escribe en él. Solo lee.

## Instalación

```bash
pip install aguaserie
```

Necesitas tener acceso al puerto serie del equipo. En Linux suele ser algo como `/dev/ttyUSB0`. En Windows será normalmente `COM3`, `COM4` o parecido.

## Uso

```python
from aguaserie import Contador

contador = Contador("/dev/ttyUSB0", baudrate=9600)

for lectura in contador.lecturas():
    print(lectura.total_litros)
```

Una lectura puede traer el consumo acumulado, el número de serie del contador y algunas marcas de estado, según el modelo.

También puedes leer una sola trama:

```python
lectura = contador.leer()

print(lectura.total_litros)
print(lectura.fecha)
```

Si llega una trama incompleta o con una suma de comprobación incorrecta, la biblioteca lanza una excepción en vez de devolver datos a medias.

## Contadores compatibles

De momento he probado Aguaserie con dos modelos que envían tramas M-Bus simplificadas a través de un adaptador óptico USB. Hay otros contadores que usan conectores parecidos pero hablan protocolos distintos, así que no doy por hecho que vayan a funcionar.

En `examples/` hay un programa que imprime las tramas en bruto. Es útil para probar un contador nuevo antes de escribir el decodificador.

Me falta documentación de algunos campos de estado y más pruebas con hardware real. Las capturas usadas en los tests no sustituyen del todo a tener el contador delante.

## Licencia

Aguaserie usa la licencia LGPL-3.0.
