# ia-linter-es

Dos cosas. Una guía de estilo para que la IA escriba en español como una persona normal, y un linter que revisa los textos que ya están escritos y te dice qué suena a máquina y por qué.

Todo pasa en tu ordenador. No usa IA, no sale a la red y no manda nada a ninguna parte.

```
npm i -D ia-linter-es
npx ia-linter-es lint docs README.md
```

```
README.md  índice 34/100
  12:1     warning Muletilla de redacción generada: «En este artículo exploraremos».  lexico/muletillas-ia
  18:40    warning 4 rayas con espacios a ambos lados (uso inglés del em dash).  formato/raya-espaciada
  24:1     warning Cierre formulario: «En definitiva» al inicio del último párrafo.  estructura/cierre-formulario
```

## La guía

Está en `integrations/claude-code/output-styles/humano.md` y es un archivo de texto: se lo puedes pegar a cualquier modelo. Si usas Claude Code, se instala como estilo de salida y ya escribe así siempre.

<!-- ia-linter-disable-next-line formato/comillas-angulares, lexico/honestidad-anunciada -->
Lo que consigue está medido: quita del todo las rayas de inciso, las comillas angulares, las negritas de titular, los «no es X, es Y» y los «para ser honesto». Lo que no consigue es arreglar el ritmo de las frases, y lo probamos de nueve maneras distintas. Por eso hay linter.

## El linter

38 reglas, 28 estables. Cada una con su explicación, su ejemplo, sus falsos positivos conocidos y de dónde sale la evidencia. `ia-linter-es rules explain <id>` te lo cuenta.

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

De un README que escribí con IA y que olía a IA aunque estuviera bien escrito. Las reglas no salen de una lista de manías: salen de comparar 36 mensajes de foros españoles reales con 96 textos generados sobre los mismos temas. La separación de medianas en el conjunto congelado es de 14,5 puntos.

El informe entero, con lo que funciona y lo que no, está en `benchmark/reports/v1.1.md`. El primer intento salió mal y también está publicado, en `v1.0.md`.

## Límites

- La clase IA la generó el mismo modelo que ayudó a escribir las reglas. Es circular y no lo escondo: no vale como evaluación independiente.
- Casi toda la separación viene de una sola regla, la del ritmo. Si un modelo aprende a variar la longitud de sus frases, el índice se desinfla.
- Los mensajes de foro que forman la clase humana no se redistribuyen. En el repositorio está el manifiesto con la URL y el hash; los textos se bajan en local.
- Es español de España. En otras variedades marcará cosas que allí son normales.

## Documentación

`docs/rules.md` (las 38 reglas), `docs/configuration.md`, `docs/rule-authoring.md`, `docs/benchmark.md`, `docs/architecture.md` y `docs/decisions.md`.

## Licencia

MIT.
