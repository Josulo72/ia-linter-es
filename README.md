# TEXTOneitor

Dos cosas. Una guía de estilo para que la IA escriba en español como una persona normal, y un revisor que mira los textos que ya están escritos y te dice qué suena a máquina y por qué.

Todo pasa en tu ordenador. No usa IA, no sale a la red y no manda nada a ninguna parte.

```
npm i -D textoneitor-1.2.0.tgz
npx textoneitor lint docs README.md
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
npm i -D textoneitor-1.2.0.tgz
npx textoneitor lint README.md --profile readme
```

Vale igual con `pnpm add -D ./textoneitor-1.2.0.tgz` o `yarn add -D ./textoneitor-1.2.0.tgz`. Hace falta Node 20 o más.

Desde el código, si quieres tocarlo:

```
git clone https://github.com/Josulo72/textoneitor.git
cd textoneitor
pnpm install
pnpm build
node packages/linter/dist/cli/main.js lint README.md --profile readme
```

El plugin de Claude Code, con la guía, va en otro paquete de la misma release, `textoneitor-claude-code-1.2.0.zip`. Lo descomprimes donde quieras y lo cargas así:

```
claude --plugin-dir ./textoneitor-claude-code
```

La guía se carga sola al empezar cada sesión, así que puedes seguir usando el estilo de salida y las skills que quieras. Para Codex u otro asistente que lea `AGENTS.md`, está `integrations/agents-md/escribir-en-espanol.md`, que se pega ahí.

Las otras dos formas de engancharlo, pre-commit y GitHub Action, están explicadas en `integrations/pre-commit/README.md` y `integrations/github-action/README.md`. El hook de pre-commit pide la versión publicada en npm, así que hasta que se publique hay que apuntarlo al `.tgz`.

## La guía

Está en `integrations/claude-code/guia/humano.md` y es un archivo de texto: se lo puedes pegar a cualquier modelo. Si usas Claude Code, el plugin la carga al empezar la sesión y ya escribe así siempre, uses la skill que uses.

<!-- textoneitor-disable-next-line formato/comillas-angulares, lexico/honestidad-anunciada -->
Lo que consigue está medido: quita del todo las rayas de inciso, las comillas angulares, las negritas de titular, los «no es X, es Y» y los «para ser honesto». Lo que no consigue es arreglar el ritmo de las frases, y lo probamos de nueve maneras distintas. Por eso hay revisor.

## El revisor

38 reglas, 23 estables. Cada una con su explicación, su ejemplo, sus falsos positivos conocidos y de dónde sale la evidencia. `textoneitor rules explain <id>` te lo cuenta.

Hay ocho perfiles, porque no se escribe igual un mensaje que un contrato:

```
textoneitor lint --stdin --profile chat      # conversación
textoneitor lint mensaje.md --profile correo
textoneitor lint README.md --profile readme
```

Los otros son `redes`, `general`, `tecnico`, `academico` y `marketing`. Con `--profile auto` lo elige la ruta: un `README.md` va con `readme`, lo que está en `correos/` con `correo`, y lo que no encaja en ninguna situación no se analiza.

El índice va de 0 a 100 y mide patrones de escritura. **No dice quién ha escrito un texto.** Un texto humano descuidado puede sacar un índice alto y uno generado con cuidado puede sacar cero. Para acusar a nadie no sirve, y usarlo para eso está mal.

## Configuración

`textoneitor.yml` en la raíz del proyecto:

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

Con `textoneitor config explain <archivo>` ves qué nivel acaba teniendo cada regla y de dónde sale.

Si empiezas en un proyecto con mucho texto escrito, crea una baseline y el revisor solo te avisa de lo nuevo:

```
textoneitor baseline create --reason "texto anterior a la revisión"
```

Y para callar un caso concreto, en el propio archivo:

```markdown
<!-- textoneitor-disable-next-line retorica/triada -->
Rápido, sencillo y eficaz, que aquí es una cita literal.
```

## Dónde se engancha

- Pre-commit, en `integrations/pre-commit/README.md`
- GitHub Action, con anotaciones en el pull request y SARIF, en `integrations/github-action/README.md`
- Claude Code, con la guía cargada al empezar la sesión, el comando `/revisar` y dos hooks opcionales que revisan las respuestas y los archivos de texto y le devuelven la orientación a Claude, en `integrations/claude-code/README.md`

Las tres llaman a la misma CLI y dan exactamente los mismos hallazgos.

## De dónde sale esto

De un README que escribí con IA y que olía a IA aunque estuviera bien escrito. Las reglas no salen de una lista de manías: salen de comparar 36 mensajes de foros españoles reales con 96 textos generados sobre los mismos temas. La separación de medianas en el conjunto congelado es de 14,5 puntos.

El informe entero, con lo que funciona y lo que no, está en `benchmark/reports/v1.1.md`. El primer intento salió mal y también está publicado, en `v1.0.md`.

## Límites

- En los corpus v1.1 y v1.2 la clase IA la generó el mismo modelo que ayudó a escribir las reglas, y eso es circular. El v1.3 la tiene de otro proveedor (GPT-5.6 Sol) y da casi lo mismo, así que el problema está en las reglas y no en quién generó los textos.
- Toda la separación viene de una sola regla, la del ritmo, y esa regla es `candidate`. Quitándola, la mediana de los textos generados baja a cero, igual que la de los humanos. Si un modelo aprende a variar la longitud de sus frases, el índice deja de separar.
- Por registro, el índice separa en mensajes de foro y en redes, no separa en correos y en README marca más a los humanos que a los generados. Está medido en `benchmark/reports/v1.2.md` y en development v1.3. La precisión por regla sale de adjudicar 50 hallazgos con un solo adjudicador, así que es orientativa.
- Los mensajes de foro que forman la clase humana no se redistribuyen. En el repositorio está el manifiesto con la URL y el hash; los textos se bajan en local.
- Es español de España. En otras variedades marcará cosas que allí son normales.

## Documentación

`docs/rules.md` (las 38 reglas), `docs/configuration.md`, `docs/rule-authoring.md`, `docs/benchmark.md`, `docs/architecture.md` y `docs/decisions.md`.

## Licencia

Business Source License 1.1, con el texto completo en `LICENSE`.

En corto: puedes usarlo, copiarlo y cambiarlo a tu gusto, también en tu empresa y en el trabajo que hagas para tus clientes. Lo único que no puedes es venderlo, ni montar un servicio de pago cuyo valor sea básicamente esto. Para eso escríbeme a jrollon@gmail.com y lo hablamos.

El 17 de septiembre de 2030 pasa sola a AGPL-3.0, sin que nadie tenga que hacer nada. Desde entonces seguirá siendo libre, pero quien lo modifique o lo ofrezca como servicio tendrá que publicar su código. El texto está en `LICENSE-AGPL-3.0`.

La versión 1.0.0 se publicó con la vuelta a MIT, y esa versión la mantiene. Desde la 1.1.0 la vuelta es a AGPL-3.0.
