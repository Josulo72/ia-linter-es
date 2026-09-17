# STATE

- **Último commit:** ver `git log -1` (B3 Producto local).
- **Terminado:** B1 Base, B2 Motor, B3 Producto local (CLI, API, reporters terminal/JSON/SARIF, runner con gitignore/caché/overrides/baseline, 30 reglas compiladas, 29 stable, 60 tests).
- **En curso:** B4 Evidencia.
- **Bloqueos:** ninguno. Pendientes del propietario al final: `npm publish`, `git push`, instalar el plugin de Claude Code.
- **Próxima acción exacta:** crear `corpus/policy/` (licencias, veto), descargar textos humanos de dominio público verificables, generar la clase IA con registro de prompt, escribir manifiestos con hash, `scripts/corpus-check.mjs`, congelar holdout, ejecutar `benchmark run` en development, calibrar, ejecutar holdout una vez y publicar `benchmark/reports/` y `docs/benchmark.md`.
- **Gates:** typecheck ✅, tests ✅ (60), build ✅, gates imports/reglas/rendimiento ✅, gate benchmark ⏳.
