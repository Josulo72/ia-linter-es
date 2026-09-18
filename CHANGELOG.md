# Cambios

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones, [SemVer](https://semver.org/lang/es/).

## No publicado

### Cambiado

- La licencia pasa de MIT a Business Source License 1.1, con fecha de cambio el 2030-09-17 y vuelta a MIT
  automática. El texto de la MIT se conserva en `LICENSE-MIT`. Afecta a quien integrara el proyecto
  bajo la licencia anterior.
- Tres reglas bajan de `stable` a `candidate` por no disparar en ninguna versión del corpus:
  `densidad/conectores`, `lexico/desde-hasta-pasando` y `lexico/metaforas-comodin`. Quedan 25 reglas
  estables. No cambia su nivel por defecto ni su perfil, así que el linter marca lo mismo que antes.
- El gate del índice lee el estado de cada regla del rulepack compilado y no de la foto que guardó el
  informe congelado. Las métricas del informe se siguen leyendo del informe, que para eso está congelado.

### Añadido

- Banco de pruebas v1.2 en `corpus-v1.2/`: 90 textos humanos de correo, README y redes, 30 por
  registro, más 180 generados. Descarga reejecutable con `benchmark/scripts/fetch-registros.mjs`,
  manifiestos con URL, fecha, licencia y hash, y holdout congelado. Los textos humanos no se
  redistribuyen. Informe en `benchmark/reports/v1.2.md`.

### Arreglado

- Las dos auditorías del banco pasaban `profile` suelto a `api.lintText`, que no tiene ese parámetro
  y lo ignoraba sin avisar: el análisis acababa cargando el `ia-linter.yml` del repositorio en vez de
  la configuración del registro. Corregido a `config: { profile }`. La cifra de v1.1 no cambia; la
  mediana humana de redes en v1.2 pasa de 12 a 0.

### Sin resolver

- La separación del índice sigue saliendo entera de `estructura/ritmo-plano`, que es `candidate`.
  Contando solo las reglas estables no separa en ningún registro.
- En correo y en README el índice puntúa más alto a los textos humanos que a los generados.
- `repeticion/inicio-parrafo` es `stable` y supera el máximo de falsos positivos de la política en el
  holdout de README (2,019 por mil palabras frente a 1,5). Pendiente de decidir si baja a `candidate`
  o se apaga en ese perfil.

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
