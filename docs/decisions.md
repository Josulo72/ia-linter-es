# Decisiones

Solo decisiones difíciles de revertir. Formato: fecha, decisión, motivo, alternativa descartada.

## 2026-09-17 — Dependencias de ejecución mínimas
Decisión: `yaml`, `ajv`, `commander`, `fast-glob`, `ignore`, `mdast-util-from-markdown` (+ gfm y frontmatter), sin más. Dev: `typescript`, `vitest`, `tsx`, `esbuild`.
Motivo: el Markdown se analiza por AST (arquitectura §6.3); reimplementar un parser CommonMark sería alcance nuevo. El resto son utilidades pequeñas y estables.
Descartado: `unified`/`remark` completos (más peso sin ganancia), parser propio.

## 2026-09-17 — Rule Pack como artefacto generado, no versionado
Decisión: `packages/linter/rulepack/rulepack.json` se genera en `pnpm build` y se publica en npm, pero no se commitea.
Motivo: una única fuente de verdad (YAML). Evita divergencia entre YAML y JSON.

## 2026-09-17 — Corpus humano solo de dominio público y CC-BY-4.0 verificables por registro
Decisión: la clase humana se limita a textos de dominio público (Project Gutenberg, Wikisource con verificación por obra) y textos con licencia CC-BY-4.0 comprobada en el propio registro. Wikipedia (CC-BY-SA) queda excluida del corpus principal.
Motivo: arquitectura §11.2 rechaza SA. Los textos históricos se destinan a `challenge` por diferencia de registro.
Consecuencia: la clase humana de `development` y `holdout` es pequeña y se documenta como límite en `docs/benchmark.md`.

## 2026-09-17 — Clase IA generada por el mismo modelo que diseña las reglas
Decisión: los textos IA se generan con subagentes de Claude Code (claude-haiku-4-5, claude-sonnet-5 y claude-opus-5) durante el desarrollo, con prompt, modelo, parámetros y hash registrados.
Motivo: es la única generación disponible sin credenciales externas. Se documenta la circularidad como límite explícito del benchmark y no se presenta como evaluación independiente.

## 2026-09-17 — Huella de baseline
Decisión: `sha256(rule + "\0" + ruta relativa + "\0" + snippet normalizado + "\0" + ordinal)`. Sin líneas ni texto completo.
Motivo: estable ante reformateos y cambios de línea; el ordinal distingue repeticiones idénticas en el mismo archivo.

## 2026-09-17 — El producto es la voz humana por situación, no un detector
Decisión: la referencia de «humano» pasa a ser el español cotidiano de una persona normal (educado, sin faltas ni abreviaturas), variable según la situación: conversación, correo, README y redes. La pieza principal es la guía de estilo que se le da al modelo antes de escribir (`integrations/claude-code/output-styles/humano.md`); el linter queda como revisor.
Motivo: el benchmark v1.0 dio resultado negativo y el registro formal (BOE, prensa científica, artículos académicos) es minoritario. Un README generado marcaba 2/100 con las reglas v1.0 y olía a IA.
Consecuencia: el corpus v1.0 se archiva en `corpus/archive/v1.0` con sus manifiestos y su informe; el gate `index.min_median_gap` sigue sin rebajarse y bloquea B6 hasta que v1.1 lo supere.

## 2026-09-17 — Clase humana cotidiana sin redistribución
Decisión: los mensajes de foro que forman la clase humana de v1.1 no se suben al repositorio. Se descargan en local con `benchmark/scripts/fetch-foros.mjs` y en el repositorio queda solo el manifiesto con URL, fecha, foro, número de palabras y sha256. Se limitan a mensajes anteriores a `cutoff_date` (2022-11-30).
Motivo: no tienen licencia abierta. Analizarlos sin republicarlos entra en la excepción de minería de textos (RDL 24/2021, art. 67). La fecha de corte evita que se cuele texto generado.
Consecuencia: `corpus-check` comprueba estos registros por origen y hash, y avisa (sin fallar) si los textos no están descargados en el equipo. `corpus/*/h-foro-*.md` está en `.gitignore`.

## 2026-09-17 — El ritmo no se arregla con la guía, se arregla en el revisor
Decisión: la guía de estilo describe el ritmo pero no lleva receta numérica. Corregirlo es trabajo del revisor: el linter marca `estructura/ritmo-plano` o `estructura/ritmo-metronomo` y el modelo reescribe a continuación.
Motivo: se probaron nueve redacciones de la instrucción, ocho textos cada una (`benchmark/scripts/probar-ritmo.mjs`). Ninguna deja el texto más cerca del humano (0,61 de variación de longitud de frase y 0,67 de alternancia) que no decir nada: sin guía la distancia es 0,15 y la mejor candidata 0,17, que con ocho textos es ruido. La instrucción con números sí sube la variación a 0,71, pero dispara la alternancia a 0,91 y saca metrónomo en 6 de 8 textos.
Descartado: pedirlo con cifras («al menos una frase de menos de 8 palabras y otra de más de 25 en cada párrafo»), que es justo lo que produce la cadencia de plantilla.
Consecuencia: nace `estructura/ritmo-metronomo` y las dos reglas de ritmo se activan en los perfiles de situación. El hook de Claude Code deja de ser un extra y pasa a ser la pieza que cierra el círculo.

## 2026-09-17 — Cuatro perfiles nuevos por situación
Decisión: se añaden los perfiles `chat`, `correo`, `readme` y `redes` a los cuatro existentes. Las reglas de tipografía (`formato/raya`, `formato/comillas-angulares`) están desactivadas por defecto y solo se activan en estos perfiles.
Motivo: la raya pegada es correcta en prosa editada y anómala en un mensaje o un README. El perfil es el lugar donde vive «cada cosa en su momento».

## 2026-09-18 — Tres reglas stable bajan a candidate por no disparar nunca
Decisión: `densidad/conectores`, `lexico/desde-hasta-pasando` y `lexico/metaforas-comodin` pasan de `stable` a `candidate`. No cambia su nivel por defecto ni su perfil: sigue viéndose lo mismo al ejecutar el linter, pero dejan de contar como producto estable y salen del gate de falsos positivos.
Motivo: no disparan en ningún texto del corpus v1.0, ni del v1.1, ni del v1.2 (90 textos por partición en correo, readme y redes). El gate de FP/1000 las aprobaba por vacío. Auditoría: `benchmark/scripts/auditoria-banco-v1.2.mjs`.
Consecuencia: quedan 25 reglas `stable`, por encima del mínimo de 24 de `quality-policy.yml`. Las otras tres que la auditoría de v1.1 señalaba sí aparecen ya en v1.2: `densidad/intensificadores` (1 texto IA en correo y 1 en redes), `lexico/ya-sea-enumeracion` (1 texto IA en readme) y `densidad/verbos-comodin`, que solo dispara en un README humano; se queda `stable` por el criterio, no porque la evidencia convenza.

## 2026-09-18 — La API también lee disco
Decisión: `src/api` puede importar `fs`. Lee el `package.json` para la versión, el Rule Pack compilado y, en `lintFile`, el archivo que se analiza. `paths.ts` sale de la lista de módulos con `fs` porque solo usa `path` y `url`.
Motivo: la API de arquitectura §10.2 analiza archivos y proyectos, y sin disco no puede. El gate de imports ya lo permitía; faltaba registrarlo.
Consecuencia: la lista de AGENTS.md §2 se queda corta y hay que añadirle `api`.

## 2026-09-18 — D1: `estructura/ritmo-plano` se apaga en el perfil correo y sigue en readme
Decisión: la regla queda activa en `chat`, `readme` y `redes`, y deja de estarlo en `correo`. No cambian su umbral, su nivel ni su estado (`candidate`).
Motivo: en correo marca a los humanos igual que a la IA y supera el límite de falsos positivos de la política (FP/1000 = 2,107, máximo 1,5). Development v1.2 de correo, textos por encima del umbral del índice: antes 9 de 15 humanos y 9 de 15 IA (exactitud equilibrada 0,50); sin la regla, 4 de 15 humanos y 1 de 15 IA (0,40). Se van la mitad de las falsas alarmas sobre correos humanos. En correo el índice no separaba ni separa.
Descartado: apagarla también en readme. Allí cumple la política (FP/1000 = 0,889) y quitarla no reduce ninguna falsa alarma humana: siguen marcados 5 de 14 README humanos y la IA marcada baja de 7 de 15 a 4 de 15 (exactitud equilibrada de 0,555 a 0,455). El −2 del holdout v1.2 en README es una diferencia pequeña con 15 textos por lado.
Consecuencia: `benchmark/reports/development-v1.2-correo.json` se regenera con la regla apagada. Los informes de holdout v1.2 no se regeneran, porque ese holdout ya se usó con las reglas cerradas. El cambio se cuenta en el anexo de `benchmark/reports/v1.2.md`. El holdout v1.1 se evaluó con el perfil `chat` y no cambia.

## 2026-09-18 — D2: adjudicación ciega de development v1.2 por un modelo de otro proveedor
Decisión: los hallazgos de development v1.2 (correo, readme y redes) los adjudica GPT-5.6 Sol, un modelo que no es de la familia que escribe las reglas. Lo hace a ciegas: sin id de muestra, sin saber si el texto es humano o generado, sin el estado de la regla y sin resultados esperados. El propietario revisa los casos que queden como `dudoso`. Paquetes con `benchmark/scripts/dump-findings.mjs --ciego`; método en `docs/benchmark.md`.
Motivo: en v1.0 adjudicó la misma IA que había escrito las reglas, y eso es circular.
Descartado: que adjudique la IA ejecutora y el propietario revise después.
Cómo se hizo al final: adjudicó GPT-5.6 Sol en ChatGPT, sobre los tres paquetes ciegos, sin acceso a los mapas, a la clase humano/IA ni al estado de las reglas. El dato del modelo lo declara el propietario: no hay sesión registrada ni un campo de proveedor en la respuesta. También se preparó el envío a Codex por el coordinador local (`implementer: none`, carpeta con solo los paquetes), pero no llegó a ejecutarse. Los paquetes que se adjudicaron eran los primeros, con prefijo `r-` en readme y en redes; las respuestas se tradujeron a `m-` y `s-` por el paquete de origen, con el mismo número, que es la posición en el paquete. Respuestas tal como llegaron (ya traducidas) en `benchmark/annotations/v1.2/respuestas/`. Alcance: GPT-5.6 Sol se usó una sola vez, como validación externa del benchmark. No forma parte de la arquitectura del producto ni es un requisito para ejecutarlo: el linter no lo llama, no lo necesita y funciona igual sin él. Resultado del adjudicador: 13 `correct`, 36 `incorrect` y 1 `dudoso` (redes, s-010, `densidad/intensificadores`). El propietario lo resolvió como `incorrect`: «opinión completamente distinta» es una expresión normal y por sí sola no demuestra el exceso de intensificadores. Esa revisión está aparte, en `respuestas/redes-revision.yml`, y el archivo final la marca en `revisados_por_el_propietario`. Total: 13 `correct`, 37 `incorrect`, 0 dudosos.

## 2026-09-18 — Las reglas de longitud de frase no se adjudican
Decisión: `estructura/longitud-uniforme`, `estructura/ritmo-plano` y `estructura/ritmo-metronomo` quedan fuera de la adjudicación y su precisión adjudicada es `null`. Se evalúan por FP/1000 en la clase humana y por las pruebas globales (separación de medianas y exactitud equilibrada por registro).
Motivo: miden la variación de longitud de frase del texto entero. En un fragmento no hay nada que leer para saber si aciertan.
Descartado: darlas por correctas por construcción, como se hizo en v1.0. Eso infla la precisión con hallazgos que nadie ha revisado.
Consecuencia: `longitud-uniforme` es `stable` y no puede cumplir `min_adjudicated_precision` de `quality-policy.yml`. No se rebaja el umbral ni se cambia su estado por esto. Al cerrar B9 se decidió dejarla como está.

## 2026-09-18 — Cierre de B9: dos reglas stable bajan a candidate, `stable_min` pasa de 24 a 23 y las comillas angulares se apagan en correo
Decisión:
- `retorica/pregunta-retorica-apertura` y `formato/encabezado-title-case` pasan de `stable` a `candidate`. No cambian su nivel por defecto ni sus perfiles.
- `stable_min` de `quality-policy.yml` baja de 24 a 23. Con los dos cambios quedan 23 reglas `stable`.
- `formato/comillas-angulares` sigue en `candidate` y deja de estar activa en el perfil `correo`. Se quita de los dos sitios donde estaba declarada para ese perfil: la propia regla (`info`) y `rules/profiles/correo.yml` (`warning`, que era el que mandaba). Queda en su nivel por defecto, `off`.
- No se promueve ninguna `candidate`. La única que llega a 0,70 es `lexico/honestidad-anunciada`, con un solo hallazgo adjudicado.
- El resto de reglas se quedan como están. Ninguna otra tiene cinco hallazgos adjudicados o más, y con menos no se decide.
Motivo: adjudicación ciega de development v1.2 (D2). `pregunta-retorica-apertura` acierta 4 de 12 (0,33; correo 0/4, readme 1/4, redes 3/4) y `encabezado-title-case` 2 de 7 (0,29, todos en readme). La política pide 0,70 de precisión adjudicada para ser `stable`. Mantener como estable una regla que acierta un tercio de las veces, solo para llegar a una cifra mínima de reglas, es engañar con la etiqueta. El mínimo de 24 era un objetivo de producto de la v1.0 y no una prueba de calidad, así que se ajusta el número y no la evidencia. `comillas-angulares` no acierta ninguno de sus 7 hallazgos en correo y su FP/1000 allí es 1,844, por encima del máximo de 1,5.
Descartado: dejar `pregunta-retorica-apertura` como `stable` apagándola en correo y readme, donde falla, para seguir en 24. Sería acomodar el perfil para cumplir la cifra. También se descartó no tocar nada hasta v1.3 y dejar el incumplimiento escrito.
Consecuencia: `benchmark/reports/development-v1.2-correo.json` se regenera sin `comillas-angulares`. Su nota «7 adjudicaciones no corresponden a ningún hallazgo» son esas siete, que siguen en `benchmark/annotations/v1.2/correo.yml` como registro de la adjudicación. En correo, los textos humanos por encima del umbral del índice bajan de 4 de 15 a 1 de 15, y la IA se queda en 1 de 15. El gate de reglas cuenta 23 `stable` dentro de 23 a 30. La muestra es pequeña (50 hallazgos adjudicados en tres registros) y un solo adjudicador. Con más datos en v1.3 alguna de las dos reglas podría volver a `stable` si llega a 0,70.

## 2026-09-18 — Una sola IA en el producto, y está fuera del linter
Decisión: el linter sigue siendo determinista y no lleva ninguna IA dentro. Detecta patrones, aplica perfiles y genera instrucciones de reescritura. La única IA del producto es el asistente que recibe esas instrucciones y reescribe el texto. Cualquier propuesta que meta una segunda IA trabajando de forma permanente dentro del producto (un modelo que revise, adjudique, puntúe o reescriba junto al asistente) se descarta, salvo aprobación expresa del propietario.
Motivo: el análisis tiene que dar el mismo resultado con el mismo texto, sin red y sin coste por uso. Una segunda IA en el circuito lo haría no determinista y dependiente de un proveedor.
Alcance: no afecta al trabajo de medición. Adjudicar un benchmark (D2) o generar la clase IA de un corpus (B12) son validaciones externas y puntuales, no forman parte del producto y no son requisito para ejecutarlo.
