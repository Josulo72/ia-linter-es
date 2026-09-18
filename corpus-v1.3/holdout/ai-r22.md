# PrecioDiff

PrecioDiff es una herramienta de software libre para comparar dos listas de precios y detectar rápidamente qué ha cambiado entre ellas. Está pensada para catálogos de proveedores, inventarios, tarifas comerciales y cualquier otro conjunto de productos identificado mediante códigos o referencias.

La aplicación indica qué artículos han subido o bajado de precio, cuáles son nuevos y cuáles han desaparecido de la segunda lista.

## Características

* Compara archivos CSV y TSV.
* Identifica productos mediante una columna configurable.
* Detecta altas y bajas de artículos.
* Calcula diferencias absolutas y porcentuales.
* Permite ignorar cambios inferiores a un umbral.
* Genera resultados en pantalla, CSV o JSON.
* No modifica los archivos originales.

## Instalación

PrecioDiff requiere Python 3.10 o superior.

```bash
git clone https://example.org/preciodiff.git
cd preciodiff
pip install -e .
```

## Uso básico

Supongamos que tenemos los archivos `precios_enero.csv` y `precios_febrero.csv`:

```bash
preciodiff precios_enero.csv precios_febrero.csv
```

Por defecto, se utilizan las columnas `codigo` y `precio`. Puedes indicar nombres diferentes:

```bash
preciodiff antigua.csv nueva.csv \
  --id-column referencia \
  --price-column importe
```

Para guardar el informe:

```bash
preciodiff antigua.csv nueva.csv --output diferencias.csv
```

También puedes ocultar variaciones pequeñas:

```bash
preciodiff antigua.csv nueva.csv --min-change 0.50
```

## Formato esperado

Un archivo mínimo puede tener este aspecto:

```csv
codigo,nombre,precio
A001,Cuaderno,3.50
A002,Bolígrafo,1.20
```

Los identificadores deben ser únicos dentro de cada lista.

## Contribuir

Puedes colaborar informando de errores, proponiendo nuevos formatos de entrada o enviando solicitudes de cambios. Ejecuta las pruebas antes de contribuir:

```bash
pytest
```

## Licencia

PrecioDiff es software libre publicado bajo la licencia MIT.
