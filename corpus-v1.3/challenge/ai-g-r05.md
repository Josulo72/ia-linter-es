# portalcuentas

portalcuentas es una aplicación de escritorio para llevar las cuentas de una comunidad de vecinos. Sirve para apuntar recibos, gastos, cuotas y pagos y ver cuánto dinero hay, quién tiene recibos pendientes y en qué se ha gastado durante el año.

Los datos se guardan en el ordenador. No hace falta crear una cuenta ni contratar ningún servicio.

## Qué se puede hacer

Puedes crear los vecinos y locales del edificio, indicar su cuota de participación y registrar los movimientos de la comunidad.

La aplicación permite llevar:

* Cuotas ordinarias y derramas.
* Pagos de cada vecino.
* Facturas y otros gastos.
* Proveedores.
* Saldos pendientes.
* Cuentas bancarias y caja.

También genera un resumen por ejercicio y un estado de cuentas por vecino.

## Instalación

Hay versiones para Windows, macOS y Linux en la página de versiones del proyecto.

En Linux también se puede ejecutar desde el código:

```bash
git clone https://github.com/ejemplo/portalcuentas.git
cd portalcuentas
npm install
npm run dev
```

## Copias de seguridad

Toda la información se guarda en una base de datos SQLite dentro de la carpeta de la aplicación. Desde `Archivo > Copia de seguridad` puedes guardar una copia en otro sitio.

Conviene hacerlo antes de cerrar un ejercicio o después de meter muchos movimientos. La aplicación no sincroniza los datos con la nube por su cuenta.

## Importar y exportar

Se pueden importar vecinos y movimientos desde CSV. También puedes exportar los listados a CSV para abrirlos en LibreOffice, Excel o cualquier programa parecido.

Los informes anuales se pueden guardar en PDF.

## Lo que falta

Ahora mismo no hay conciliación bancaria automática. Los movimientos del banco se pueden importar desde CSV, pero hay que relacionarlos con los recibos a mano.

Tampoco envío avisos por correo desde la aplicación. Está en la lista, aunque antes quiero dejar bien resueltos los cierres de ejercicio y las derramas.

## Privacidad

No hay telemetría. La aplicación no envía nombres, importes ni movimientos a ningún servidor.

## Licencia

portalcuentas se publica con licencia AGPL-3.0.
