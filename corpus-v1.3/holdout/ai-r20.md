# MisHoras

MisHoras es una aplicación móvil de software libre para apuntar las horas trabajadas cada día de forma rápida y sencilla. Está pensada para personas que quieren llevar un registro personal de su jornada sin depender de hojas de cálculo ni servicios externos.

La aplicación permite registrar la hora de inicio y finalización, añadir pausas y consultar el total trabajado por día, semana o mes. Los datos se almacenan localmente en el dispositivo y pueden exportarse para realizar copias de seguridad o utilizarlos en otras herramientas.

## Características

* Registro diario de horas trabajadas.
* Entrada manual de inicio y fin de jornada.
* Control de pausas.
* Cálculo automático de horas efectivas.
* Resumen semanal y mensual.
* Notas asociadas a cada jornada.
* Edición y eliminación de registros.
* Exportación de datos en CSV.
* Funcionamiento sin conexión.
* Almacenamiento local.

## Desarrollo

Clona el repositorio:

```bash
git clone https://example.org/mishoras.git
cd mishoras
```

Instala las dependencias:

```bash
flutter pub get
```

Ejecuta la aplicación en un dispositivo o emulador:

```bash
flutter run
```

Para generar una versión de Android:

```bash
flutter build apk
```

## Uso

Al abrir la aplicación puedes crear un registro para el día actual e introducir las horas de entrada y salida. MisHoras calcula automáticamente la duración de la jornada descontando las pausas configuradas.

El historial permite revisar días anteriores y corregir cualquier registro. Desde la sección de estadísticas puedes consultar las horas acumuladas durante distintos periodos.

La exportación CSV genera un archivo que puede abrirse con aplicaciones de hojas de cálculo o procesarse mediante otras herramientas.

## Privacidad

MisHoras no necesita una cuenta de usuario. Por defecto, toda la información permanece almacenada en el dispositivo y no se envía a servidores externos.

## Contribuir

Puedes colaborar informando de errores, traduciendo la interfaz, mejorando la accesibilidad o enviando nuevas funcionalidades mediante *pull requests*.

## Licencia

MisHoras se distribuye bajo la licencia GPL-3.0.
