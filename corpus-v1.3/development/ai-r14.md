# RetroConfig

RetroConfig es una biblioteca de software libre para leer, modificar y escribir ficheros de configuración en formato RCF, un formato de texto antiguo utilizado por aplicaciones heredadas. El objetivo del proyecto es facilitar el mantenimiento y la migración de programas que todavía dependen de estos archivos sin obligar a reimplementar su sintaxis.

Un fichero RCF típico puede tener este aspecto:

```text
[GENERAL]
nombre=Programa
activo=YES

[PANTALLA]
ancho=80
alto=25
```

RetroConfig conserva, siempre que sea posible, el orden original de las secciones, los comentarios y el estilo de escritura del documento.

## Instalación

```bash
pip install retroconfig
```

Para trabajar con la versión del repositorio:

```bash
git clone https://example.org/retroconfig.git
cd retroconfig
pip install -e .
```

## Lectura

```python
from retroconfig import Config

cfg = Config.cargar("programa.rcf")

print(cfg["GENERAL"]["nombre"])
print(cfg["PANTALLA"]["ancho"])
```

Los valores se leen como texto de forma predeterminada, aunque existen métodos auxiliares para convertir enteros y valores booleanos.

```python
ancho = cfg.entero("PANTALLA", "ancho")
activo = cfg.booleano("GENERAL", "activo")
```

## Escritura

```python
cfg["PANTALLA"]["ancho"] = "120"
cfg.guardar("programa.rcf")
```

También es posible crear un fichero desde cero:

```python
cfg = Config()
cfg.crear_seccion("GENERAL")
cfg["GENERAL"]["nombre"] = "Mi programa"
cfg.guardar("nuevo.rcf")
```

## Compatibilidad

El analizador tolera algunas variantes habituales presentes en implementaciones antiguas, como claves sin espacios, comentarios iniciados por `;` y finales de línea de distintos sistemas operativos. El modo estricto puede activarse cuando se necesite detectar cualquier desviación del formato esperado.

## Contribuir

Los casos reales de ficheros antiguos son especialmente útiles para mejorar la compatibilidad. Puedes enviar ejemplos anonimizados, pruebas o informes de errores mediante el repositorio del proyecto.

## Licencia

RetroConfig está publicado bajo la licencia BSD de 3 cláusulas.
