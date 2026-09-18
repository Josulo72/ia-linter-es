# Enlace Roto

Enlace Roto revisa una web, busca enlaces que ya no funcionan y manda un correo cuando encuentra alguno. Le das una URL de inicio y va recorriendo las páginas del mismo sitio. Si un enlace devuelve un 404, da error al conectar o tarda demasiado, lo apunta.

Está pensado para webs pequeñas y medianas que no necesitan montar un servicio entero de monitorización para esto.

## Instalación

Necesitas Python 3.11 o posterior.

```bash
git clone https://github.com/ejemplo/enlace-roto.git
cd enlace-roto
pip install -r requirements.txt
```

Copia el fichero de configuración de ejemplo:

```bash
cp config.example.toml config.toml
```

Ahí puedes poner la web que quieres revisar y los datos del servidor de correo:

```toml
url = "https://ejemplo.com"
timeout = 10

[email]
smtp = "smtp.ejemplo.com"
port = 587
from = "avisos@ejemplo.com"
to = "webmaster@ejemplo.com"
```

Para hacer una comprobación:

```bash
python -m enlaceroto config.toml
```

Al terminar muestra por pantalla cuántas páginas ha visitado y qué enlaces han fallado. Si hay errores, manda el mismo resultado por correo.

No sigue enlaces que salgan del dominio configurado, aunque sí los comprueba. Tampoco ejecuta JavaScript, así que los enlaces que una página crea después de cargar no aparecen.

Para usarlo de forma periódica, lo más sencillo es añadir el comando a `cron` o a un temporizador de `systemd`.

Ahora mismo distingue entre errores HTTP, problemas de conexión y tiempos de espera. Tengo pendiente guardar un histórico para no mandar el mismo aviso cada vez que un enlace sigue roto durante varios días.

El proyecto se publica bajo licencia MIT.
