# Trastienda

Trastienda es una aplicación de consola para llevar el inventario de una tienda pequeña. No necesita servidor, ni navegador, ni conexión a internet: guarda todo en un fichero SQLite y funciona en cualquier ordenador con una terminal.

## Para quién es

Para negocios con unos cientos o unos pocos miles de referencias que hoy llevan el control en una hoja de cálculo y empiezan a notar que la hoja se les queda corta: entradas duplicadas, stock que no cuadra, nadie recuerda a qué proveedor se compró qué.

## Instalación

```bash
cargo install trastienda
```

Hay binarios compilados para Linux, macOS y Windows en la sección de publicaciones del repositorio.

## Primeros pasos

```bash
trastienda init mitienda.db
trastienda articulo nuevo --ref CAM-001 --nombre "Camiseta azul talla M" --precio 12.90 --stock 20
```

Consultar existencias:

```bash
trastienda stock CAM-001
trastienda stock --bajo-minimo
```

Registrar movimientos:

```bash
trastienda venta CAM-001 --unidades 3
trastienda compra CAM-001 --unidades 50 --proveedor "Textiles Ruiz" --coste 6.20
```

## Modo interactivo

Ejecutando `trastienda` sin argumentos se abre una interfaz de texto con navegación por teclado, búsqueda incremental y edición en línea. Es el modo cómodo para el trabajo diario en mostrador.

## Informes

```bash
trastienda informe ventas --desde 2024-01-01 --hasta 2024-03-31
trastienda informe valoracion
trastienda informe rotacion --top 20
```

Todos los informes se pueden exportar a CSV con `--csv` para abrirlos después en una hoja de cálculo o pasarlos a la gestoría.

## Copias de seguridad

La base de datos es un único fichero. Copiarlo es suficiente. Aun así, `trastienda backup --destino /ruta` hace una copia consistente aunque la aplicación esté en uso, y `trastienda restaurar` revierte a una copia anterior.

## Lo que no hace

No emite facturas, no gestiona nóminas y no se conecta con la Agencia Tributaria. Hace inventario y lo hace bien; para lo demás hay otras herramientas.

## Licencia

AGPL-3.0.
