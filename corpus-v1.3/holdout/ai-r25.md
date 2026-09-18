# PistaClub

PistaClub es una aplicación web de software libre para gestionar las reservas de pistas de pádel de un club. Permite a los socios consultar la disponibilidad, reservar franjas horarias y cancelar sus reservas, mientras que el personal del club puede administrar pistas, horarios y bloqueos desde un panel centralizado.

El proyecto está pensado para clubes pequeños y medianos que quieran alojar su propio sistema y mantener el control sobre sus datos.

## Funcionalidades

* Registro e inicio de sesión de socios.
* Calendario de disponibilidad por pista.
* Reservas por fecha y franja horaria.
* Cancelación de reservas.
* Límites configurables por usuario.
* Bloqueo de pistas por mantenimiento o eventos.
* Panel de administración.
* Historial de reservas.
* Diseño adaptable a móvil y escritorio.

## Instalación

Necesitas Node.js 20 o superior, PostgreSQL y npm.

```bash
git clone https://example.org/pistaclub.git
cd pistaclub
npm install
cp .env.example .env
```

Configura la conexión a la base de datos en `.env` y ejecuta las migraciones:

```bash
npm run db:migrate
npm run dev
```

La aplicación estará disponible en el puerto configurado en el archivo de entorno.

## Configuración

El administrador puede definir:

* Número y nombre de las pistas.
* Horario de apertura.
* Duración de cada reserva.
* Antelación máxima permitida.
* Número máximo de reservas activas por socio.
* Periodo mínimo para cancelar una reserva.

## Producción

Antes de desplegar PistaClub en un servidor público, configura HTTPS, utiliza contraseñas seguras para la base de datos y revisa las variables de entorno.

Para generar la versión de producción:

```bash
npm run build
npm start
```

## Contribuir

Puedes colaborar mediante incidencias y solicitudes de cambios. Antes de enviar código, ejecuta:

```bash
npm test
npm run lint
```

## Licencia

PistaClub se publica bajo la licencia GNU AGPLv3. Consulta el archivo `LICENSE` para conocer los términos completos.
