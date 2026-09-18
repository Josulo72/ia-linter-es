# Subtiempo

Subtiempo es una biblioteca de software libre para leer ficheros de subtítulos y corregir sus marcas de tiempo. Permite trabajar con subtítulos desincronizados, aplicar desplazamientos globales y ajustar progresivamente los tiempos cuando el desfase aumenta durante la reproducción.

Está diseñada para integrarse en aplicaciones, scripts de automatización y herramientas de edición audiovisual.

## Formatos compatibles

Actualmente se admiten:

* SubRip (`.srt`)
* WebVTT (`.vtt`)
* SubStation Alpha (`.ssa`)
* Advanced SubStation Alpha (`.ass`)

Cada fichero se convierte internamente en una secuencia de objetos con tiempo de inicio, tiempo de fin, texto y metadatos opcionales.

## Instalación

```bash
pip install subtiempo
```

También puedes instalar la versión de desarrollo:

```bash
git clone https://example.org/subtiempo.git
cd subtiempo
pip install -e .
```

## Uso básico

```python
from subtiempo import Subtitulos

subs = Subtitulos.leer("pelicula.srt")
subs.desplazar(1500)
subs.guardar("pelicula_corregida.srt")
```

El desplazamiento se expresa en milisegundos. Los valores positivos retrasan los subtítulos y los negativos los adelantan.

Para corregir un desfase progresivo pueden indicarse dos puntos de referencia:

```python
subs.ajustar(
    original_inicio=60_000,
    correcto_inicio=61_000,
    original_fin=5_400_000,
    correcto_fin=5_406_000,
)
```

La biblioteca calcula una transformación lineal y ajusta todas las marcas intermedias.

## Validación

Subtiempo detecta intervalos negativos, líneas mal formadas y subtítulos cuyo final aparece antes que el inicio. El modo estricto genera una excepción; el modo tolerante intenta conservar el contenido y registra una advertencia.

## Desarrollo

Las contribuciones son bienvenidas. El repositorio incluye pruebas automatizadas para los formatos admitidos y varios ficheros de ejemplo.

Ejecuta las pruebas con:

```bash
pytest
```

## Licencia

Subtiempo se distribuye bajo la licencia MIT.
