# CompraSemana

CompraSemana es una aplicación de consola para preparar la lista de la compra de la semana. Apuntas qué vas a comer cada día y el programa junta los ingredientes, suma cantidades y te deja una lista que puedes llevar al supermercado.

Las recetas se guardan en ficheros de texto. No hace falta una base de datos ni crear una cuenta.

## Instalación

Necesitas Python 3.11 o posterior.

```bash
git clone https://github.com/usuario/comprasemana.git
cd comprasemana
python -m pip install .
```

## Recetas

Una receta puede ser así:

```yaml
nombre: Lentejas
raciones: 4

ingredientes:
  - producto: lentejas
    cantidad: 300
    unidad: g
  - producto: zanahorias
    cantidad: 2
    unidad: ud
  - producto: cebolla
    cantidad: 1
    unidad: ud
```

Guárdala en la carpeta `recetas/`.

Puedes añadir todas las que quieras. Si dos recetas usan cebolla, CompraSemana suma las cantidades siempre que tengan la misma unidad.

## Preparar la semana

Crea el menú:

```bash
comprasemana menu
```

El programa va preguntando qué receta quieres para cada comida. También puedes editar directamente `semana.yml` si te resulta más cómodo.

Después genera la lista:

```bash
comprasemana lista
```

La salida queda más o menos así:

```text
Verdura
[ ] 5 cebollas
[ ] 6 zanahorias

Despensa
[ ] 500 g de arroz
[ ] 300 g de lentejas
```

Las categorías son opcionales. Si no has puesto ninguna, los ingredientes salen en una lista normal.

También puedes marcar cosas que ya tienes en casa:

```bash
comprasemana tengo arroz aceite sal
```

Así no aparecen en la siguiente lista.

No intenta decidir qué deberías comer ni calcula calorías. Tampoco sabe que "1 cebolla" y "200 g de cebolla" se pueden sumar, porque convertir eso bien depende del ingrediente. En esos casos deja las dos cantidades separadas.

Ahora mismo funciona mejor con menús sencillos y recetas caseras. Quiero mejorar la edición desde la propia terminal, que todavía es bastante básica.

## Licencia

MIT.
