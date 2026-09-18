# CambiaCRS

CambiaCRS es una biblioteca de Python para convertir coordenadas entre sistemas de referencia. Le pasas unas coordenadas, indicas de dónde vienen y a qué sistema quieres llevarlas, y devuelve el resultado.

Por debajo usa PROJ, así que entiende códigos EPSG y muchas de las transformaciones habituales que se usan en cartografía y SIG.

## Instalación

```bash
python -m pip install cambiacrs
```

## Uso

Una conversión sencilla:

```python
from cambiacrs import transformar

x, y = transformar(
    -3.7038,
    40.4168,
    origen="EPSG:4326",
    destino="EPSG:25830",
)

print(x, y)
```

También acepta varias coordenadas de una vez:

```python
puntos = [
    (-3.7038, 40.4168),
    (-4.4214, 36.7213),
]

resultado = transformar(
    puntos,
    origen="EPSG:4326",
    destino="EPSG:25830",
)
```

Puedes consultar un sistema antes de usarlo:

```python
from cambiacrs import sistema

crs = sistema("EPSG:4326")
print(crs.nombre)
print(crs.es_geografico)
```

## Orden de las coordenadas

La biblioteca usa siempre `x, y`. En coordenadas geográficas eso normalmente significa longitud y latitud.

Lo hago así porque el orden oficial de algunos sistemas puede resultar poco intuitivo y es fácil acabar con un punto en otro continente. Si necesitas respetar estrictamente el orden de ejes definido por el CRS, puedes activar `orden_oficial=True`.

## Precisión

Una transformación de coordenadas no siempre es una fórmula sencilla. Algunas necesitan rejillas de corrección u otros datos de PROJ. Si esos archivos no están instalados, la biblioteca avisa y no intenta fingir que la transformación es igual de precisa.

Tampoco adivina el CRS de unas coordenadas. Si tienes `430000, 4470000`, necesitas saber de qué sistema salen.

La parte básica está bastante probada con WGS 84, ETRS89 y varias zonas UTM. Hay menos pruebas con sistemas verticales y transformaciones históricas.

## Licencia

MIT.
