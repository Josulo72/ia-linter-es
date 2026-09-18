# ReservaPistas

Aplicación web para gestionar la reserva de las pistas de pádel de un club deportivo. Permite a los socios consultar la disponibilidad, reservar una pista en el horario que prefieran y cancelar reservas, mientras que el club puede administrar pistas, horarios y usuarios desde un panel independiente.

## Funcionalidades

- Calendario semanal con la disponibilidad de todas las pistas.
- Reserva de pista con selección de fecha, hora y duración.
- Cancelación de reservas con una antelación mínima configurable.
- Panel de administración para dar de alta pistas, bloquear horarios por mantenimiento y gestionar socios.
- Límite de reservas activas por socio para evitar el acaparamiento de pistas.
- Notificaciones por correo electrónico al confirmar o cancelar una reserva.

## Tecnologías

- Backend: Django y Django REST Framework.
- Base de datos: PostgreSQL.
- Frontend: Vue.js.
- Tareas programadas: Celery, para el envío de recordatorios.

## Instalación

```bash
git clone https://github.com/usuario/reserva-pistas.git
cd reserva-pistas
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

El frontend se instala y arranca por separado:

```bash
cd frontend
npm install
npm run dev
```

## Configuración de pistas y horarios

Desde el panel de administración (`/admin`) se pueden definir las pistas disponibles, el horario de apertura del club y la duración estándar de cada franja de reserva (por ejemplo, 90 minutos).

## API

La aplicación expone una API REST documentada con Swagger en la ruta `/api/docs`, que permite integrar la reserva de pistas con otras aplicaciones del club, como una app móvil.

## Despliegue

El repositorio incluye un `Dockerfile` y un `docker-compose.yml` para facilitar el despliegue en un servidor propio:

```bash
docker-compose up -d --build
```

## Contribuir

Las mejoras y correcciones son bienvenidas. Antes de enviar una *pull request*, asegúrate de que los tests pasan correctamente con `python manage.py test`.

## Licencia

Este proyecto se distribuye bajo la licencia MIT.
