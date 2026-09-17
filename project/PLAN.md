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
