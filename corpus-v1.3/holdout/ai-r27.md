# HojaRecibo

**HojaRecibo** es un proyecto de software libre para generar recibos en PDF a partir de los datos almacenados en una hoja de cálculo. Su objetivo es facilitar la creación de recibos periódicos sin necesidad de diseñarlos o rellenarlos manualmente uno por uno.

Cada fila de la hoja representa un recibo. La aplicación lee campos como número, fecha, cliente, concepto, importe e impuestos y genera un documento PDF independiente utilizando una plantilla configurable.

## Características

* Lectura de archivos `.xlsx`.
* Generación automática de un PDF por fila.
* Plantillas personalizables.
* Formato configurable para fechas y cantidades.
* Validación básica de los datos de entrada.
* Creación automática del directorio de salida.
* Compatible con logotipos e información fiscal personalizada.

## Instalación

Se necesita Python 3.11 o posterior.

```bash
git clone https://example.org/hojarecibo.git
cd hojarecibo
pip install .
```

## Uso

Una hoja básica puede contener las columnas:

```text
numero | fecha | cliente | concepto | importe
```

Para generar los recibos:

```bash
hojarecibo recibos.xlsx --salida ./pdf
```

También puedes indicar un archivo de configuración:

```bash
hojarecibo recibos.xlsx --config empresa.toml
```

En él pueden definirse el nombre de la empresa, dirección, identificador fiscal, moneda, logotipo y otros elementos utilizados en la plantilla.

Los archivos resultantes se guardan con nombres basados en el número de recibo, por ejemplo:

```text
REC-2026-001.pdf
REC-2026-002.pdf
```

## Desarrollo

El código fuente está abierto a contribuciones. Antes de enviar cambios, ejecuta:

```bash
pytest
```

Las propuestas de nuevos formatos de hoja, plantillas o sistemas de exportación son especialmente bienvenidas.

## Licencia

HojaRecibo se publica bajo licencia MIT. Consulta el archivo `LICENSE` para conocer las condiciones completas de uso, modificación y distribución.
