# ia-linter-es

Linter de textos en español que marca lo que suena a IA: muletillas de redacción, rayas de inciso a la inglesa, tríadas por costumbre, cierres de arenga, frases todas del mismo largo. Se ejecuta en tu ordenador, no usa IA y no sale a la red.

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

El índice va de 0 a 100 y mide patrones de escritura. No dice quién ha escrito un texto y no sirve para acusar a nadie.

## Comandos

```
ia-linter-es lint [rutas...]        # --format terminal|json|sarif, --profile, --fail-on, --max-index, --stdin
ia-linter-es rules list             # --json, --status stable|candidate
ia-linter-es rules explain <id>     # qué mide, ejemplo, falsos positivos conocidos
ia-linter-es config validate        # comprueba ia-linter.yml
ia-linter-es config explain <archivo>
ia-linter-es baseline create        # congela lo que ya está escrito
ia-linter-es baseline update
```

## Perfiles

`chat`, `correo`, `readme`, `redes` para lo cotidiano; `general`, `tecnico`, `academico`, `marketing` para prosa editada. Cambian qué reglas están activas, porque una raya de inciso es normal en un artículo y rara en un mensaje.

## Configuración

`ia-linter.yml` en la raíz:

```yaml
profile: readme
fail_on: warning
max_index: 40
rules:
  formato/raya-espaciada: off
overrides:
  - files: ["blog/**"]
    rules:
      "lexico/*": info
```

Supresiones en el propio texto:

```markdown
<!-- ia-linter-disable-next-line retorica/triada -->
```

## API

```js
import { lintText, lintFile, lintProject, loadConfig, loadRulePack } from "ia-linter-es";

const r = lintText(texto, { profile: "chat", format: "text" });
console.log(r.score.index, r.findings.map((f) => f.rule));
```

## Lo demás

El código, la guía de estilo para escribir en español que no suene a IA, el informe del benchmark y los adaptadores de pre-commit, GitHub Actions y Claude Code están en https://github.com/jrollon/ia-linter-es

MIT.
