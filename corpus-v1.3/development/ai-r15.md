# TiendaCLI

TiendaCLI es una aplicación de consola de software libre para gestionar el inventario de una tienda pequeña. Permite registrar productos, consultar existencias y anotar entradas o salidas sin necesidad de utilizar hojas de cálculo ni instalar un sistema de gestión complejo.

Los datos se almacenan localmente en una base de datos SQLite, por lo que no es necesario configurar ningún servidor.

## Funciones principales

* Alta, modificación y eliminación de productos.
* Búsqueda por nombre, referencia o código de barras.
* Registro de unidades disponibles.
* Movimientos de entrada y salida.
* Avisos de existencias bajas.
* Historial de movimientos.
* Exportación del inventario a CSV.
* Copias de seguridad de la base de datos.

## Instalación

```bash
git clone https://example.org/tiendacli.git
cd tiendacli
pip install .
```

Después puedes inicializar un inventario nuevo:

```bash
tienda init
```

## Uso

Añadir un producto:

```bash
tienda producto añadir \
  --ref CAF001 \
  --nombre "Café molido 250 g" \
  --precio 3.50 \
  --stock 12
```

Consultar el inventario:

```bash
tienda listar
```

Registrar una venta de dos unidades:

```bash
tienda salida CAF001 2 --motivo "Venta"
```

Registrar una reposición:

```bash
tienda entrada CAF001 24 --motivo "Pedido proveedor"
```

Para ver productos por debajo del nivel mínimo configurado:

```bash
tienda alertas
```

El inventario puede exportarse con:

```bash
tienda exportar inventario.csv
```

## Copias de seguridad

La base de datos predeterminada se guarda en el directorio de datos del usuario. Puedes crear una copia manual mediante:

```bash
tienda backup copia.sqlite
```

Aunque TiendaCLI incluye comprobaciones para evitar cantidades imposibles y referencias duplicadas, se recomienda realizar copias de seguridad periódicas.

## Contribuciones

Las propuestas de mejora, correcciones y nuevas funciones son bienvenidas. Antes de enviar cambios, ejecuta las pruebas con `pytest`.

## Licencia

TiendaCLI se distribuye bajo la licencia GPL-3.0.
