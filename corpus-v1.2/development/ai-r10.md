# GastosCompartidos

Aplicación web para gestionar y repartir los gastos de una casa compartida entre varios compañeros. Permite registrar pagos, calcular quién debe dinero a quién y llevar un histórico claro de todos los movimientos.

## Problema que resuelve

Cuando varias personas conviven en una misma vivienda, es habitual que unos paguen la compra, otros las facturas y otros el alquiler, generando confusión sobre quién debe compensar a quién y cuánto. Esta aplicación centraliza todos esos gastos y calcula automáticamente el saldo de cada persona.

## Funcionalidades

- Registro de gastos indicando quién ha pagado y entre quiénes se reparte.
- Cálculo automático del saldo de cada usuario (a favor o en contra).
- Sugerencia del mínimo número de transferencias necesarias para saldar las deudas.
- Categorías de gasto (compra, suministros, alquiler, ocio, otros).
- Historial completo con filtros por fecha y categoría.
- Notificaciones por correo cuando se añade un nuevo gasto.

## Tecnologías utilizadas

- Backend: Node.js con Express.
- Base de datos: PostgreSQL.
- Frontend: React con Tailwind CSS.
- Autenticación: JWT.

## Instalación local

```bash
git clone https://github.com/usuario/gastos-compartidos.git
cd gastos-compartidos
npm install
cp .env.example .env
npm run migrate
npm run dev
```

La aplicación quedará disponible en `http://localhost:3000`.

## Estructura del proyecto

```
gastos-compartidos/
├── backend/
│   ├── controllers/
│   ├── models/
│   └── routes/
├── frontend/
│   ├── src/
│   └── public/
└── docker-compose.yml
```

## Uso con Docker

```bash
docker-compose up -d
```

## Capturas de pantalla

Las capturas de pantalla de la aplicación se encuentran en la carpeta `docs/screenshots`.

## Contribuir

Este proyecto está abierto a colaboraciones. Si quieres proponer una nueva funcionalidad, abre un *issue* describiendo el caso de uso antes de empezar a programar.

## Licencia

Este software se distribuye bajo la licencia MIT.
