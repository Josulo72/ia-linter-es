# pdf2hoja

pdf2hoja saca los datos de facturas en PDF y los mete en una hoja de cálculo. Le das una carpeta con facturas y genera un `.xlsx` con una fila por factura, para que no tengas que copiar a mano el número, la fecha, la base imponible, el IVA y el total.

Está pensado para facturas digitales que tienen texto dentro del PDF. Con escaneados y fotos puede no sacar nada, porque de momento no lleva OCR.

## Instalación

Necesitas Python 3.11 o posterior.

```bash
pip install pdf2hoja
```

También puedes descargar el proyecto y ejecutarlo desde el código.

```bash
git clone https://github.com/ejemplo/pdf2hoja.git
cd pdf2hoja
pip install -e .
```

## Uso

Para convertir todos los PDF de una carpeta:

```bash
pdf2hoja ./facturas
```

Eso crea `facturas.xlsx` en la carpeta actual. Puedes elegir otro nombre:

```bash
pdf2hoja ./facturas -o gastos-2026.xlsx
```

La hoja incluye, cuando aparecen en la factura, estos datos:

* Nombre del proveedor.
* NIF o CIF.
* Número de factura.
* Fecha.
* Base imponible.
* Tipo y cuota de IVA.
* Total.

Si no encuentra un dato, deja la celda vacía. No intenta inventarlo.

## Qué reconoce

Lo he probado con facturas de varias plantillas y funciona bien cuando el PDF tiene una estructura más o menos normal. Hay documentos raros, facturas con varias bases de IVA o tablas partidas entre páginas que todavía dan problemas.

Puedes usar `--debug` para guardar el texto que se ha extraído de cada PDF:

```bash
pdf2hoja ./facturas --debug
```

Sirve bastante para ver por qué una factura concreta no ha salido bien.

## Privacidad

Todo se procesa en tu ordenador. El programa no sube las facturas a ningún servidor ni necesita conexión a internet.

## Licencia

El proyecto se publica con licencia MIT.
