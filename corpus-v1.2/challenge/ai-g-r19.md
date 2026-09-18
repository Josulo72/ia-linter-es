# AguaSerial

Una biblioteca de Python para leer los datos de un contador de agua directamente por el puerto serie. Conectas el cable al puerto del ordenador, ejecutas el programa y te da el consumo actual, el consumo del día, el del mes.

Sirve para sistemas domóticos, para automatizar la lectura de contadores, para monitorizar el consumo de agua sin tener que ir a mirar el contador cada mes.

El contador tiene una salida serie estándar. La biblioteca gestiona la comunicación, interpreta el protocolo, y te devuelve los números directamente en variables Python que usas en lo que quieras.

Se conecta al puerto COM que le indiques. Puede ser USB con adaptador, puerto serie clásico, lo que sea. La biblioteca detecta automáticamente la velocidad de baudios.

He probado con varias marcas de contadores españoles. Los más comunes los lee sin problema. Algunos contadores antiguos usan otro protocolo y no funcionan, pero la mayoría estándares sí.

La lectura es casi instantánea. Desde que le das la orden a que tienes los datos pasan menos de cien milisegundos. Puedes hacer lecturas cada minuto sin problema.

Un punto débil es que algunos contadores necesitan una batería para mantener la conexión serie activa. Si lleva años sin leer, la batería se agota y necesitas cambiarla. Eso es del contador, no del programa.

También tienes que vigilar que el cable no se desconecte. Si pasa eso, la biblioteca te lo avisa y reintentas la conexión.

La usamos para un panel de control que muestra el consumo de agua en tiempo real. Los dueños ven cuánto gastan cada día, pueden detectar fugas rápido.

Es sencilla de usar. Si tienes Python y el contador conectado, en tres líneas tienes los datos. El resto es cosa tuya, qué haces con esos números.
