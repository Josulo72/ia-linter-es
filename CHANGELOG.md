# Cambios

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones, [SemVer](https://semver.org/lang/es/).

## No publicado

### Arreglado (corpus)

- El filtro de español de España del corpus v1.2 no filtraba. Aceptaba un texto con una sola marca
  peninsular; en el registro `readme` esa marca coincidía con la palabra que la consulta de GitHub ya
  garantizaba (`ordenador`, `fichero`, `instalación`), así que aprobaba por construcción todo lo que
  encontraba. El filtro estricto de habla peninsular solo se aplicaba a Reddit, no a README, correo ni
  fediverso. No había ningún filtro de prosa, así que podía entrar letra de canción o verso. Y `vale`
  contaba como marca peninsular, siendo el verbo valer.
- Corregido: filtro estricto en los tres registros, lista de americanismos ampliada con mexicanismos y
  depurada de términos que en España significan otra cosa, detección de texto que no es prosa, veto de
  instancias no peninsulares y de Pixelfed, y revalidación de lo ya registrado en cada `--append`.
- Nuevo `benchmark/scripts/auditar-corpus-humano.mjs`, que revisa la clase humana descargada con los
  filtros vigentes y dice qué textos no deberían estar. Solo lee.

### Sin resolver

- Las cifras del banco v1.2 se midieron sobre ese corpus y no valen mientras no se rehaga y se vuelva a
  medir. Afecta también al anexo D1 y a la adjudicación de B9.
- El corpus v1.3 reutiliza la clase humana de v1.2 tal cual (`reused_from` en sus manifiestos), así que
  hereda el mismo problema. Su holdout está congelado y todavía sin ejecutar, así que se puede limpiar
  antes de gastarlo.
- `repeticion/inicio-parrafo` es `stable` y supera el máximo de falsos positivos de la política en el
  holdout de README (2,019 por mil palabras frente a 1,5). Con `stable_min` en 23 y 23 reglas estables,
  degradarla deja el pack por debajo del mínimo; apagarla en el perfil `readme` es la salida razonable.

## [1.2.0] - 2026-09-20

### Cambiado

- El paquete se llama `textoneitor`. Con él cambian la orden del terminal, el archivo de configuración (`textoneitor.yml`), los comentarios para callar una regla (`<!-- textoneitor-disable -->`), la carpeta de caché y el nombre por defecto de la baseline.
- Sigue valiendo lo anterior: se leen igual `ia-linter.yml` y los comentarios `<!-- ia-linter-disable -->`, y `baseline update` usa `ia-linter-baseline.json` si es el archivo que hay. Un proyecto que ya lo use no tiene que tocar nada.
- El repositorio pasa a ser `github.com/Josulo72/textoneitor` y la web se publica en https://josulo72.github.io/textoneitor/

## [1.1.0] - 2026-09-19

La humanización pasa a ser una capa común que funciona con cualquier skill y cualquier estilo de salida, y el linter devuelve orientación para reescribir en vez de solo avisos. El linter sigue sin llevar IA dentro: la única IA es el asistente que reescribe.

### Añadido

- `--format revision`: por cada regla, qué busca, una orientación para reescribir y dónde está cada caso. Cada hallazgo se puede aceptar, ignorar o reinterpretar según el contexto.
- `--profile auto`: el perfil sale de la ruta según `rules/situaciones.yml` (un `README.md` va con `readme`, lo de `correos/` con `correo`). Lo que no encaja en ninguna situación no se analiza. Los overrides de `ia-linter.yml` siguen mandando.
- Plugin de Claude Code: la guía se carga al empezar la sesión con un hook `SessionStart`, y hay un hook `PostToolUse` para los archivos de texto que se escriben con `Write` o `Edit`. Viene apagado, igual que el de respuestas.
- `integrations/agents-md/`: la guía y la instrucción de revisar después de escribir, para pegarla en el `AGENTS.md` de Codex u otros asistentes.
- `benchmark run --annotations` para adjudicar un corpus concreto, y los scripts para adjudicar a ciegas (`dump-findings.mjs --ciego` y `aplicar-adjudicacion.mjs`).
- Corpus v1.3, con la clase IA generada por GPT-5.6 Sol y el holdout congelado sin ejecutar. Solo es para medir y no forma parte del producto.

### Cambiado

- La licencia del proyecto pasa de MIT a Business Source License 1.1. Afecta a quien lo integrara bajo la
  licencia anterior, y no constaba en ninguna versión de este archivo hasta ahora.
- La licencia de cambio de esa Business Source License pasa de MIT a AGPL-3.0, con la misma fecha, el 17 de
  septiembre de 2030. El texto está en `LICENSE-AGPL-3.0` y sustituye al de `LICENSE-MIT`, que se retira. La
  1.0.0 conserva la vuelta a MIT con la que se publicó.
- La guía está ahora en `integrations/claude-code/guia/humano.md` y ya no es un estilo de salida.
- `rules explain` y `docs/rules.md` llaman «Orientación» a la guía de reescritura de cada regla.
- `estructura/ritmo-plano` y `formato/comillas-angulares` dejan de estar activas en el perfil `correo`, donde marcaban igual a humanos y a generados.
- `retorica/pregunta-retorica-apertura` y `formato/encabezado-title-case` pasan a `candidate` después de adjudicar sus hallazgos: aciertan 4 de 12 y 2 de 7. Quedan 23 reglas estables y el mínimo de la política baja de 24 a 23.
- La API rechaza las opciones que no conoce, las rutas de la línea de órdenes se toman desde el directorio de trabajo y los errores de uso salen con código 2.

### Quitado

- La skill `escribir-en-espanol`, que competía con las skills de cada tarea.

## [1.0.0] - 2026-09-17

Primera versión.

### Motor

- Análisis determinista, en local, sin red y sin telemetría.
- Texto plano y Markdown por AST, con frontmatter y GFM.
- Siete detectores con nombre: regex, lexicon, density, repetition, cooccurrence, sequence y structure. Las reglas son datos y no ejecutan código.
- Compilador de reglas con comprobación de seguridad de las expresiones regulares y fixtures que corren en cada build.
- Índice de 0 a 100 por archivo, con pesos y topes por regla.
- Supresiones en línea, baseline y caché.

### Reglas

- 38 reglas, 28 estables en el momento de la publicación, en seis categorías. Cada una con explicación, ejemplo, guía de reescritura, falsos positivos conocidos y evidencia.
- Ocho perfiles: `general`, `tecnico`, `academico`, `marketing`, `chat`, `correo`, `readme` y `redes`.

### Producto

- CLI: `lint`, `rules list`, `rules explain`, `config validate`, `config explain`, `baseline create`, `baseline update`, `benchmark run`.
- API: `lintText`, `lintFile`, `lintProject`, `loadConfig`, `loadRulePack`.
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
- Plugin de Claude Code: estilo de salida, comando `/revisar`, skill y un hook opcional, apagado por defecto, que pasa el linter a cada respuesta al terminarla y hace que Claude la reescriba si huele a IA.
- Mismos hallazgos byte a byte en las tres superficies, comprobado en los tests.
