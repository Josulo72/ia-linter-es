reservapadel es una aplicación web para que los socios de un club reserven pista de pádel sin tener que llamar por teléfono ni apuntarse en un papel en la puerta.

Cada socio ve el calendario de las pistas, elige hora libre y la reserva a su nombre. El club puede marcar pistas como no disponibles, por mantenimiento o por un torneo, y esas horas desaparecen del calendario para todo el mundo. Nació de un club pequeño donde llevaban las reservas por WhatsApp y se liaban con solapamientos.

## Instalación

Hace falta Node 20 y PostgreSQL.

```
git clone https://github.com/usuario/reservapadel
cd reservapadel
npm install
cp .env.example .env
npm run migrar
npm run dev
```

## Uso

El administrador del club da de alta las pistas y los horarios disponibles desde el panel de administración, en `/admin`. Los socios entran con el correo que el club les ha dado de alta y reservan desde `/reservas`.

Cada reserva dura una hora y se puede cancelar hasta dos horas antes, ese margen se cambia en la configuración del club.

## Qué falta

No cobra nada, es solo para gestionar el hueco de la pista, el pago sigue siendo cosa del club, en efectivo o como lo lleven ahora. Tampoco manda recordatorios por SMS, solo un correo el día antes, así que si un socio no mira el correo, se le puede pasar.

Lo probé con un club de cuatro pistas y unos ochenta socios, con clubes mucho más grandes no sé cómo se comporta todavía.

Licencia AGPL-3.0.
