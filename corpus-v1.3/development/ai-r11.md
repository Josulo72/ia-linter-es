# VigíaEnlaces

VigíaEnlaces es una herramienta de software libre para comprobar automáticamente los enlaces de un sitio web y recibir un aviso por correo electrónico cuando alguno deja de funcionar. Está pensada para administradores de webs, equipos de documentación y proyectos que quieran detectar enlaces rotos antes de que afecten a sus visitantes.

## Características

* Recorre una web a partir de una URL inicial.
* Comprueba enlaces internos y externos.
* Detecta respuestas HTTP erróneas, redirecciones problemáticas y tiempos de espera.
* Evita revisar repetidamente la misma dirección durante una ejecución.
* Genera un resumen con los enlaces que han fallado.
* Envía el informe por correo mediante un servidor SMTP.
* Permite limitar la profundidad del rastreo y el número máximo de páginas.
* Puede ejecutarse manualmente o mediante `cron`.

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://example.org/vigia-enlaces.git
cd vigia-enlaces
pip install -r requirements.txt
```

## Configuración

Copia el fichero de ejemplo:

```bash
cp config.example.toml config.toml
```

Edita `config.toml` para indicar la web que quieres revisar y los datos del servidor de correo:

```toml
url = "https://ejemplo.org"
profundidad = 3

[smtp]
servidor = "smtp.ejemplo.org"
puerto = 587
usuario = "avisos@ejemplo.org"
destinatario = "admin@ejemplo.org"
```

La contraseña SMTP puede proporcionarse mediante la variable de entorno `VIGIA_SMTP_PASSWORD`.

## Uso

Ejecuta una comprobación con:

```bash
vigia-enlaces --config config.toml
```

Para mostrar el informe sin enviar correo:

```bash
vigia-enlaces --config config.toml --sin-correo
```

El programa devuelve un código de salida distinto de cero cuando encuentra errores, por lo que también puede integrarse en tareas automatizadas o sistemas de integración continua.

## Licencia

VigíaEnlaces se distribuye bajo la licencia MIT. Las contribuciones, informes de errores y propuestas de mejora son bienvenidos.
