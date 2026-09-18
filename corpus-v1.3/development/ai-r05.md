# Comunidad Clara

Comunidad Clara es una aplicación de escritorio de software libre para gestionar las cuentas de una comunidad de vecinos. Permite registrar ingresos y gastos, controlar cuotas, consultar saldos y generar informes sencillos sin depender de hojas de cálculo complejas ni servicios en la nube.

Los datos se guardan localmente, por lo que la comunidad mantiene el control sobre su información.

## Funciones principales

* Registro de propietarios y viviendas.
* Definición de cuotas ordinarias y extraordinarias.
* Seguimiento de cuotas pagadas y pendientes.
* Registro de facturas, recibos y otros gastos.
* Clasificación de movimientos por categorías.
* Control de proveedores.
* Resumen de ingresos, gastos y saldo disponible.
* Exportación de informes a PDF y CSV.
* Copias de seguridad de la base de datos.
* Gestión de varios ejercicios contables.

## Instalación

Descarga la versión correspondiente a tu sistema operativo desde la sección de versiones del proyecto.

Para ejecutar el código fuente:

```bash
git clone https://example.org/comunidad-clara.git
cd comunidad-clara
npm install
npm run start
```

## Uso

Al abrir la aplicación por primera vez, crea una comunidad e introduce las viviendas que la forman. Después puedes configurar las cuotas y comenzar a registrar movimientos.

Cada gasto puede incluir fecha, concepto, proveedor, categoría e importe. Del mismo modo, los cobros pueden asociarse a una vivienda para consultar rápidamente qué cuotas están satisfechas y cuáles permanecen pendientes.

## Privacidad y copias de seguridad

Comunidad Clara no necesita una cuenta de usuario ni envía automáticamente la información contable a servidores externos. La base de datos se almacena en el equipo.

Se recomienda realizar copias de seguridad periódicas y conservar al menos una copia en una ubicación diferente.

## Aviso

La aplicación facilita la organización de la información, pero no sustituye el asesoramiento profesional ni garantiza el cumplimiento de obligaciones contables, fiscales o legales específicas.

## Contribuir

Puedes colaborar mediante informes de errores, propuestas de funciones, traducciones o solicitudes de cambios.

## Licencia

Comunidad Clara se distribuye bajo la licencia AGPL-3.0. Consulta `LICENSE` para conocer sus condiciones.
