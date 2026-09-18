# Benchmark

Hay tres corpus y tres informes. El producto cambió de objetivo a mitad del trabajo y luego hubo que medir los registros que faltaban.

| Versión | Qué mide | Resultado | Informe |
|---|---|---|---|
| v1.2 (actual) | Correo, README y redes frente a textos generados de los mismos registros | Separa en redes (+18) y va al revés en correo (−9) y en README (−2) | [`benchmark/reports/v1.2.md`](../benchmark/reports/v1.2.md) |
| v1.1 | Escritura cotidiana: mensajes de foro frente a mensajes generados | Separa. Holdout: medianas 0 y 14,5; exactitud equilibrada 0,75 | [`benchmark/reports/v1.1.md`](../benchmark/reports/v1.1.md) |
| v1.0 (archivada) | Prosa formal: BOE, prensa científica y artículos académicos frente a textos generados | No separa. Holdout: medianas 7,5 y 10; exactitud equilibrada 0,535 | [`benchmark/reports/v1.0.md`](../benchmark/reports/v1.0.md) |

El índice mide densidad de patrones editoriales. No es una probabilidad de autoría y no debe usarse como detector.

## Qué cambió

Las reglas de v1.0 buscaban los tics de 2023: «es importante destacar», metáforas comodín, arengas finales. Los modelos de 2026 ya no los escriben, así que el índice no distinguía nada. Un README generado marcaba 2 sobre 100 y olía a IA a la legua.

Lo que sí distingue en registro cotidiano es el ritmo. Una persona alterna una frase de treinta palabras con otra de cuatro; la máquina las escribe todas parecidas. Eso lo mide `estructura/ritmo-plano`, y de ahí sale toda la separación de v1.1: quitando esa regla y su contraria, la mediana de la clase IA baja a cero.

La pieza principal del producto no es el linter sino la guía de estilo (`integrations/claude-code/guia/humano.md`), que se le da al modelo antes de escribir. El linter es el revisor que comprueba el resultado.

## Corpus v1.2

En `corpus-v1.2/`. Mide los tres registros que v1.1 dejaba sin tocar, uno por perfil.

| Registro | Humanos | De dónde | Fechas | IA base | IA con la guía |
|---|---|---|---|---|---|
| correo | 30 | lista pública debian-user-spanish | 2020-07 a 2021-12 | 30 | 30 |
| readme | 30 | READMEs de GitHub con licencia permisiva | 2011-12 a 2021-10 | 30 | 30 |
| redes | 30 | fediverso (12) y Reddit (18) | 2020-08 a 2021-12 | 30 | 30 |

Todo lo humano es anterior al 31/12/2021, que es el corte para que no se cuele texto generado, y la
fecha sale del dato de origen. Nada de eso se redistribuye: en el repositorio van los manifiestos de
`corpus-v1.2/manifests/` con URL, autor, fecha, licencia y hash, y los textos se bajan en local con
`benchmark/scripts/fetch-registros.mjs`. Las particiones son development y holdout, mitad y mitad,
más 90 textos de challenge escritos con la guía delante. Holdout congelado en
`benchmark/configs/holdout-v1.2.lock`.

El resultado en holdout, leído una sola vez con las reglas ya cerradas, es el de la tabla de arriba:
el umbral está en 12 y solo redes cumple el mínimo de separación que pide la política. En correo y en
README el signo está invertido. Está explicado en `benchmark/reports/v1.2.md` y auditado en
`auditoria-banco-v1.2.md`.

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
| `benchmark/scripts/fetch-registros.mjs` | Descarga la clase humana de correo, README y redes (solo local). Con `--from-manifest` rehace los textos ya registrados y comprueba su hash | sí |
| `benchmark/scripts/build-manifests-v1.2.mjs` | Genera los manifiestos de v1.2 y congela su holdout | no |
| `benchmark/scripts/auditoria-banco-v1.2.mjs` | Auditoría del banco v1.2: qué dispara, qué queda sin las reglas de ritmo y qué queda solo con las `stable` | no |
| `benchmark/scripts/auditar-corpus-humano.mjs` | Revisa la clase humana ya descargada con los filtros vigentes y dice qué textos no deberían estar. Solo lee | no |
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
2. Cada versión guarda el sha256 de su manifiesto en su lock (`holdout-v1.1.lock`, `holdout-v1.2.lock`); `build-manifests` y `corpus-check` fallan si cambia.
3. Se congela la configuración (`threshold.yml` y Rule Pack) y se ejecuta holdout una vez.
4. Se publica todo, también lo negativo. Un holdout ya ejecutado no sirve como evaluación independiente de una versión corregida.

Auditoría del propio banco: `benchmark/reports/auditoria-banco-v1.1.md` y `auditoria-banco-v1.2.md`, reproducibles con `benchmark/scripts/auditoria-banco.mjs` y `auditoria-banco-v1.2.mjs`.

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

Las tres reglas de longitud de frase (`estructura/longitud-uniforme`, `estructura/ritmo-plano` y `estructura/ritmo-metronomo`) no entran en el paquete y su precisión adjudicada es `null`. Miden la variación de longitud de las frases del texto entero, así que en un fragmento no hay nada que leer para decir si aciertan, y darlas por correctas porque el número cumple el umbral sería inflar la cifra. Se evalúan por FP/1000 en la clase humana y por su efecto en las pruebas globales: separación de medianas y exactitud equilibrada por registro. `longitud-uniforme` es `stable` y por eso no puede cumplir `min_adjudicated_precision`. Está registrado en `docs/decisions.md`.

## Límites

- **La clase humana de v1.2 está contaminada.** El filtro de español de España aceptaba con una sola marca peninsular; en `readme` esa marca coincidía con la palabra buscada por la consulta de GitHub (`ordenador`, `fichero`, `instalación`), así que no descartaba nada. El filtro estricto solo se aplicaba a Reddit, no a README, correo ni fediverso, y no había ningún filtro de prosa, así que podía entrar letra de canción o verso. Corregido en `registros-comun.mjs` y `fetch-registros.mjs`; `benchmark/scripts/auditar-corpus-humano.mjs` lista los textos que ya no pasan. Mientras el corpus no se rehaga con `--append` y no se vuelva a medir, las cifras de v1.2 no son utilizables.
- 84 textos en v1.1 y 270 en v1.2. Los intervalos siguen siendo anchos y se solapan entre particiones.
- Toda la separación depende de una regla, y es `candidate`. Sin las dos reglas de ritmo, o contando solo las `stable`, la separación en holdout es 0 en v1.1, y en v1.2 es 0 en correo, 0 en redes y −6 en README.
- En correo y en README el índice puntúa más alto a los humanos que a los generados. La exactitud equilibrada ahí es 0,367 y 0,412, por debajo del azar. Con esos dos perfiles el índice no discrimina.
- Nueve de las 23 reglas `stable` no disparan en el corpus v1.2. El gate de falsos positivos las aprueba por vacío.
- `repeticion/inicio-parrafo` es `stable` y en el holdout de README marca 4 textos humanos y ninguno generado: 2,019 falsos positivos por mil palabras, por encima del máximo de 1,5 de `quality-policy.yml`. El gate no lo ve porque mide sobre el holdout v1.1, donde esa regla no dispara. Sin decidir.
- v1.0 y v1.1 no tienen adjudicaciones, y en v1.2 solo está adjudicado development, con un adjudicador y sobre el corpus contaminado del primer punto. En holdout la precisión por regla sigue siendo `null` en las 38.
- La clase humana de redes mezcla 12 publicaciones del fediverso con 18 de Reddit, más largas, mientras que la clase IA son 30 hilos cortos. Parte de la separación de redes puede venir del formato y no de la voz.
- Un solo revisor, que además escribió las reglas.
- La clase IA es de un solo proveedor y de la misma familia de modelos que diseñó las reglas.
- Los mensajes humanos conservan sus erratas y los generados no tienen ninguna. Parte de la diferencia puede venir de ahí.
- La guía no arregla el ritmo: medida con las dos versiones, la variación de longitud de frase se queda en 0,45 frente a 0,61 de los mensajes humanos. Sí elimina del todo rayas, comillas angulares, negritas y fórmulas hechas.
- Ni v1.1 ni v1.2 tienen clase humana en challenge, y v1.0 no tenía clase humana en los registros general, técnico y marketing.
