# B5 Integraciones y B6 Cierre — evidencia (2026-09-17)

Ejecutado en Windows 10, Node 24.12, pnpm 10.33. macOS y Linux quedan cubiertos por el workflow de CI y su evidencia depende de la primera ejecución en GitHub, que es una acción del propietario.

## Gates

```
pnpm typecheck                     sin errores
pnpm test                          7 archivos, 75 tests
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

`packages/linter/test/integraciones.e2e.test.ts`, 14 tests en verde:

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
  ✓ un mensaje corto o vacío no se revisa
  ✓ entrada ilegible no bloquea nada
Pre-commit
  ✓ la definición está en la raíz y llama a la CLI sin lógica propia
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
  ✔ mismo resultado con la red cortada
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
| Motor offline y determinista | gate de imports, `pack-check` con la red cortada |
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
| E2E de todas las superficies | 75 tests |
| Paridad de resultados | byte a byte entre CLI, bundle y Action |
| Windows, macOS y Linux | Windows en local; los otros dos, en CI |
| Seguridad de patrones | compilador y gate de regex |
| Rendimiento aceptable | 10k palabras en 312 ms |
| Documentación | README, docs/, CHANGELOG, CONTRIBUTING, SECURITY |
| Paquete npm instalable | `pack-check` |
| Release reproducible | `pnpm build` regenera el Rule Pack y el bundle desde los YAML |
| Sin telemetría ni red | gate de imports y ejecución sin red |

## Lo que falta y no puedo hacer yo

- `git push` y la primera ejecución del CI en los tres sistemas.
- `npm publish`.
- Instalar el plugin en `~/.claude`, que está fuera del repositorio.
