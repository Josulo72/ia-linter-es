# PLAN v1.0

Alcance: el definido en `docs/architecture.md` §2 y §17. Sin MVP, sin demo, sin ampliación.

## Orden de trabajo (un bloque principal a la vez)
1. **Base** — repositorio, contratos, modelo documental, Markdown, configuración, build, CI.
2. **Motor** — detectores (7), compilador con seguridad de regex, runtime, scoring, supresiones, baseline.
3. **Producto local** — CLI, API, reporters (terminal, JSON, SARIF), 24–30 reglas stable con fixtures y evidencia.
4. **Evidencia** — corpus propio trazable (humano de fuentes abiertas, IA generada y registrada), veto automatizado, benchmark reproducible, calibración, límites documentados.
5. **Integraciones** — pre-commit, GitHub Action, plugin Claude Code, paridad E2E de resultados.
6. **Cierre** — seguridad, rendimiento, multiplataforma, empaquetado npm (`pnpm pack` + instalación en temporal), release reproducible.

## Dependencias
2 depende de 1. 3 de 2. 4 de 3 (necesita CLI y reglas). 5 de 3. 6 de 4 y 5.

## Gates por bloque
- Todos: `pnpm typecheck`, `pnpm test`, `pnpm build`.
- 2+: gate de seguridad regex y sin red (`pnpm gates`).
- 3+: fixtures de reglas en build; E2E CLI.
- 4: `scripts/corpus-check.mjs` (licencias + veto) y `benchmark run` con informe en `benchmark/reports/`.
- 5: E2E de cada adaptador y test de paridad JSON.
- 6: `pnpm pack`, instalación en directorio temporal, ejecución de la CLI desde allí; CI en tres sistemas.

## Criterios de aceptación
Los 25 puntos de `docs/architecture.md` §17, cada uno con evidencia en `project/EVIDENCE/`.

## Bloqueos conocidos
- Publicar en npm, hacer `git push` e instalar el plugin en `~/.claude` requieren acción del propietario.
- macOS y Linux no pueden ejecutarse localmente (Windows). Se cubren mediante el workflow de CI; la evidencia queda pendiente de la primera ejecución en GitHub.

---

# PLAN fase 2: el circuito de reescritura (B7 a B13)

Sale de comparar la arquitectura actual con la propuesta del 2026-09-18. El motor no se toca: siguen los siete detectores, el Rule Pack compilado y una sola fórmula de puntuación. Lo que cambia está alrededor. El linter devuelve instrucciones de reescritura en un formato fijo, la guía y los perfiles se comprueban juntos por situación, y la evidencia pasa a tener adjudicación y una clase IA que no sale del mismo modelo.

Nada de esto reabre las exclusiones de `docs/architecture.md` §2.2. No hay auto-fix (el linter no reescribe, da instrucciones y reescribe el modelo), ni servidor MCP, ni red durante el análisis.

## Dos cambios respecto al diagrama de la propuesta

- La guía no se genera desde un YAML. `humano.md` sigue escrita a mano, porque es texto validado por el propietario y generarlo es la forma más fácil de perder esa voz. Lo que se añade es un archivo que declara qué sección de la guía y qué perfil corresponden a cada situación, y un gate que falla si no cuadran.
- La exportación para otros asistentes no se llama `AGENTS.md`. Ese nombre ya lo usa el repositorio para las reglas de la IA ejecutora. Va en `integrations/agents-md/` como un fragmento para pegar en el AGENTS.md del proyecto de cada uno.

## Decisiones que toma el propietario

Cada una se toma antes de empezar el bloque que la necesita. Si no está tomada, ese bloque se queda en `blocked` y se pasa al siguiente que no dependa de ella. No se toma por defecto.

| Id | Decisión | Recomendación | La necesita |
|---|---|---|---|
| D1 | Apagar `estructura/ritmo-plano` en los perfiles `correo` y `readme` | Tomada el 2026-09-18: solo en correo. En readme no quitaba falsas alarmas humanas (ver `docs/decisions.md`) | B8 |
| D2 | Quién adjudica los hallazgos de development v1.2 | El propietario, o un modelo distinto del que escribe las reglas. Si lo hace solo la IA ejecutora se repite la circularidad de v1.0 | B9 |
| D3 | Proveedor y modelo de la clase IA externa para el corpus v1.3 | Cualquiera que no sea Claude. Hace falta cuenta y clave, así que genera el propietario | B12 |

## Orden

```text
B7 cerrar lo pendiente
 └─ B8 ritmo por perfil (D1)
     └─ B9 adjudicación v1.2 (D2)
         ├─ B10 reporter de revisión y adaptadores
         │   └─ B11 situaciones y exportación a otros asistentes
         │       └─ B13 cierre de la fase 2
         └─ B12 corpus v1.3 con IA externa (D3), en paralelo con B10 y B11
```

Solo hay un bloque principal en curso, como dice AGENTS.md. B12 puede ir en paralelo porque no comparte archivos con B10 ni con B11 y la generación la hace el propietario.

## Archivos que toca cada bloque

Dos bloques que tocan el mismo archivo van en serie, y así están ordenados.

| Bloque | Archivos |
|---|---|
| B7 | los 15 archivos modificados ahora mismo en `packages/linter/src/` y `scripts/gates.mjs`; `docs/decisions.md` |
| B8 | `packages/linter/rules/definitions/estructura--ritmo-plano.yml`; `docs/decisions.md`; `docs/rules.md` (generado); `benchmark/reports/development-v1.2-correo.json`; anexo en `benchmark/reports/v1.2.md` |
| B9 | `packages/linter/src/cli/benchmark.ts`; `packages/linter/src/cli/main.ts` (solo el subcomando `benchmark run`); `benchmark/annotations/v1.2/`; `benchmark/scripts/dump-findings.mjs`; `scripts/gates.mjs` (aviso de precisión); `docs/benchmark.md` |
| B10 | `packages/linter/src/reporters/index.ts`; `packages/linter/src/cli/main.ts` (validación de `--format`); `packages/linter/src/config/index.ts` (validación de `reporter`); `integrations/claude-code/scripts/revisar-respuesta.mjs`; `integrations/claude-code/commands/revisar.md`; `integrations/claude-code/skills/escribir-en-espanol/SKILL.md`; `packages/linter/test/`; `docs/configuration.md` |
| B11 | `packages/linter/rules/situaciones.yml` (nuevo); `scripts/gates.mjs` (dos gates nuevos); `integrations/agents-md/` (nuevo); `integrations/claude-code/skills/escribir-en-espanol/SKILL.md`; `README.md` |
| B12 | `corpus-v1.3/`; `corpus/policy/prompts-v1.3.yml`; `benchmark/configs/holdout-v1.3.lock`; `scripts/corpus-check.mjs` |
| B13 | `CHANGELOG.md`; los dos `package.json` (versión); bundles de `integrations/`; `project/EVIDENCE/B7-B13-fase2.md`; `project/STATE.md` |

`main.ts` lo tocan B7, B9 y B10, y `gates.mjs` B7, B9 y B11. Ninguno de esos bloques empieza hasta que el anterior está commiteado. `scripts/corpus-check.mjs` solo lo toca B12.

## B7. Cerrar el trabajo pendiente

Hay 15 archivos modificados sin commitear de una sesión anterior: `checkOptions` en la API, rutas de la CLI relativas al directorio de trabajo, códigos de salida de commander, un gate de imports que ya ve `import()`, `require` y `getBuiltinModule`, el recálculo del holdout v1.1 en `gates.mjs` y `codeRanges` en el documento, para que una directiva de supresión escrita dentro de código no cuente. Cualquier bloque que toque `main.ts`, `api/index.ts` o `gates.mjs` chocaría con eso.

1. Leer el diff entero (`git diff`) y comprobar que cada cambio tiene su test. Si falta alguno, se escribe.
2. El comentario nuevo de `gates.mjs` cita una decisión «2026-09-18: la API también lee disco» que no está en `docs/decisions.md`. Se añade la entrada, o se corrige el comentario si no hubo tal decisión.
3. `paths.ts` sale de la lista de módulos con permiso de `fs`. Comprobar que sigue sin importar `fs` (hoy solo importa `path` y `url`).
4. `pnpm typecheck && pnpm build && pnpm test && pnpm gates && pnpm lint:self && pnpm pack:check`.
5. El propietario revisa y hace el commit, solo con esto y sin mezclar nada de la fase 2.

Hecho cuando `git status` sale limpio y los gates están en verde.

## B8. Ritmo solo donde separa

Depende de D1. Si D1 es no, el bloque se cierra sin cambios y con la decisión registrada.

1. En `estructura--ritmo-plano.yml`, `profiles` pasa de `{ chat, correo, readme, redes }` a `{ chat: warning, readme: warning, redes: warning }` (D1: solo sale correo). `default_level` sigue en `off`. No se toca `rules/profiles/*.yml`: el nivel de esta regla por perfil vive en la propia regla, y ponerlo también en el perfil sería declararlo en dos sitios.
2. `estructura/ritmo-metronomo` no cambia. No hay medida que diga lo contrario.
3. Entrada en `docs/decisions.md` con las cifras de `benchmark/reports/v1.2.md`.
4. `pnpm build` regenera `docs/rules.md`.
5. Volver a ejecutar development v1.2 de correo:
   `node packages/linter/dist/cli/main.js benchmark run --corpus corpus-v1.2 --partition development --register correo --profile correo -o benchmark/reports/development-v1.2-correo.json`. Se probó también readme sin la regla y se descartó.
6. Los informes de holdout v1.2 no se regeneran. Ese holdout ya se usó con las reglas cerradas, y volver a pasarlo para enseñar la mejora sería presentarlo otra vez como independiente. Lo que cambia se cuenta en un anexo de `v1.2.md`, marcado como medida posterior sobre development.
7. Comprobar que el gate del holdout v1.1 no se mueve. Ese informe se evaluó con el perfil `chat` (`config.profile` de `holdout-v1.1.json`), donde la regla sigue activa.

Hecho cuando los gates están en verde, `docs/rules.md` refleja el cambio y la decisión está registrada.

## B9. Adjudicación de development v1.2

Depende de D2. Sin adjudicación la precisión es `null` y no se puede promover ni retirar ninguna regla con `quality-policy.yml` en la mano.

Antes hay un conflicto que resolver. `benchmark run` busca las adjudicaciones en `benchmark/annotations/<partición>.yml`, sin versión, y el corpus v1.1 y el v1.2 tienen los dos una partición `development`. Un `development.yml` nuevo lo leerían los dos. Por cierto, eso también quiere decir que `benchmark/annotations/v1.0/development.yml` hoy no lo lee nadie.

1. Añadir a `benchmark run` la opción `--annotations <archivo>`. Si se pasa, se lee ese archivo y solo ese. Si no, se hace lo de ahora, para que los informes publicados se reproduzcan igual.
2. Test: con `--annotations` se usa el archivo indicado, y sin la opción la salida es idéntica a la de antes.
3. `dump-findings.mjs` saca los hallazgos de development v1.2 por registro con la clave `<id>|<regla>|<huella>` que ya usa el benchmark.
4. Se escriben `benchmark/annotations/v1.2/{correo,readme,redes}.yml` con el formato de `benchmark/annotations/v1.0/development.yml`: `schema_version`, `reviewers`, quién adjudica y con qué criterio, y una línea `correct` o `incorrect` por hallazgo con el fragmento como comentario. Quién escribe `correct` o `incorrect` lo dice D2.
5. Volver a ejecutar development v1.2 por registro con `--annotations`.
6. Con la precisión delante: cada `candidate` que llegue a 0,70 de precisión adjudicada y a FP/1000 ≤ 1,5, y que tenga ejemplos y evidencia, se propone para `stable`. Cada `stable` por debajo se propone para `candidate`. Son propuestas y se aplican solo si el propietario las acepta, cada una con su entrada en `docs/decisions.md`. Las `stable` tienen que seguir entre 24 y 30.
7. En `scripts/gates.mjs`, el aviso «precisión adjudicada no se puede comprobar» deja de salir para las reglas que ya están adjudicadas.
8. `docs/benchmark.md` explica cómo se adjudica y dónde está cada archivo.

Hecho cuando los tres registros tienen su archivo de adjudicación, los informes de development llevan precisión y las propuestas están decididas.

## B10. Reporter de revisión y adaptadores

Las reglas ya tienen `rewrite_guidance`, pero al modelo no le llega. El hook le pasa solo el mensaje de cada hallazgo, y `/revisar` y la skill le mandan leer la salida de la terminal.

1. Reporter nuevo `revision` en `packages/linter/src/reporters/index.ts`. Recibe lo mismo que los demás (`ScanResult` y las reglas compiladas) y escribe, por cada hallazgo no suprimido y en el orden del runner:
   ```text
   respuesta.md:3:12 formato/sentencia-dos-puntos
     Fragmento: <snippet>
     Qué pasa: <message>
     Cómo reescribir: <rewrite_guidance>
   ```
   Al final, el índice y el perfil cuando hay índice. Texto plano, sin color y determinista.
2. `Finding` no cambia y `SCHEMA_VERSION` se queda en 1. El JSON de hoy sale igual byte a byte y los tests de paridad no se tocan.
3. Añadir `revision` en los tres sitios que enumeran reporters: el tipo `ReporterName` (`reporters/index.ts`), la comprobación de `--format` (`cli/main.ts`) y la validación de `reporter` (`config/index.ts`).
4. El hook `revisar-respuesta.mjs` sigue decidiendo con el JSON, como ahora (niveles, mínimo de palabras, tope de intentos). Cuando bloquea, en vez de listar mensajes vuelve a llamar a la CLI con `--format revision` y pone esa salida en stderr, con la misma frase final de ahora.
5. `commands/revisar.md` y la skill pasan a usar `--format revision` en vez de `--verbose`.
6. Tests:
   - unitario del reporter, con hallazgos de varios detectores;
   - E2E de la CLI con `--format revision`;
   - los E2E del hook en `integraciones.e2e.test.ts` se actualizan a mano, leyendo la salida nueva. No se regenera ningún snapshot sin mirarlo;
   - el test de paridad entre CLI, Action y bundle pasa sin cambios.
7. `docs/configuration.md` añade el reporter.

Hecho cuando el hook, `/revisar` y la skill dan al modelo el fragmento, la regla y la guía de reescritura, y todos los gates pasan.

## B11. Situaciones y exportación a otros asistentes

1. `packages/linter/rules/situaciones.yml`:
   ```yaml
   schema_version: 1
   situaciones:
     - { id: chat, perfil: chat, guia: "Conversación" }
     - { id: correo, perfil: correo, guia: "Correo" }
     - { id: readme, perfil: readme, guia: "README y textos de un proyecto" }
     - { id: redes, perfil: redes, guia: "Redes" }
   ```
   `guia` es el principio de la viñeta en la sección «Según la situación» de `humano.md`.
2. Gate `situaciones` en `scripts/gates.mjs`. Falla si una situación apunta a un perfil que no está en `rules/profiles/`, si su viñeta no aparece en `humano.md`, o si en esa sección de `humano.md` hay una viñeta de situación sin entrada en el archivo (la del registro formal se declara como excepción). Va en `gates.mjs` y no en el compilador para que el paquete publicado no dependa de `integrations/`.
3. `integrations/agents-md/`:
   - `build.mjs` copia `humano.md` a `integrations/agents-md/escribir-en-espanol.md`, quita los comentarios `ia-linter-disable` y la cabecera del estilo de salida, y añade al final cómo llamar al linter con `--format revision`;
   - `README.md` explica cómo pegarlo en el AGENTS.md de un proyecto para Codex o cualquier asistente que lo lea. Se escribe con la voz de la guía, porque `lint:self` pasa por `integrations/`.
4. Gate `agents-md`: el `escribir-en-espanol.md` del repositorio tiene que ser igual a lo que genera `build.mjs`. Si alguien cambia `humano.md` y no regenera, falla.
5. La tabla de perfiles de la skill de Claude Code se comprueba contra `situaciones.yml` en el mismo gate.
6. Un párrafo en `README.md` sobre la exportación.

Hecho cuando los dos gates nuevos están en verde, y en rojo cuando se rompe a propósito una viñeta o un perfil (se prueba y se deshace).

## B12. Corpus v1.3 con clase IA externa

Depende de D3, y una parte la ejecuta el propietario. Sirve para quitar la circularidad y para tener un holdout sin usar para la próxima versión de reglas, porque los de v1.1 y v1.2 ya están gastados.

1. `corpus/policy/prompts-v1.3.yml` con los mismos encargos que v1.2 (correo, README y redes) y el proveedor y modelo de D3.
2. `corpus-v1.3/` con la misma estructura que v1.2 y sus manifiestos. Los textos humanos pueden ser los de v1.2 o nuevos, siempre anteriores a 2022-01-01. Si se reutilizan, se dice en el manifiesto.
3. El propietario genera los textos IA con su cuenta. En el repositorio quedan texto, prompt, modelo, fecha, parámetros y hash. La clave no.
4. `scripts/corpus-check.mjs` comprueba también v1.3: licencias, veto, hashes y fecha de corte.
5. `benchmark/configs/holdout-v1.3.lock` se congela antes de ejecutar nada sobre ese holdout.
6. En este bloque solo se ejecuta development. El holdout v1.3 espera a que haya una versión de reglas cerrada.

Hecho cuando `corpus-check` pasa con v1.3 y el lock está en el repositorio.

## B13. Cierre de la fase 2

1. `pnpm build` regenera los bundles de `integrations/claude-code/bundle` y `integrations/github-action/bundle`.
2. Todos los gates, `lint:self` y `pack:check`.
3. `CHANGELOG.md` con la 1.1.0: reporter `revision`, ritmo por perfil, adjudicación, situaciones y exportación.
4. Versión 1.1.0 en los dos `package.json`.
5. `project/EVIDENCE/B7-B13-fase2.md` con la salida de los gates y las cifras de development de antes y de después.
6. `project/STATE.md` al día.
7. Push, release con el `.tgz` y el `.zip`, y `npm publish` los hace el propietario.

## Gates de la fase 2

En cada bloque, los de siempre: `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm gates`, `pnpm lint:self` y `pnpm pack:check`. Además:

- B9: `benchmark run` sin `--annotations` da la misma salida que antes.
- B10: el JSON de `lint` sale igual byte a byte y la paridad entre CLI, Action y bundle se mantiene.
- B11: los gates `situaciones` y `agents-md` pasan, y fallan cuando se rompen a propósito.
- B12: `corpus-check` con v1.3.

Ningún umbral de `quality-policy.yml` se rebaja en esta fase.

## Lo que no entra

Servidor MCP, auto-fix, reescritura con IA desde el linter, formatos de entrada nuevos, telemetría, un tercer sitio para declarar perfiles, cambios en los siete detectores y cambios en la fórmula del índice.
