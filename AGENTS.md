# AGENTS.md — reglas para la IA ejecutora

Fuente de verdad: `docs/architecture.md`. Este archivo resume lo operativo.

## Principios innegociables
1. Un solo motor, una sola definición de reglas (YAML en `packages/linter/rules/definitions`), una sola fórmula de puntuación (`src/scoring`), una sola configuración (`src/config`).
2. El análisis no usa red, LLM ni GPU. Ningún módulo de `src/` importa `http`, `https`, `net`, `dns`, `child_process` ni `worker_threads`. Solo `runner/`, `cli/`, `config/`, `baseline/` y `rules/compiler/` pueden importar `fs`.
3. El runtime (`src/rules/runtime`) no lee archivos, no imprime y no conoce integraciones.
4. Las integraciones (`integrations/`) son adaptadores finos sobre la CLI o la API. No contienen reglas ni umbrales.
5. Determinismo: mismo texto + mismo Rule Pack + misma configuración = mismo resultado, byte a byte en JSON.
6. El índice se llama «índice de patrones editoriales». Nunca «probabilidad de IA».
7. Ninguna regla se ejecuta como código. Los detectores admitidos son los siete de la arquitectura.
8. Prohibido usar AuTexTification, IberAuTexTification, forks, conversiones o derivados en reglas, calibración, ejemplos o benchmark. El veto se comprueba en `corpus/policy/veto.yml` mediante `scripts/corpus-check.mjs`.

## Método
- Un bloque principal en curso (`project/WORK.yml`). No se abre el siguiente hasta que el actual funciona, tiene tests, está documentado, pasa gates y deja evidencia en `project/EVIDENCE/`.
- Ante ambigüedad: opción más simple, conservadora y reversible; registrar en `docs/decisions.md` solo si es difícil de revertir.
- No crear paquetes, capas ni abstracciones sin consumidor real. No ampliar alcance.
- Una tarea no está terminada sin prueba ejecutada y salida vista.

## Gates (ver `quality-policy.yml`)
`pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm gates`. Los umbrales viven en `quality-policy.yml`; rebajarlos exige una entrada en `docs/decisions.md`.

## Prohibiciones
Desactivar pruebas, rebajar umbrales sin decisión registrada, regenerar snapshots sin revisión, ocultar regresiones, declarar completo un adaptador sin E2E, crear stubs que cuenten como avance final, publicar en npm o hacer push sin permiso explícito del propietario.

## Cierre de sesión
Actualizar `project/STATE.md` con: último commit, terminado, en curso, bloqueos, próxima acción exacta, estado de gates.
