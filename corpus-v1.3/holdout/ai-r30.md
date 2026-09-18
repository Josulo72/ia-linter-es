# CompraSemanal

**CompraSemanal** es una aplicación de consola de software libre para preparar la lista de la compra de la semana. Permite organizar productos, cantidades y categorías desde la terminal y generar una lista sencilla que puede consultarse, imprimirse o llevarse en el móvil.

El programa está pensado para quienes prefieren mantener sus recetas y planificación en archivos de texto en lugar de depender de una aplicación o servicio en línea.

## Características

* Creación de listas semanales.
* Organización por categorías.
* Registro de cantidades y unidades.
* Productos habituales reutilizables.
* Importación de ingredientes desde recetas.
* Marcado de productos ya comprados.
* Exportación a texto o Markdown.
* Funcionamiento completamente local.

## Instalación

Requiere Python 3.10 o posterior.

```bash
git clone https://example.org/comprasemanal.git
cd comprasemanal
pip install .
```

## Uso

Para crear una lista:

```bash
compra nueva semana
```

Añade productos desde la terminal:

```bash
compra añadir "leche" --cantidad 2 --unidad litros
compra añadir "tomates" --cantidad 1 --unidad kg
compra añadir "arroz"
```

Para consultar la lista:

```bash
compra ver
```

Los productos aparecen agrupados por categorías para facilitar el recorrido por la tienda:

```text
Fruta y verdura
- [ ] 1 kg tomates

Despensa
- [ ] arroz

Lácteos
- [ ] 2 litros leche
```

Puedes marcar un producto como comprado:

```bash
compra marcar leche
```

Y exportar la lista:

```bash
compra exportar --formato markdown
```

## Configuración

Los datos se guardan localmente en un formato legible. Es posible definir categorías, unidades preferidas y productos frecuentes mediante el archivo de configuración.

## Contribuir

Las mejoras y correcciones son bienvenidas. Ejecuta las pruebas antes de enviar cambios:

```bash
pytest
```

## Licencia

CompraSemanal se publica bajo licencia MIT y puede utilizarse, estudiarse, modificarse y redistribuirse conforme a sus términos.
