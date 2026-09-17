# B5 Integraciones y B6 Cierre — evidencia (2026-09-17)

Ejecutado en Windows 10, Node 24.12, pnpm 10.33, y en CI sobre Ubuntu, Windows y macOS con Node 20 y 22. La primera ejecución verde es la 35278335496 del 2026-09-17, con los seis jobs en success.

## Gates

```
pnpm typecheck                     sin errores
pnpm test                          7 archivos, 77 tests
node scripts/corpus-check.mjs      Corpus en verde (459 archivos sin referencias vetadas)
node scripts/gates.mjs             Todos los gates en verde
  ✔ ningún módulo usa red; fs solo en runner/cli/config/baseline/compiler/api
  ✔ 28 reglas stable (38 en el pack)
  ✔ 6 categorías distintas
  ✔ detectores usados: cooccurrence, density, lexicon, regex, repetition, sequence, structure
  ✔ 10k palabras en 312 ms (límite 1500)
  ✔ separación de medianas del índice: 14.5 (mínimo 10)
  ✔ todas las reglas stable con FP/1000 <= 1.5
```

## Integraciones

`packages/linter/test/integraciones.e2e.test.ts`, 16 tests en verde:

```
Paridad entre superficies
  ✓ CLI, bundle y Action ven exactamente los mismos hallazgos
  ✓ la Action no redefine la configuración del repositorio
GitHub Action
  ✓ publica una anotación por hallazgo, con archivo y línea
  ✓ annotations=false calla las anotaciones pero cuenta igual
  ✓ escribe SARIF válido cuando se le pide
  ✓ sin CLI ni bundle, falla diciendo qué hay que hacer
Hook de Claude Code
  ✓ desactivado por defecto: no mira ni la respuesta
  ✓ encendido, devuelve la respuesta con el motivo en stderr
  ✓ deja pasar un texto que no marca nada
  ✓ no insiste más de lo que dice el tope
  ✓ la respuesta se lee como Markdown: el código no cuenta como prosa
  ✓ un mensaje corto o vacío no se revisa
  ✓ entrada ilegible no bloquea nada
Pre-commit
  ✓ la definición está en la raíz y llama a la CLI sin lógica propia
  ✓ el hook de npm pide la versión publicada, que es la de este paquete
  ✓ analizar los archivos uno a uno da lo mismo que analizarlos juntos
```

La paridad se comprueba comparando el JSON completo byte a byte: `reportJson` no lleva tiempos ni rutas absolutas, así que la comparación es directa y no hay normalización en el test.

## Empaquetado

```
node scripts/pack-check.mjs
  ✔ tarball: ia-linter-es-1.0.0.tgz
  ✔ 60 archivos, con CLI, API, Rule Pack, perfiles y licencia
  ✔ instalado con npm install desde el tarball
  ✔ ia-linter-es 1.0.0
  ✔ 38 reglas, las mismas que en el repositorio
  ✔ mismo JSON byte a byte que en el repositorio
  ✔ mismo resultado con un proxy inválido
Empaquetado en verde
```

El tarball no lleva fuentes ni tests. La comprobación de contenido lee las cabeceras del tar en Node, sin depender del `tar` del sistema.

## El proyecto se pasa su propio linter

```
pnpm lint:self
16 archivo(s), 15 hallazgo(s): 0 error, 0 warning, 15 info, 10 suprimido(s)
OK (fail_on: warning)
```

Los info que quedan son citas de patrones dentro de la documentación y un nombre propio («Plugin de Claude Code») que `formato/encabezado-title-case` lee como Title Case. Las diez supresiones son párrafos que citan a propósito las fórmulas que la guía manda evitar. La configuración está en `ia-linter.yml`, con `docs/rules.md` exento porque es el catálogo de ejemplos.

## Criterios de aceptación de §17

| Criterio | Dónde |
|---|---|
| Motor offline y determinista | gate de imports (la garantía real) y `pack-check` con un proxy inválido |
| Texto y Markdown | `document.test.ts`, `engine.test.ts` |
| Entre 24 y 30 reglas estables | 28 stable de 38 |
| Rule Pack compilado | `pnpm build`, no se commitea |
| CLI completa | `cli.e2e.test.ts` |
| API programática | `api.test.ts` |
| Configuración y perfiles | `config.test.ts`, 8 perfiles |
| Supresiones | `cli.e2e.test.ts` |
| Baseline | `cli.e2e.test.ts` |
| Terminal, JSON y SARIF | `cli.e2e.test.ts`, `integraciones.e2e.test.ts` |
| Pre-commit | `.pre-commit-hooks.yaml`, tests de paridad |
| GitHub Action | `integraciones.e2e.test.ts` |
| Claude Code | plugin completo, 6 tests del hook |
| Corpus propio y trazable | `corpus-check`, manifiestos con hash |
| Veto automatizado | `corpus-check`, 459 archivos |
| Benchmark publicado | `benchmark/reports/v1.0.md` y `v1.1.md` |
| E2E de todas las superficies | 77 tests |
| Paridad de resultados | byte a byte entre CLI, bundle y Action |
| Windows, macOS y Linux | los seis jobs de CI en verde (run 35278335496) |
| Seguridad de patrones | compilador y gate de regex |
| Rendimiento aceptable | 10k palabras en 312 ms |
| Documentación | README, docs/, CHANGELOG, CONTRIBUTING, SECURITY |
| Paquete npm instalable | `pack-check` |
| Release reproducible | `pnpm build` regenera el Rule Pack y el bundle desde los YAML |
| Sin telemetría ni red | gate de imports; ningún módulo importa http, https, net, dgram ni fetch |

## Lo que falta y no puedo hacer yo

- `npm publish`. De eso depende el hook de pre-commit `ia-linter-es`, que pide la versión publicada; el `-local` funciona sin ello.
- Cargar el plugin, que vive fuera del repositorio: `pnpm build` y `claude --plugin-dir ./integrations/claude-code`.

## Lo que costó dejar el CI en verde

La primera ejecución tras el push falló en los seis jobs por dos cosas, las dos arregladas:

- `pnpm/action-setup@v4` con `version: 10` y `packageManager: pnpm@10.33.2` en el `package.json` a la vez: `ERR_PNPM_BAD_PM_VERSION`. La versión sale ahora solo del `package.json`.
- `corpus-check` tenía la condición invertida para los textos de foro que no se redistribuyen: los contaba como ausentes y aun así intentaba leerlos. En local nunca se vio porque los textos están descargados; en CI no están, y ahí saltaba el `ENOENT`. Cada partición dice ahora cuántas muestras ha comprobado de verdad.

## Revisión final: lo que estaba mal y se arregló

- El hook pasaba la respuesta como texto plano. Las respuestas de Claude Code llevan bloques de código, y eso metía las líneas de comando en el recuento de frases y podía tomar un `--flag` por una raya de inciso. Ahora va con `--stdin-filename respuesta.md` y el AST de Markdown deja el código fuera. Hay un test con un mensaje que lleva un bloque `bash`.
- El hook de pre-commit con `language: node` no podía funcionar: pre-commit instala la raíz del repositorio, que es un workspace privado y sin `bin`. Lleva `additional_dependencies: ["ia-linter-es@1.0.0"]`, así que depende de que esa versión esté publicada. Mientras no lo esté, el que funciona es `ia-linter-es-local`.
- El tope de reintentos se guardaba con una clave sacada de `CLAUDE_SESSION_ID`, que no está documentada como variable del hook. Ahora usa `session_id`, que llega en el propio evento, así que dos sesiones a la vez no se pisan.
- El README de la Action decía que si no hay paquete instalado usa su bundle. El bundle es un artefacto del build y no está en el repositorio, así que eso solo vale en una release empaquetada. Ahora lo dice.
- «Con la red cortada» era falso: lo que hace `pack-check` es poner un proxy inválido, que Node ni siquiera respeta por defecto. La garantía real es el gate de imports, y así está escrito ahora en `SECURITY.md` y aquí.
- El README del paquete decía `scanProject`, que no existe. La función es `lintProject`.
- El README del plugin decía `/plugin install ./integrations/claude-code`, que es para marketplaces. Un plugin local se carga con `claude --plugin-dir`.
- `${CLAUDE_PLUGIN_ROOT}` está documentado para hooks, y ahí se queda. En el cuerpo de la skill y del comando, que los lee el modelo, se sustituyó por una referencia al directorio del plugin.
