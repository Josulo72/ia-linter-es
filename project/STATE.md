# STATE

- **Último commit:** ver `git log -1`.
- **Terminado:** B1 Base, B2 Motor, B3 Producto local (CLI, API, reporters terminal/JSON/SARIF, runner con gitignore/caché/overrides/baseline, 30 reglas compiladas, 29 stable, 60 tests, gates imports/reglas/rendimiento en verde).
- **En curso:** B4 Evidencia (parada a petición del propietario el 2026-09-17).
  - Hecho: `corpus/policy/prompts.yml` (42 prompts) y 42 textos IA en bruto en `corpus/quarantine/ai-raw/` (14 haiku-4.5, 14 sonnet-5, 14 opus-5). Ediciones a registrar: sonnet reescribió una vez `ai-d14`, `ai-h11`, `ai-c05` por longitud; `ai-h04` supera 600 palabras.
  - Fuentes humanas comprobadas y accesibles: BOE XML (`boe.es/diario_boe/xml.php?id=…`, dominio público art. 13 TRLPI, institucional), SINC (CC BY 4.0, `datePublished` en JSON-LD, cuerpo en `div.ezxmltext-field`; URLs antiguas vía Wayback CDX, las de 2019 responden en vivo), REDC-CSIC (CC BY 4.0 en la página del artículo, galerada HTML en `article/download/<id>/<galley>?inline=1`, números 105–108 de 2019), Gutenberg (texto plano accesible; `gutendex.com` devuelve 403 desde Python sin User-Agent: reintentar con cabecera o usar `gutenberg.org/ebooks/<id>.rdf` para verificar autor y fecha de muerte).
- **Bloqueos:** ninguno técnico. Pendientes del propietario al final: `npm publish`, `git push`, instalar el plugin de Claude Code.
- **Próxima acción exacta:**
  1. Escribir `corpus/policy/sources.yml` (allowlist por registro: ~12 BOE pre-2022, ~14 SINC 2019, ~10 REDC 2019, ~8 Gutenberg para challenge), `corpus/policy/licenses.yml` y `corpus/policy/veto.yml`.
  2. Escribir `benchmark/scripts/fetch-human.mjs` (descarga, verifica licencia/fecha por registro, extrae 350–600 palabras, escribe `.txt` y entradas de manifiesto con sha256; lo rechazado va a `corpus/quarantine/` con motivo).
  3. Escribir `benchmark/scripts/build-manifests.mjs` (mueve IA de `quarantine/ai-raw` a `development|holdout|challenge` según `prompts.yml`, deduplica, genera `corpus/manifests/*.yml`) y `scripts/corpus-check.mjs` (licencias, hashes, veto por nombre).
  4. Congelar holdout (hash del manifiesto en `benchmark/configs/holdout.lock`), ejecutar `benchmark run` en development, calibrar pesos/umbral, ejecutar holdout una sola vez, publicar `benchmark/reports/*` y `docs/benchmark.md` con la circularidad y el revisor único como límites.
  5. Después: B5 Integraciones, B6 Cierre (ver `project/WORK.yml`).
- **Gates:** typecheck ✅, tests ✅ (60), build ✅, imports/reglas/rendimiento ✅, benchmark ⏳.
