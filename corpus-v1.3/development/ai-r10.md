# PisoComún

PisoComún es una aplicación web de software libre para registrar y repartir los gastos de una casa compartida. Permite anotar pagos, indicar quién participó en cada gasto y consultar cuánto debe aportar o recibir cada persona.

El objetivo es ofrecer una herramienta sencilla que pueda instalarse en un servidor propio, sin depender de plataformas comerciales ni entregar los datos financieros del hogar a terceros.

## Características

* Creación de hogares y miembros.
* Registro de gastos con fecha, categoría y descripción.
* Reparto a partes iguales o mediante cantidades personalizadas.
* Cálculo automático de saldos.
* Historial de pagos.
* Registro de transferencias entre miembros.
* Exportación de movimientos a CSV.
* Diseño adaptable a móvil y escritorio.

## Instalación

Necesitas Python 3.12 o posterior y una base de datos PostgreSQL.

```bash
git clone https://example.org/pisocomun.git
cd pisocomun
pip install -r requirements.txt
```

Crea el archivo de configuración:

```bash
cp .env.example .env
```

Edita `.env` para definir la conexión a la base de datos y una clave secreta para la aplicación.

Después, ejecuta las migraciones e inicia el servidor:

```bash
python manage.py migrate
python manage.py runserver
```

La aplicación estará disponible por defecto en `http://localhost:8000`.

## Uso

Cada hogar tiene su propia lista de miembros. Al registrar un gasto se indica quién pagó y entre qué personas debe repartirse. PisoComún actualiza los saldos inmediatamente.

Los saldos representan deudas internas y no realizan movimientos bancarios reales. Cuando dos personas realizan un pago entre ellas, pueden registrarlo como transferencia para actualizar las cantidades pendientes.

## Privacidad

PisoComún no incluye herramientas de seguimiento ni publicidad. En instalaciones propias, todos los datos permanecen en la infraestructura administrada por quien despliega la aplicación.

## Contribuir

Puedes informar de errores, proponer mejoras o enviar *pull requests*. Las nuevas funciones deben incluir pruebas cuando sea posible.

## Licencia

PisoComún se distribuye bajo la licencia AGPL-3.0.
