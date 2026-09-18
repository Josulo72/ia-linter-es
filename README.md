# ia-linter-es

Dos cosas. Una guía de estilo para que la IA escriba en español como una persona normal, y un linter que revisa los textos que ya están escritos y te dice qué suena a máquina y por qué.

Todo pasa en tu ordenador. No usa IA, no sale a la red y no manda nada a ninguna parte.

```
npm i -D ia-linter-es-1.0.0.tgz
npx ia-linter-es lint docs README.md
```

```
README.md  índice 34/100
  12:1     warning Muletilla de redacción generada: «En este artículo exploraremos».  lexico/muletillas-ia
  18:40    warning 4 rayas con espacios a ambos lados (uso inglés del em dash).  formato/raya-espaciada
  24:1     warning Cierre formulario: «En definitiva» al inicio del último párrafo.  estructura/cierre-formulario
```

## Instalación

Todavía no está en npm, así que se instala desde el paquete de la última release o desde el código.

Con el paquete, que es un `.tgz` normal de npm. Lo bajas de la pestaña Releases del repositorio y lo instalas en tu proyecto:

```
npm i -D ia-linter-es-1.0.0.tgz
npx ia-linter-es lint README.md --profile readme
```

Vale igual con `pnpm add -D ./ia-linter-es-1.0.0.tgz` o `yarn add -D ./ia-linter-es-1.0.0.tgz`. Hace falta Node 20 o más.

Desde el código, si quieres tocarlo:

```
git clone https://github.com/Josulo72/ia-linter-es.git
cd ia-linter-es
pnpm install
pnpm build
node packages/linter/dist/cli/main.js lint README.md --profile readme
```

La guía de estilo para Claude Code va en otro paquete de la misma release, `ia-linter-es-claude-code-1.0.0.zip`. Lo descomprimes donde quieras y lo cargas así:

```
claude --plugin-dir ./ia-linter-es-claude-code
```

Si solo quieres el estilo de escritura y no el resto del plugin, copia `output-styles/humano.md` a `~/.claude/output-styles/` y elígelo con `/output-style humano`.

Las otras dos formas de engancharlo, pre-commit y GitHub Action, están explicadas en `integrations/pre-commit/README.md` y `integrations/github-action/README.md`. El hook de pre-commit pide la versión publicada en npm, así que hasta que se publique hay que apuntarlo al `.tgz`.

## La guía

Está en `integrations/claude-code/output-styles/humano.md` y es un archivo de texto: se lo puedes pegar a cualquier modelo. Si usas Claude Code, se instala como estilo de salida y ya escribe así siempre.

<!-- ia-linter-disable-next-line formato/comillas-angulares, lexico/honestidad-anunciada -->
Lo que consigue está medido: quita del todo las rayas de inciso, las comillas angulares, las negritas de titular, los «no es X, es Y» y los «para ser honesto». Lo que no consigue es arreglar el ritmo de las frases, y lo probamos de nueve maneras distintas. Por eso hay linter.

## El linter

38 reglas, 23 estables. Cada una con su explicación, su ejemplo, sus falsos positivos conocidos y de dónde sale la evidencia. `ia-linter-es rules explain <id>` te lo cuenta.

Hay ocho perfiles, porque no se escribe igual un mensaje que un contrato:

```
ia-linter-es lint --stdin --profile chat      # conversación
ia-linter-es lint mensaje.md --profile correo
ia-linter-es lint README.md --profile readme
```

Los otros son `redes`, `general`, `tecnico`, `academico` y `marketing`.

El índice va de 0 a 100 y mide patrones de escritura. **No dice quién ha escrito un texto.** Un texto humano descuidado puede sacar un índice alto y uno generado con cuidado puede sacar cero. Para acusar a nadie no sirve, y usarlo para eso está mal.

## Configuración

`ia-linter.yml` en la raíz del proyecto:

```yaml
profile: readme
fail_on: warning
max_index: 40
exclude:
  - "CHANGELOG.md"
rules:
  formato/raya-espaciada: off
overrides:
  - files: ["blog/**"]
    rules:
      "lexico/*": info
```

Con `ia-linter-es config explain <archivo>` ves qué nivel acaba teniendo cada regla y de dónde sale.

Si empiezas en un proyecto con mucho texto escrito, crea una baseline y el linter solo te avisa de lo nuevo:

```
ia-linter-es baseline create --reason "texto anterior a la revisión"
```

Y para callar un caso concreto, en el propio archivo:

```markdown
<!-- ia-linter-disable-next-line retorica/triada -->
Rápido, sencillo y eficaz, que aquí es una cita literal.
```

## Dónde se engancha

- Pre-commit, en `integrations/pre-commit/README.md`
- GitHub Action, con anotaciones en el pull request y SARIF, en `integrations/github-action/README.md`
- Claude Code, con el estilo de salida, el comando `/revisar` y un hook opcional que revisa cada respuesta al terminarla y hace que Claude la reescriba, en `integrations/claude-code/README.md`

Las tres llaman a la misma CLI y dan exactamente los mismos hallazgos.

## De dónde sale esto

De un README que escribí con IA y que olía a IA aunque estuviera bien escrito. Las reglas no salen de una lista de manías: salen de comparar textos humanos reales con textos generados sobre los mismos temas.

Hay dos bancos de pruebas. El primero, v1.1, son 36 mensajes de foros españoles contra 96 textos generados, y ahí la separación de medianas en el conjunto congelado es de 14,5 puntos. El segundo, v1.2, mide los otros tres registros que tiene la guía con 90 textos humanos y 180 generados, y el resultado es mucho peor: bien en redes, y al revés de lo esperado en correo y en README. Tienes las cifras justo debajo.

Los informes enteros están en `benchmark/reports/v1.1.md` y `v1.2.md`, cada uno con su auditoría al lado. El primer intento de todos salió mal y también está publicado, en `v1.0.md`.

## Límites

- La clase IA la generó el mismo modelo que ayudó a escribir las reglas. Es circular y no lo escondo: no vale como evaluación independiente.
- Toda la separación viene de una sola regla, la del ritmo, y esa regla es `candidate`. Quitándola, la mediana de los textos generados baja a cero, igual que la de los humanos. Si un modelo aprende a variar la longitud de sus frases, el índice deja de separar.
- La clase humana del banco v1.2 está contaminada y sus cifras no valen. El filtro que debía dejar solo español de España aceptaba un texto con una sola marca peninsular, y en el registro `readme` esa marca era justo la palabra que la consulta de GitHub ya garantizaba, así que aprobaba por construcción todo lo que encontraba. El filtro estricto que aplica el proyecto a Reddit no se aplicaba ni a README, ni a correo, ni a los textos del fediverso. Tampoco había nada que descartara texto que no es prosa. Resultado: hay textos no peninsulares y textos que no son prosa dentro de la clase humana. El filtro está corregido y hay un script que dice cuáles se caen (`benchmark/scripts/auditar-corpus-humano.mjs`), pero hasta que el corpus se rehaga y se vuelva a medir, todo lo que dice el punto siguiente está en el aire.
- En correo y en README el índice puntúa más alto a los textos humanos que a los generados. Medido en el banco v1.2: la separación es de −9 en correo y −2 en README, con exactitud equilibrada de 0,367 y 0,412, o sea peor que tirar una moneda. Solo en redes sale bien, +18. La causa está localizada: los correos de una lista técnica y los README escriben frases de longitud parecida porque el género lo pide, y la regla del ritmo los marca por eso. Con esos dos perfiles, hoy, el índice no te sirve para separar nada. Las cifras y el porqué, en `benchmark/reports/v1.2.md`.
- Nueve de las 23 reglas estables no disparan en el corpus v1.2 y el gate de falsos positivos las aprueba por vacío. Y `repeticion/inicio-parrafo`, que sigue estable, marca 4 README humanos y ningún generado: su tasa de falsos positivos ahí es de 2,019 por mil palabras, por encima del máximo de 1,5 que pide `quality-policy.yml`. Está sin resolver.
- Solo está adjudicado development de v1.2, con un adjudicador y sobre el corpus contaminado del punto anterior. En el conjunto congelado sigue sin adjudicar: ahí está medido cuántas veces salta cada regla, no cuántas acierta.
- Los textos humanos no se redistribuyen. En el repositorio está el manifiesto con la URL, la fecha y el hash; los textos se bajan en local con el script de descarga.
- Es español de España. En otras variedades marcará cosas que allí son normales.

## Documentación

`docs/rules.md` (las 38 reglas), `docs/configuration.md`, `docs/rule-authoring.md`, `docs/benchmark.md`, `docs/architecture.md` y `docs/decisions.md`.

## Licencia

Business Source License 1.1, con el texto completo en `LICENSE`.

En corto: puedes usarlo, copiarlo y cambiarlo a tu gusto, también en tu empresa y en el trabajo que hagas para tus clientes. Lo único que no puedes es venderlo, ni montar un servicio de pago cuyo valor sea básicamente esto. Para eso escríbeme a jrollon@gmail.com y lo hablamos.

El 17 de septiembre de 2030 pasa a MIT sola, sin que nadie tenga que hacer nada. El texto de esa MIT está en `LICENSE-MIT`.
