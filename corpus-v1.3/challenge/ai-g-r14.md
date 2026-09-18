# Oldconf

Oldconf lee y escribe ficheros de configuración en formato CFG-82, un formato antiguo que todavía aparece en algunas máquinas y programas de los años ochenta y noventa.

Los ficheros son texto plano. Tienen secciones, claves de ocho caracteres como máximo, comentarios que empiezan por `*` y unos cuantos detalles raros con espacios que conviene respetar si luego el fichero lo va a abrir el programa original.

La biblioteca intenta conservar esos detalles al volver a escribirlo.

## Instalación

```bash
pip install oldconf
```

## Leer un fichero

```python
from oldconf import load

config = load("SYSTEM.CFG")

print(config["VIDEO"]["MODE"])
print(config["SERIAL"]["PORT"])
```

También puedes recorrerlo sin convertirlo a un diccionario:

```python
for section in config.sections:
    for entry in section.entries:
        print(entry.key, entry.value)
```

Esto viene bien cuando importa el orden de las claves, cosa bastante habitual en programas antiguos aunque la documentación diga lo contrario.

## Escribir cambios

```python
config["VIDEO"]["MODE"] = "VGA"
config.save("SYSTEM.CFG")
```

`save()` mantiene los comentarios, el orden y, en la mayoría de los casos, los espacios del fichero original.

También se puede crear uno desde cero:

```python
from oldconf import Config

config = Config()
config.add_section("VIDEO")
config["VIDEO"]["MODE"] = "VGA"
config.save("SYSTEM.CFG")
```

He probado la biblioteca con ficheros de varias versiones reales del formato. Hay una extensión usada por algunos fabricantes que permite incluir otros CFG con `@INCLUDE`. De momento se lee como una línea desconocida y se conserva, pero no se procesa.

La codificación por defecto es CP437. Se puede cambiar al abrir el fichero si el programa que lo generó usaba otra.

Oldconf está publicado bajo licencia BSD de 2 cláusulas.
