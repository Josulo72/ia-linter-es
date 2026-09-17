# STATE

- **Último commit:** ver `git log -1`.
- **Terminado:** B1 Base, B2 Motor, B3 Producto local, **B4 Evidencia y voz humana** (gates en verde).
- **Giro del producto (2026-09-17):** ya no se busca un detector. El objetivo es que la IA hable y escriba como una persona normal, integrado en el asistente, y que además arregle textos que ya huelen a IA. La referencia es el español cotidiano por situación, no el formal. Ver `docs/decisions.md`.
- **Lo que hay:**
  - **Guía de estilo** en `integrations/claude-code/output-styles/humano.md`. Es la pieza principal; el linter es el revisor.
  - **Corpus v1.1** (cotidiano): 36 mensajes de foro (Mediavida, elhacker.net, Infojardín; 2009-2021, no se redistribuyen, solo local) y 96 textos IA (48 base y 48 con la guía). Particiones 18+24, 18+24 y 0+48.
  - **Corpus v1.0** archivado en `corpus/archive/v1.0` con sus manifiestos y su lock; `corpus-check` comprueba los dos.
  - **Reglas nuevas** (8, todas `candidate`): `estructura/ritmo-plano`, `estructura/ritmo-metronomo`, `retorica/no-es-x-es-y`, `formato/sentencia-dos-puntos`, `formato/raya`, `formato/comillas-angulares`, `formato/negrita-abre-parrafo`, `lexico/honestidad-anunciada`.
  - **Perfiles nuevos**: `chat`, `correo`, `readme` y `redes`, junto a los cuatro que ya había. `benchmark run` acepta `--profile`.
  - **Resultado**: holdout v1.1 con medianas 0 (humano) y 14,5 (IA), separación 14,5 ≥ 10, exactitud equilibrada 0,75. Informe en `benchmark/reports/v1.1.md`; el negativo de v1.0 sigue publicado en `v1.0.md`.
  - **Caso real**: el README de Josulo72/cazafacturas, reescrito con esta voz y subido a ese repositorio (commit 28074a6).
- **Lo que hay que saber antes de seguir:**
  - Casi toda la separación viene de una sola regla, `estructura/ritmo-plano` (variación de longitud de frase). Si un modelo aprende a variar el ritmo, el índice vuelve a cero.
  - **El ritmo no se arregla con la guía.** Se probaron cuatro versiones de la guía y nueve redacciones de la instrucción, ocho textos cada una: ninguna acerca el texto al humano más que no decir nada. La instrucción con números lo sobrecorrige y saca el defecto contrario (de ahí `estructura/ritmo-metronomo`). Decisión tomada: lo corrige el revisor. Ver `docs/decisions.md` y `benchmark/reports/v1.1.md`.
  - Las tandas de experimento (`corpus/challenge-v2`, `-v3`, `-v4` y `corpus/ritmo`, 144 textos) están registradas en `corpus/manifests/experimentos.yml` y las comprueba `corpus-check`. No entran en el benchmark.
  - El holdout v1.1 ya se ha ejecutado: no vale como evaluación independiente de una v1.2 de reglas.
- **Bloqueos:** ninguno técnico. Pendientes del propietario: `npm publish`, `git push`, instalar el plugin de Claude Code, y dar permiso para copiar la guía a `~/.claude/output-styles/` (está fuera del repositorio).
- **Próxima acción exacta:**
  1. B5 Integraciones: pre-commit, GitHub Action, plugin de Claude Code (estilo de salida, comando y hook que revisa las respuestas antes de enseñarlas) y test de paridad entre las tres superficies.
  2. B6 Cierre.
- **Gates:** typecheck ✅, tests ✅ (61), build ✅, imports/reglas/rendimiento ✅, corpus ✅, benchmark ✅ (separación 14,5 ≥ 10; FP/1000 de reglas stable ✅).
