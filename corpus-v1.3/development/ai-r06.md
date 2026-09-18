# CarpetaSegura

CarpetaSegura es una herramienta de software libre para crear copias de seguridad de una carpeta en un disco externo. Está pensada para quienes quieren proteger documentos, fotografías o proyectos sin depender de servicios en la nube ni de configuraciones complicadas.

El programa compara el contenido de la carpeta de origen con la última copia disponible y transfiere únicamente los archivos nuevos o modificados. De esta forma, las copias posteriores son más rápidas y evitan escribir datos innecesariamente en el disco externo.

## Características

* Copias completas e incrementales.
* Exclusión de archivos mediante patrones.
* Verificación de que el disco de destino está disponible.
* Registro de cada operación realizada.
* Modo de simulación para comprobar qué archivos se copiarían.
* Conservación opcional de varias versiones anteriores.
* Compatible con Linux, macOS y Windows.

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://example.org/carpetasegura.git
cd carpetasegura
pip install -r requirements.txt
```

## Uso

Para copiar la carpeta `Documentos` a un disco externo montado en `/media/backup`:

```bash
python carpetasegura.py ~/Documentos /media/backup
```

Puedes comprobar los cambios sin copiar nada:

```bash
python carpetasegura.py ~/Documentos /media/backup --simular
```

Los archivos excluidos se pueden definir en un fichero `.carpetasegura-ignore`, utilizando patrones similares a los de `.gitignore`.

## Seguridad

CarpetaSegura nunca borra archivos del origen. Antes de eliminar versiones antiguas del destino, comprueba que exista al menos una copia válida. Aun así, se recomienda probar la configuración con datos no críticos antes de utilizarla como sistema principal de respaldo.

## Contribuir

Las incidencias, propuestas y solicitudes de cambios son bienvenidas. Puedes abrir un *issue* o enviar un *pull request*.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para conocer los términos completos.
