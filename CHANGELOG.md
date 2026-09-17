# Cambios

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones, [SemVer](https://semver.org/lang/es/).

## [1.0.0] — 2026-09-17

Primera versión.

### Motor

- Análisis determinista, en local, sin red y sin telemetría.
- Texto plano y Markdown por AST, con frontmatter y GFM.
- Siete detectores con nombre: regex, lexicon, density, repetition, cooccurrence, sequence y structure. Las reglas son datos y no ejecutan código.
- Compilador de reglas con comprobación de seguridad de las expresiones regulares y fixtures que corren en cada build.
- Índice de 0 a 100 por archivo, con pesos y topes por regla.
- Supresiones en línea, baseline y caché.

### Reglas

- 38 reglas, 28 estables, en seis categorías. Cada una con explicación, ejemplo, guía de reescritura, falsos positivos conocidos y evidencia.
- Ocho perfiles: `general`, `tecnico`, `academico`, `marketing`, `chat`, `correo`, `readme` y `redes`.

### Producto

- CLI: `lint`, `rules list`, `rules explain`, `config validate`, `config explain`, `baseline create`, `baseline update`, `benchmark run`.
- API: `lintText`, `lintFile`, `scanProject`, `loadConfig`, `loadRulePack`.
- Reporters de terminal, JSON y SARIF 2.1.0.

### Evidencia

- Corpus propio y trazable: 36 mensajes de foros españoles (manifiesto con URL y hash; los textos no se redistribuyen) y 96 textos generados con modelo, prompt y arnés registrados.
- Holdout congelado con su lock. Separación de medianas del índice: 14,5.
- Informes en `benchmark/reports/`. El primer intento, con prosa formal, salió negativo y se publica igual en `v1.0.md`.
- Veto automatizado de datasets prohibidos.

### Voz humana

- Guía de estilo en `integrations/claude-code/output-styles/humano.md`, que es la pieza principal: quita del todo los tics de formato de la escritura generada.
- Medido que la guía no arregla el ritmo de las frases, ni con receta numérica. Eso lo corrige el revisor.

### Integraciones

- Hook de pre-commit.
- GitHub Action con anotaciones, salidas, resumen de paso y SARIF.
- Plugin de Claude Code: estilo de salida, comando `/revisar`, skill y un hook opcional, apagado por defecto, que pasa el linter a las respuestas antes de enseñarlas.
- Mismos hallazgos byte a byte en las tres superficies, comprobado en los tests.
