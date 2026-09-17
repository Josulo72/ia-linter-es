# csvguard

**csvguard** es una biblioteca de Python para validar archivos CSV de forma declarativa, pensada para quienes necesitan garantizar la calidad de datos tabulares antes de cargarlos en una base de datos, un pipeline de análisis o cualquier sistema que dependa de que el formato de entrada sea correcto.

Trabajar con archivos CSV en producción tiene un problema recurrente: el formato es, en teoría, simple, pero en la práctica está lleno de casos límite. Columnas que cambian de tipo entre filas, valores nulos representados de formas distintas, codificaciones inconsistentes, separadores decimales que varían según el origen del archivo... csvguard nace para atajar estos problemas antes de que lleguen a romper algo más adelante en el proceso.

## ¿Qué resuelve esta biblioteca?

En lugar de escribir validaciones ad hoc cada vez que se recibe un nuevo archivo, csvguard permite definir un **esquema** que describe cómo debe ser el CSV: qué columnas son obligatorias, qué tipo de dato se espera en cada una, qué rangos de valores son válidos y qué hacer cuando algo no cumple esas condiciones.

```python
from csvguard import Schema, Column

schema = Schema([
    Column("id", type="int", required=True, unique=True),
    Column("email", type="str", pattern=r".+@.+\..+"),
    Column("edad", type="int", min_value=0, max_value=120, nullable=True),
])

resultado = schema.validate("clientes.csv")

if not resultado.is_valid:
    for error in resultado.errors:
        print(error)
```

El resultado de la validación no es un simple booleano: incluye la lista completa de errores encontrados, con el número de fila, la columna afectada y una descripción del problema, de modo que se pueda decidir si el archivo se rechaza, se corrige automáticamente o se procesa solo en parte.

## Características principales

- **Validación por tipos**: enteros, decimales, cadenas, fechas y booleanos, con conversión automática cuando es posible.
- **Reglas personalizadas**: además de las validaciones integradas, se pueden definir funciones propias para reglas de negocio específicas.
- **Detección de codificación**: csvguard intenta identificar automáticamente la codificación del archivo y avisa si encuentra caracteres problemáticos.
- **Informes exportables**: los resultados de la validación se pueden exportar a JSON o CSV para integrarlos en otros sistemas de monitorización.
- **Rendimiento**: el motor de validación procesa los archivos por streaming, por lo que no es necesario cargar el archivo completo en memoria, algo especialmente útil con ficheros de varios gigabytes.

## Instalación

```bash
pip install csvguard
```

Requiere Python 3.9 o superior. No tiene dependencias obligatorias fuera de la biblioteca estándar, aunque se recomienda instalar `pandas` si se quiere usar la integración opcional para trabajar directamente con DataFrames.

## Próximos pasos

Esta documentación continúa con una guía detallada sobre cómo definir esquemas complejos, cómo integrar csvguard en pipelines de ETL existentes y cómo escribir validadores personalizados para casos de uso específicos. Si es la primera vez que usas la biblioteca, la sección de "Primeros pasos" es el mejor punto de partida.
