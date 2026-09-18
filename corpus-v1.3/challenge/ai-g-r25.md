# PistaLibre

PistaLibre es una aplicación web para gestionar las reservas de las pistas de pádel de un club. Los socios entran con su cuenta, ven los huecos libres y reservan una pista. El personal del club puede bloquear horas, cancelar reservas y cambiar los horarios desde el panel de administración.

La idea es sustituir el Excel, el grupo de WhatsApp y las llamadas para preguntar si queda pista a las siete.

## Qué hace

Cada pista puede tener su propio horario y duración de reserva. Por ejemplo, la pista 1 puede abrir de 09:00 a 22:30 con turnos de 90 minutos y la pista 2 cerrar antes los domingos.

Los socios pueden:

* consultar la disponibilidad por día;
* reservar y cancelar sus propias horas;
* ver sus próximas reservas;
* recibir un correo cuando una reserva se crea o se cancela.

Los administradores pueden crear pistas, bloquear franjas por mantenimiento o torneos y limitar cuántas reservas puede tener un socio a la vez.

No incluye pagos. Está pensado para clubes donde la pista entra en la cuota o se cobra por otro lado.

## Puesta en marcha

Necesitas Docker y Docker Compose.

```bash
git clone https://github.com/ejemplo/pistalibre.git
cd pistalibre
cp .env.example .env
docker compose up -d
```

Después abre `http://localhost:8080`.

Para crear el primer administrador:

```bash
docker compose exec app python manage.py createsuperuser
```

La configuración está en `.env`. Ahí puedes cambiar la base de datos, el servidor de correo, la URL pública y la zona horaria.

## Estado del proyecto

La reserva normal, las cancelaciones, los bloqueos y los límites por socio funcionan. Lo he probado con un club pequeño de cuatro pistas y unos 120 usuarios.

Todavía faltan las reservas recurrentes y una lista de espera cuando un turno está lleno. La vista en móvil funciona, aunque el panel de administración sigue siendo bastante más cómodo en una pantalla grande.

## Licencia

PistaLibre se publica con licencia AGPL-3.0.
