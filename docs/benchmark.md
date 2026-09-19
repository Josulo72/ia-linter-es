# Benchmark

Hay dos corpus y dos informes, porque el producto cambió de objetivo a mitad del trabajo.

| Versión | Qué mide | Resultado | Informe |
|---|---|---|---|
| v1.1 (actual) | Escritura cotidiana: mensajes de foro frente a mensajes generados | Separa. Holdout: medianas 0 y 14,5; exactitud equilibrada 0,75 | [`benchmark/reports/v1.1.md`](../benchmark/reports/v1.1.md) |
| v1.0 (archivada) | Prosa formal: BOE, prensa científica y artículos académicos frente a textos generados | No separa. Holdout: medianas 7,5 y 10; exactitud equilibrada 0,535 | [`benchmark/reports/v1.0.md`](../benchmark/reports/v1.0.md) |

El índice mide densidad de patrones editoriales. No es una probabilidad de autoría y no debe usarse como detector.

## Qué cambió

Las reglas de v1.0 buscaban los tics de 2023: «es importante destacar», metáforas comodín, arengas finales. Los modelos de 2026 ya no los escriben, así que el índice no distinguía nada. Un README generado marcaba 2 sobre 100 y olía a IA a la legua.

Lo que sí distingue en registro cotidiano es el ritmo. Una persona alterna una frase de treinta palabras con otra de cuatro; la máquina las escribe todas parecidas. Eso lo mide `estructura/ritmo-plano`, y de ahí sale toda la separación de v1.1: quitando esa regla y su contraria, la mediana de la clase IA baja a cero.

La pieza principal del producto no es el linter sino la guía de estilo (`integrations/claude-code/guia/humano.md`), que se le da al modelo antes de escribir. El linter es el revisor que comprueba el resultado.

## Corpus v1.1

Clase humana: 36 mensajes de Mediavida, elhacker.net e Infojardín, de 2009 a 2021, entre 150 y 400 palabras. **No se redistribuyen.** En el repositorio queda `corpus/manifests/_human_cotidiano.yml` con URL, fecha, foro, palabras y sha256; los textos se descargan en local y están en `.gitignore`. Para rehacerlos: `node --use-system-ca benchmark/scripts/fetch-foros.mjs --from-manifest`. Son anteriores al 30-11-2022 para que no se cuele texto generado.

Clase IA: 96 textos generados el 17-09-2026 con subagentes de Claude Code (haiku-4.5, sonnet-5 y opus-5) a partir de los encargos de `corpus/policy/prompts-v1.1.yml`. Cada encargo se generó tres veces: tal cual (development y holdout), con la guía v1 () y con la guía v2 (). Así se puede medir si la guía sirve.

Particiones: development 18 + 24, holdout 18 + 24, challenge 0 + 48.

## Corpus v1.0 (archivado)

En `corpus/archive/v1.0`, con sus manifiestos y su lock. 45 textos humanos de BOE, SINC, REDC y Project Gutenberg, todos de licencia abierta y verificados registro a registro, y 42 textos generados. Las políticas siguen en `corpus/policy/{sources,licenses,prompts}.yml` y `corpus-check` lo sigue comprobando.

| Fuente | Registro | Licencia | Verificación por registro | n |
|---|---|---|---|---|
| BOE, preámbulos de leyes | institucional | dominio público (art. 13 TRLPI) | rango normativo y fecha de publicación | 12 |
| SINC (FECYT) | periodístico | CC-BY-4.0 | «Fuente: SINC», «Derechos: Creative Commons», `datePublished` | 14 |
| REDC (CSIC), vol. 42 (2019) | académico | CC-BY-4.0 | enlace de licencia, fecha e idioma en la página del artículo | 11 |
| Project Gutenberg | literario (challenge) | dominio público | idioma, sin traductor y autor fallecido antes de 1946 | 8 |

## Scripts

| Script | Función | Red |
|---|---|---|
| `benchmark/scripts/fetch-foros.mjs` | Descarga la clase humana cotidiana (solo local). Con `--from-manifest` rehace exactamente los textos del manifiesto y comprueba su hash | sí |
| `benchmark/scripts/fetch-human.mjs` | Descarga la clase humana formal de v1.0 | sí |
| `benchmark/scripts/build-manifests.mjs` | Genera manifiestos, deduplica y congela el holdout | no |
| `benchmark/scripts/dump-findings.mjs` | Lista hallazgos con la clave de adjudicación, con el mismo contexto que `benchmark run`. Con `--ciego` escribe el paquete para adjudicar | no |
| `benchmark/scripts/aplicar-adjudicacion.mjs` | Traduce las respuestas de un adjudicador ciego con el mapa y escribe el archivo de adjudicación | no |
| `scripts/corpus-check.mjs` | Licencias, trazabilidad, hashes, congelación y veto de ambos corpus; forma parte de `pnpm gates` | no |
| `ia-linter-es benchmark run --profile <perfil>` | Métricas por regla y agregadas (§12) | no |

En equipos donde Node no confía en la cadena de certificados de `revistas.csic.es`, los scripts de descarga se ejecutan con `node --use-system-ca`.

## Método

1. Reglas y umbrales se trabajan solo en development.
2. `benchmark/configs/holdout-v1.1.lock` guarda el sha256 del manifiesto; `build-manifests` y `corpus-check` fallan si cambia.
3. Se congela la configuración (`threshold.yml` y Rule Pack) y se ejecuta holdout una vez.
4. Se publica todo, también lo negativo. Un holdout ya ejecutado no sirve como evaluación independiente de una versión corregida.

Auditoría del propio banco: `benchmark/reports/auditoria-banco-v1.1.md`, reproducible con `benchmark/scripts/auditoria-banco.mjs`.

Métricas: por regla, hallazgos por clase, documentos afectados, FP por mil palabras humanas, precisión adjudicada, desglose por registro y tiempo; agregadas, matriz de confusión, TPR, FPR, precisión, exactitud equilibrada, medianas e intervalos de Wilson al 95 %. No se publica recall por regla.

## Adjudicación

La precisión de una regla sale de revisar sus hallazgos uno a uno y marcar cada uno como `correct` (el patrón está y es el caso que la regla quiere señalar, lo haya escrito quien lo haya escrito) o `incorrect` (coincide en la forma pero no es ese caso).

En v1.2 se adjudica development por registro, y a ciegas. La adjudicación de v1.2 la hizo GPT-5.6 Sol, una vez, como validación externa del benchmark (ver D2 en `docs/decisions.md`). Es trabajo de medición y no del producto: el linter no usa ningún modelo para analizar ni lo necesita para funcionar. Se hace así:

```
node benchmark/scripts/dump-findings.mjs development --corpus corpus-v1.2 --register correo --profile correo --ciego benchmark/annotations/v1.2/paquetes
```

Eso escribe dos archivos. `paquete-correo.md` es lo que se le da a quien adjudica: el criterio, y por cada hallazgo la regla, qué busca, el fragmento y el párrafo donde está. No lleva el id de la muestra, ni si el texto es humano o generado, ni el estado de la regla, y los hallazgos van mezclados con ids opacos (`c-001`…). `mapa-correo.json` traduce cada id opaco a la clave del benchmark y no se le da a quien adjudica. La carpeta `paquetes/` no se sube al repositorio porque lleva párrafos de la clase humana.

Las respuestas se guardan tal como llegan en `benchmark/annotations/v1.2/respuestas/<registro>.yml` (solo ids opacos y valores) y se traducen con el mapa:

```
node benchmark/scripts/aplicar-adjudicacion.mjs --register correo --respuestas benchmark/annotations/v1.2/respuestas/correo.yml --mapa benchmark/annotations/v1.2/paquetes/mapa-correo.json --adjudicador "<proveedor y modelo>" --salida benchmark/annotations/v1.2/correo.yml
```

El script falla sin escribir nada si falta una respuesta, si sobra, si un id está repetido o si un valor no es `correct`, `incorrect` o `dudoso`. Los `dudoso` no se adjudican: quedan en la lista `dudosos` del archivo hasta que alguien los revise. Lo que decida esa persona va en un archivo aparte que se pasa con `--revision`; solo puede resolver ids que el adjudicador dejó en `dudoso`. El archivo lleva claves y no fragmentos, porque la clase humana no se redistribuye. Se evalúan con:

```
node packages/linter/dist/cli/main.js benchmark run --corpus corpus-v1.2 --partition development --register correo --profile correo --annotations benchmark/annotations/v1.2/correo.yml
```

Hay que pasar `--annotations`. Sin la opción, el benchmark lee `benchmark/annotations/<partición>.yml`, un nombre sin versión que comparten todos los corpus con partición `development`.

En v1.3 se hizo una ronda suplementaria, también ciega, sobre los seis hallazgos de `retorica/triada`. Las respuestas originales están en `benchmark/annotations/v1.3/respuestas/` y su traducción en `benchmark/annotations/v1.3/{readme,redes}.yml`. La ronda produjo dos `correct` y cuatro `incorrect`; los cuatro falsos positivos guiaron la revisión 2 del detector. Al recalcular, solo sobreviven los dos casos correctos. Uno ya existía en v1.2, por lo que la revisión nueva tiene dos casos únicos vigentes y continúa por debajo de la muestra mínima de cinco. No se ejecutó el holdout v1.3.
Las tres reglas de longitud de frase (`estructura/longitud-uniforme`, `estructura/ritmo-plano` y `estructura/ritmo-metronomo`) no entran en el paquete y su precisión adjudicada es `null`. Miden la variación de longitud de las frases del texto entero, así que en un fragmento no hay nada que leer para decir si aciertan, y darlas por correctas porque el número cumple el umbral sería inflar la cifra. Se evalúan por FP/1000 en la clase humana y por su efecto en las pruebas globales: separación de medianas y exactitud equilibrada por registro. `longitud-uniforme` es `stable` y por eso no puede cumplir `min_adjudicated_precision`. Está registrado en `docs/decisions.md`.

## Límites

- 84 textos en v1.1. Los intervalos son anchos y se solapan entre particiones.
- Toda la separación depende de una regla, y es `candidate`. Sin las dos reglas de ritmo, o contando solo las 28 `stable`, la separación en holdout es 0.
- 20 de las 28 reglas `stable` no disparan en el corpus v1.1, y seis no tienen evidencia de corpus en ninguna versión. El gate de falsos positivos las aprueba por vacío.
- El banco tiene un solo tipo de texto, el mensaje de foro. Los perfiles `correo`, `readme` y `redes` están sin medir.
- Para v1.1 no hay adjudicaciones: la precisión por regla es `null` en las 38. Está medido cuántas veces salta cada regla, no cuántas acierta.
- Un solo revisor, que además escribió las reglas.
- La clase IA es de un solo proveedor y de la misma familia de modelos que diseñó las reglas.
- Los mensajes humanos conservan sus erratas y los generados no tienen ninguna. Parte de la diferencia puede venir de ahí.
- La guía no arregla el ritmo: medida con las dos versiones, la variación de longitud de frase se queda en 0,45 frente a 0,61 de los mensajes humanos. Sí elimina del todo rayas, comillas angulares, negritas y fórmulas hechas.
- v1.1 no tiene clase humana en challenge, y v1.0 no tenía clase humana en los registros general, técnico y marketing.
