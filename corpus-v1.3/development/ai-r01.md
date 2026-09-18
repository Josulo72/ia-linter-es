# Factura2Hoja

Factura2Hoja es una herramienta de software libre que extrae datos de facturas en PDF y los convierte en una hoja de cálculo lista para revisar, ordenar y analizar. Está pensada para autónomos, pequeñas empresas, asociaciones y cualquier persona que necesite pasar muchas facturas a un formato estructurado sin copiar los datos manualmente.

## Características

* Procesa facturas en formato PDF.
* Extrae campos habituales como número de factura, fecha, proveedor, NIF/CIF, base imponible, IVA y total.
* Exporta los resultados a `.xlsx` y `.csv`.
* Permite procesar varios archivos en una sola ejecución.
* Mantiene una referencia al nombre del PDF original.
* Señala los documentos cuyos datos requieren revisión.
* Funciona localmente: los archivos no se envían a servicios externos.

## Instalación

Requiere Python 3.11 o superior.

```bash
git clone https://example.org/factura2hoja.git
cd factura2hoja
pip install -r requirements.txt
```

## Uso

Coloca las facturas en una carpeta y ejecuta:

```bash
python factura2hoja.py ./facturas --salida facturas.xlsx
```

Para generar un archivo CSV:

```bash
python factura2hoja.py ./facturas --formato csv
```

El programa intentará reconocer automáticamente la estructura de cada factura. Como los diseños varían entre proveedores, es recomendable revisar el resultado antes de utilizarlo para contabilidad, impuestos o cualquier proceso administrativo.

## Limitaciones

Factura2Hoja no garantiza una extracción perfecta. Los PDF escaneados, documentos con baja calidad, formatos poco habituales o facturas con tablas complejas pueden producir campos incompletos o incorrectos.

## Contribuir

Las contribuciones son bienvenidas. Puedes abrir una incidencia para informar de errores, proponer nuevos formatos compatibles o enviar una solicitud de cambios con mejoras.

Antes de contribuir, añade ejemplos anonimizados siempre que sea posible y evita publicar facturas que contengan datos personales o información confidencial.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
