# GeoTransforma

**GeoTransforma** es una biblioteca de software libre para convertir coordenadas entre distintos sistemas de referencia espacial. Está orientada a aplicaciones SIG, procesamiento de datos geográficos, herramientas científicas y scripts que necesiten transformar posiciones de forma reproducible.

La biblioteca permite identificar los sistemas mediante códigos EPSG y transformar coordenadas individuales o colecciones completas de puntos.

## Características

* Conversión entre sistemas de referencia geográficos y proyectados.
* Compatibilidad con códigos EPSG.
* Transformación de puntos individuales y listas de coordenadas.
* Manejo explícito del orden de los ejes.
* API sencilla para Python.
* Validación de sistemas de referencia.
* Integración con estructuras de datos habituales.

## Instalación

Requiere Python 3.10 o posterior.

```bash
pip install geotransforma
```

También puedes instalar el código fuente:

```bash
git clone https://example.org/geotransforma.git
cd geotransforma
pip install .
```

## Uso básico

Por ejemplo, para transformar una coordenada de WGS 84 a Web Mercator:

```python
from geotransforma import Transformador

transformar = Transformador(
    origen="EPSG:4326",
    destino="EPSG:3857"
)

x, y = transformar.punto(-3.7038, 40.4168)

print(x, y)
```

También es posible procesar varios puntos:

```python
puntos = [
    (-3.7038, 40.4168),
    (-0.3763, 39.4699),
]

resultado = transformar.puntos(puntos)
```

Es importante comprobar qué orden de ejes espera cada conjunto de datos. GeoTransforma intenta mantener un comportamiento explícito para evitar errores silenciosos, pero la interpretación correcta de las coordenadas sigue siendo responsabilidad de la aplicación que utiliza la biblioteca.

## Desarrollo

Se aceptan informes de errores, documentación y nuevas funcionalidades. Para ejecutar las pruebas:

```bash
pytest
```

Las transformaciones numéricas deben incluir casos de prueba con tolerancias adecuadas.

## Licencia

GeoTransforma se distribuye bajo licencia MIT. Consulta `LICENSE` para obtener los términos completos.
