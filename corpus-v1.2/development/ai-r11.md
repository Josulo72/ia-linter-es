# Enlacero

Enlacero es una herramienta de software libre que recorre un sitio web, detecta los enlaces rotos y envía un informe por correo electrónico. Está pensada para quien mantiene una web y no quiere descubrir por un aviso de un visitante que media sección apunta a páginas que ya no existen.

## Características

- Rastreo recursivo del sitio a partir de una URL inicial.
- Comprobación de enlaces internos y externos.
- Detección de códigos de estado 4xx y 5xx, redirecciones encadenadas y tiempos de espera agotados.
- Informe en HTML y en texto plano, con la página de origen de cada enlace roto.
- Envío automático por SMTP.
- Ejecución programada mediante cron o systemd timers.

## Instalación

```bash
pip install enlacero
```

También puede instalarse desde el código fuente:

```bash
git clone https://example.org/enlacero.git
cd enlacero
pip install -e .
```

## Uso

La forma más simple de ejecutarlo es indicando la URL a revisar:

```bash
enlacero https://ejemplo.org
```

Para enviar el informe por correo hay que definir la configuración de envío:

```bash
enlacero https://ejemplo.org --correo admin@ejemplo.org --config enlacero.toml
```

## Configuración

El fichero `enlacero.toml` admite las siguientes secciones:

```toml
[rastreo]
profundidad_maxima = 5
retardo = 0.5
ignorar = ["/admin/", "*.pdf"]

[correo]
servidor = "smtp.ejemplo.org"
puerto = 587
usuario = "avisos@ejemplo.org"
destinatarios = ["admin@ejemplo.org"]
```

El parámetro `retardo` establece una pausa entre peticiones para no sobrecargar el servidor. Se recomienda no bajar de 0,5 segundos en sitios ajenos.

## Requisitos

- Python 3.9 o superior.
- Acceso a un servidor SMTP para el envío de informes.

## Contribuir

Las aportaciones son bienvenidas. Antes de abrir una solicitud de incorporación de cambios, conviene abrir una incidencia para comentar la propuesta. El proyecto sigue la guía de estilo PEP 8 y todas las aportaciones deben incluir pruebas.

## Licencia

Distribuido bajo licencia GPL-3.0. Consulta el fichero `LICENSE` para más detalles.
