# Doblon

Doblon localiza documentos duplicados dentro de una carpeta y sus subcarpetas. Está pensado para archivos de trabajo que han crecido durante años: descargas repetidas, versiones guardadas dos veces, copias que alguien hizo «por si acaso».

## Cómo detecta los duplicados

El análisis se hace en tres pasadas, de la más barata a la más costosa:

1. **Tamaño.** Dos ficheros de distinto tamaño nunca son idénticos. Los tamaños únicos se descartan de inmediato.
2. **Huella parcial.** De los candidatos restantes se calcula el resumen criptográfico de los primeros y los últimos kilobytes.
3. **Huella completa.** Solo los que siguen coincidiendo se leen enteros y se comparan por su resumen BLAKE3.

En carpetas grandes esta estrategia evita leer la mayor parte de los datos.

## Duplicados que no son idénticos

Además del modo exacto, Doblon puede detectar documentos equivalentes aunque los bytes difieran:

- PDF con los mismos contenidos pero distintos metadatos o fecha de creación.
- Documentos de ofimática guardados por versiones distintas del mismo programa.
- Imágenes recomprimidas, mediante huella perceptual.

Estos modos se activan explícitamente con `--similares` porque son más lentos y, por su naturaleza, pueden dar falsos positivos.

## Instalación

```bash
pip install doblon
```

## Uso

```bash
doblon analizar ~/Documentos
```

La salida agrupa los ficheros por conjunto de duplicados, indicando cuál es el más antiguo y cuánto espacio se recuperaría eliminando los demás.

Para actuar sobre los resultados:

```bash
doblon limpiar ~/Documentos --conservar mas-antiguo --papelera
```

## Seguridad ante todo

Doblon nunca borra nada sin confirmación explícita. Por defecto mueve a la papelera del sistema en lugar de eliminar, y ofrece `--enlazar` para sustituir los duplicados por enlaces duros y liberar espacio sin perder ninguna ruta de acceso.

## Informe

`doblon analizar --json informe.json` genera un informe legible por otras herramientas, útil si se quiere revisar el resultado antes de decidir.

## Licencia

GPL-3.0. El proyecto acepta aportaciones; en el fichero `CONTRIBUTING.md` se explica cómo preparar el entorno y ejecutar las pruebas.
