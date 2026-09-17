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
Decisión: los textos IA se generan con `claude-fable-5-1` durante el desarrollo, con prompt, parámetros y hash registrados.
Motivo: es la única generación disponible sin credenciales externas. Se documenta la circularidad como límite explícito del benchmark y no se presenta como evaluación independiente.

## 2026-09-17 — Huella de baseline
Decisión: `sha256(rule + "\0" + ruta relativa + "\0" + snippet normalizado + "\0" + ordinal)`. Sin líneas ni texto completo.
Motivo: estable ante reformateos y cambios de línea; el ordinal distingue repeticiones idénticas en el mismo archivo.
