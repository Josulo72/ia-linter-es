# LaCuenta

LaCuenta es una aplicación web para apuntar los gastos de una casa compartida. Metes quién ha pagado el alquiler, la compra, internet o unas bombillas, y calcula cuánto debe cada persona.

Está pensada para pisos donde unas veces paga uno y otras otro. No hace falta cuadrar cada gasto en el momento. Se van apuntando y la aplicación mantiene el saldo.

## Cómo funciona

Cada casa tiene miembros y gastos. Al crear un gasto indicas quién pagó, cuánto costó y entre quiénes se reparte.

Por ejemplo:

```text
Compra del martes
48,30 €
Pagó: Marta
Se reparte entre: Marta, Luis y Bea
```

LaCuenta suma las partes y enseña algo como "Luis debe 16,10 € a Marta". Si después Luis paga internet, los saldos se compensan solos.

También puedes repartir un gasto con cantidades distintas. Viene bien si una persona no estaba en casa ese mes o si alguien pidió algo aparte.

## Instalación

Necesitas Node.js 22 y PostgreSQL.

```bash
git clone https://github.com/ejemplo/lacuenta.git
cd lacuenta
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:3000
```

En `.env` tienes que configurar la conexión a PostgreSQL y una clave para las sesiones.

Hay una vista con el historial completo y otra con los saldos actuales. Los gastos se pueden editar y borrar, y al hacerlo las cuentas se recalculan.

Ahora mismo no hay aplicación móvil, aunque la web se adapta bastante bien a una pantalla pequeña. Tampoco se conecta con bancos ni importa movimientos automáticamente. Todo se apunta a mano.

Para desarrollo:

```bash
npm test
npm run lint
```

Las migraciones de base de datos están en `db/migrations`. Si cambias el esquema, añade una nueva en vez de modificar las que ya existen.

## Licencia

LaCuenta es software libre y se publica bajo licencia AGPL-3.0.
