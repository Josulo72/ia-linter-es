# MisHoras

MisHoras es una aplicación móvil para apuntar cuánto has trabajado cada día. Abres la app, marcas la entrada y la salida, y se guarda el tiempo. También puedes escribir las horas a mano si se te olvidó fichar.

Está hecha para llevar una cuenta personal. No hay jefes, equipos, aprobaciones ni un panel de empresa.

## Cómo funciona

Cada día puedes guardar una o varias franjas:

```text
09:02 - 14:05
15:01 - 18:12
```

MisHoras suma el tiempo y te enseña el total del día. También puedes añadir una nota corta, por ejemplo "médico por la mañana" o "guardia".

En la vista semanal aparecen las horas de cada día y la diferencia respecto a tu jornada habitual. La jornada se configura una vez en los ajustes y se puede cambiar cuando quieras.

Los registros se pueden editar. Si dejas el contador encendido por error hasta las once de la noche, no tienes que borrar el día entero.

## Datos

Todo se guarda en el teléfono. La aplicación funciona sin conexión y no necesita una cuenta.

Puedes exportar los registros a CSV:

```text
fecha,inicio,fin,minutos,nota
2026-09-14,09:02,14:05,303,
2026-09-14,15:01,18:12,191,
```

Así puedes abrirlos en LibreOffice, Excel o cualquier programa que lea CSV.

Ahora mismo la copia de seguridad es manual. Quiero añadir una exportación completa que se pueda restaurar en otro teléfono sin depender de una cuenta en la nube.

La app no pretende sustituir un sistema oficial de registro horario de una empresa. Guarda lo que introduces tú y no firma ni certifica esos datos.

## Desarrollo

El código del cliente está en `app/`. Para compilarlo necesitas Flutter estable y el SDK de Android o Xcode, según la plataforma.

## Licencia

MisHoras se publica con licencia GPL-3.0.
