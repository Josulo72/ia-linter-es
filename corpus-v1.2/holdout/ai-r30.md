# Cesta

Cesta es una aplicación de consola para preparar la lista de la compra de la semana. Parte de los menús previstos, resta lo que ya hay en casa y deja una lista ordenada por pasillos del supermercado.

## Idea

Hacer la lista a mano tiene dos problemas recurrentes: se olvida algo y se compra lo que ya estaba en la despensa. Cesta resuelve los dos partiendo de dos ficheros de texto que el usuario mantiene: sus recetas y su despensa.

## Recetas

Cada receta es un fichero YAML sencillo:

```yaml
nombre: Lentejas con chorizo
raciones: 4
ingredientes:
  - lentejas pardinas: 400 g
  - chorizo: 200 g
  - zanahoria: 2 ud
  - cebolla: 1 ud
  - pimenton dulce: 1 cucharadita
```

## Menú semanal

```bash
cesta menu nuevo
```

Abre el editor con una plantilla de siete días. Se indica qué receta toca cada día y para cuántos comensales; las cantidades se escalan solas.

## Generar la lista

```bash
cesta lista
```

Suma los ingredientes de todas las recetas del menú, agrupa las cantidades de un mismo producto, descuenta lo que figura en la despensa y muestra el resultado ordenado por secciones:

```
FRUTERIA
  [ ] Zanahoria .......... 6 ud
  [ ] Cebolla ............ 4 ud
LEGUMBRES Y PASTA
  [ ] Lentejas pardinas .. 800 g
CARNICERIA
  [ ] Chorizo ............ 200 g
```

El orden de las secciones se configura en `~/.config/cesta/pasillos.toml`, para que coincida con el recorrido real del supermercado habitual.

## Despensa

```bash
cesta despensa add "lentejas pardinas" 500 g
cesta despensa gastar "lentejas pardinas" 400 g
cesta despensa caducan --dias 7
```

## Exportar

`cesta lista --formato texto` da una lista lista para copiar al móvil. `--formato markdown` genera casillas marcables y `--imprimir` un PDF de una página.

## Instalación

```bash
pipx install cesta
```

## Contribuir

El proyecto es pequeño y así pretende seguir. Se agradecen recetas de ejemplo, correcciones de la tabla de equivalencias de unidades y traducciones. Las propuestas de funcionalidades nuevas se discuten antes de escribir código.

## Licencia

GPL-3.0.
