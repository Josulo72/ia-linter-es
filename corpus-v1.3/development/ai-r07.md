# VoltioVista

VoltioVista es un proyecto de software libre que descarga los datos de consumo eléctrico proporcionados por una distribuidora y genera gráficas para facilitar su análisis. Su objetivo es permitir que cualquier persona pueda revisar cómo evoluciona su consumo sin depender exclusivamente del portal web de la compañía.

La aplicación obtiene los registros disponibles para un periodo determinado, los almacena localmente y crea representaciones visuales por horas, días o meses.

## Características

* Descarga automática de datos de consumo.
* Almacenamiento local en CSV.
* Gráficas de consumo horario, diario y mensual.
* Comparación entre periodos.
* Detección básica de días con consumo inusualmente alto.
* Exportación de gráficas a PNG.
* Funcionamiento mediante línea de comandos.

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://example.org/voltiovista.git
cd voltiovista
pip install -r requirements.txt
```

## Configuración

Copia el archivo de ejemplo:

```bash
cp config.example.toml config.toml
```

Edita `config.toml` para indicar el identificador del punto de suministro y los datos necesarios para acceder al servicio de la distribuidora.

No incluyas credenciales reales en el repositorio. El archivo de configuración personal está excluido mediante `.gitignore`.

## Uso

Para descargar los datos del último mes:

```bash
python voltiovista.py descargar --periodo mes
```

Para generar una gráfica:

```bash
python voltiovista.py grafica --periodo mes --salida consumo.png
```

Los datos descargados se guardan en `datos/`, por lo que pueden reutilizarse sin realizar una nueva petición.

## Limitaciones

Las distribuidoras pueden modificar sus portales o interfaces de acceso. Si una actualización impide descargar datos, abre una incidencia indicando la distribuidora y el mensaje de error, evitando incluir información personal.

## Licencia

VoltioVista se publica bajo la licencia GPL-3.0.
