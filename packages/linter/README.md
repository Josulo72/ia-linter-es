# TEXTOneitor

Revisor de textos en español que marca lo que suena a IA: muletillas de redacción, rayas de inciso a la inglesa, tríadas por costumbre, cierres de arenga, frases todas del mismo largo. Se ejecuta en tu ordenador, no usa IA y no sale a la red.

```
npm i -D textoneitor
npx textoneitor lint docs README.md
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
textoneitor lint [rutas...]        # --format terminal|json|sarif, --profile, --fail-on, --max-index, --stdin
textoneitor rules list             # --json, --status stable|candidate
textoneitor rules explain <id>     # qué mide, ejemplo, falsos positivos conocidos
textoneitor config validate        # comprueba textoneitor.yml
textoneitor config explain <archivo>
textoneitor baseline create        # congela lo que ya está escrito
textoneitor baseline update
```

## Perfiles

`chat`, `correo`, `readme`, `redes` para lo cotidiano; `general`, `tecnico`, `academico`, `marketing` para prosa editada. Cambian qué reglas están activas, porque una raya de inciso es normal en un artículo y rara en un mensaje.

## Configuración

`textoneitor.yml` en la raíz:

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
<!-- textoneitor-disable-next-line retorica/triada -->
```

## API

```js
import { lintText, lintFile, lintProject, loadConfig, loadRulePack } from "textoneitor";

const r = lintText(texto, { config: { profile: "chat" }, format: "text" });
console.log(r.score.index, r.findings.map((f) => f.rule));
```

## Lo demás

El código, la guía de estilo para escribir en español que no suene a IA, el informe del benchmark y los adaptadores de pre-commit, GitHub Actions y Claude Code están en https://github.com/Josulo72/textoneitor

Business Source License 1.1: puedes usarlo, también en tu empresa y para tus clientes, pero no venderlo ni montar un servicio de pago con él. El 17 de septiembre de 2030 pasa a AGPL-3.0. Textos completos en `LICENSE` y `LICENSE-AGPL-3.0`.
