# Copias de Seguridad a Disco Externo

Herramienta de línea de comandos escrita en Python que automatiza la copia de seguridad de una carpeta del sistema hacia un disco externo conectado por USB. Está pensada para usuarios que quieren proteger sus archivos personales sin depender de servicios en la nube ni de software propietario.

## Características

- Detecta automáticamente el disco externo conectado.
- Copia únicamente los archivos nuevos o modificados desde la última ejecución.
- Genera un registro (`log`) con la fecha, la hora y los archivos copiados.
- Permite excluir carpetas o extensiones mediante un archivo de configuración.
- Verifica la integridad de los archivos copiados comparando sumas de comprobación (checksum).

## Requisitos

- Python 3.8 o superior.
- Sistema operativo Linux, macOS o Windows.
- Un disco externo con espacio suficiente.

## Instalación

```bash
git clone https://github.com/usuario/backup-disco-externo.git
cd backup-disco-externo
pip install -r requirements.txt
```

## Uso

Para lanzar una copia de seguridad básica:

```bash
python backup.py --origen /home/usuario/Documentos --destino /media/usuario/DISCO_EXTERNO
```

También se puede definir un archivo de configuración en formato YAML para guardar las rutas habituales y las exclusiones:

```yaml
origen: /home/usuario/Documentos
destino: /media/usuario/DISCO_EXTERNO
excluir:
  - "*.tmp"
  - "cache/"
```

Y ejecutar el programa apuntando a ese archivo:

```bash
python backup.py --config config.yaml
```

## Programación automática

El proyecto incluye un script de ejemplo para programar la copia con `cron` en Linux o con el Programador de tareas en Windows, de forma que la copia se realice cada día sin intervención manual.

## Contribuir

Las contribuciones son bienvenidas. Si encuentras un error o tienes una idea de mejora, abre un *issue* o envía un *pull request*. Antes de contribuir, revisa las guías de estilo del código en el archivo `CONTRIBUTING.md`.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente, siempre citando la fuente original.
