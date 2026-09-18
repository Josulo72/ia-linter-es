cuentapiso es una aplicación web para apuntar los gastos de una casa compartida y saber quién debe qué a quién sin tener que hacer cuentas a mano.

Cada persona de la casa apunta lo que paga y a quién afecta el gasto, si es a todos o solo a algunos. La aplicación va sumando y, cuando quieres saldar cuentas, te dice el mínimo número de pagos que hacen falta para que todos queden a cero. Eso es lo que más me gusta, porque antes acabábamos haciendo cinco transferencias cuando con dos bastaba.

## Instalación

Hace falta Node 20 y una base de datos PostgreSQL.

```
git clone https://github.com/usuario/cuentapiso
cd cuentapiso
npm install
cp .env.example .env
npm run migrar
npm run dev
```

Edita el `.env` con los datos de tu base de datos antes del paso de migrar.

## Uso

Entras en `http://localhost:3000`, creas una casa, invitas a tus compañeros con un enlace y ya podéis empezar a apuntar gastos. Cada gasto lleva quién lo pagó, cuánto, una descripción corta y entre quiénes se reparte.

## Qué falta

No hay app móvil, solo la web, aunque se ve bien en el móvil porque el diseño es responsivo. Tampoco integra ningún banco ni Bizum, los pagos reales los seguís haciendo fuera, esto solo lleva la cuenta. Y de momento no admite varias monedas, todo va en euros.

Lo llevamos usando cuatro personas en un piso desde hace unos meses y no ha fallado, pero no está pensado para casas de treinta personas ni nada por el estilo.

Licencia AGPL-3.0, porque si alguien monta esto como servicio quiero que las mejoras vuelvan.
