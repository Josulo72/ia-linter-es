# Evidencia de la fase 2 (B7 a B13)

Versión 1.1.0, cerrada el 2026-09-19. El plan y las decisiones están en `project/PLAN.md` y `docs/decisions.md`.

## Commits

| Bloque | Commit | Qué |
|---|---|---|
| B7 | `5daad1c` | Trabajo pendiente: opciones de la API, rutas de la CLI, gate de imports y holdout recalculado |
| Plan | `91f3baf` | Plan de la fase 2 y decisiones pendientes |
| B8 | `6bd0e6e` | D1: `ritmo-plano` fuera del perfil correo |
| B9 | `9eaab5e`, `a6be670` | `--annotations`, adjudicación ciega y estados de reglas por precisión |
| B10 | `7be8e29` | Reporter `revision` como orientación y decisión de humanización transversal |
| B11 | `b8fd55b` | Humanización como capa transversal |
| B12 | `2beb9c6` | Corpus v1.3 con clase IA de GPT-5.6 Sol y holdout v1.3 congelado sin ejecutar |
| B13 | el de este archivo | Versión 1.1.0, CHANGELOG, README y evidencia |

El CI pasó en Ubuntu, Windows y macOS con Node 20 y 22 en los tres push de la fase 2 (hasta B9, hasta B11 y B12).

## Gates del cierre

Ejecutados en Windows el 2026-09-19, con la versión 1.1.0:

```
pnpm typecheck        sin errores
pnpm build            Rule Pack: 38 reglas (23 stable); bundles copiados a github-action y claude-code
pnpm test             7 archivos, 93 tests en verde
pnpm gates            corpus en verde; imports, reglas (23 stable), rendimiento, benchmark, situaciones y agents-md en verde
pnpm lint:self        17 archivos, 0 error, 0 warning
pnpm pack:check       ia-linter-es-1.1.0.tgz instalado desde el tarball; mismas reglas y mismo JSON que en el repositorio
corpus-check          v1.3 (holdout congelado sin ejecutar), v1.2, v1.1 y v1.0 en verde
```

## Development antes y después

Medianas del índice humano / IA, textos por encima del umbral (12) y exactitud equilibrada. «Antes» es el estado del commit `40389c3`, anterior a la fase 2.

| Registro | Medición | Medianas | Humanos marcados | IA marcada | Exactitud equilibrada |
|---|---|---|---|---|---|
| correo | v1.2 antes | 12 / 17 | 9 de 15 | 9 de 15 | 0,50 |
| correo | v1.2 ahora | 0 / 0 | 1 de 15 | 1 de 15 | 0,50 |
| correo | v1.3 (GPT-5.6 Sol) | 0 / 0 | 1 de 15 | 2 de 15 | 0,533 |
| readme | v1.2 antes | 7,5 / 10 | 5 de 14 | 7 de 15 | 0,555 |
| readme | v1.2 ahora | 7,5 / 10 | 5 de 14 | 7 de 15 | 0,555 |
| readme | v1.3 (GPT-5.6 Sol) | 7,5 / 0 | 5 de 14 | 4 de 15 | 0,455 |
| redes | v1.2 antes | 8 / 18 | 7 de 15 | 15 de 15 | 0,767 |
| redes | v1.2 ahora | 8 / 18 | 7 de 15 | 15 de 15 | 0,767 |
| redes | v1.3 (GPT-5.6 Sol) | 8 / 20 | 7 de 15 | 13 de 15 | 0,70 |

Lo que dicen:

- En correo, apagar `ritmo-plano` y `comillas-angulares` quita casi todas las falsas alarmas sobre correos humanos (de 9 a 1), pero el índice sigue sin distinguir humano de generado. Antes tampoco lo hacía: marcaba igual a los dos grupos.
- En README nada de la fase 2 cambia las cifras de v1.2. Con la clase IA de GPT-5.6 Sol el índice marca más a los humanos que a los generados.
- En redes el índice separa, con la clase IA de Claude y con la de GPT-5.6 Sol.
- Cambiar de proveedor la clase IA (v1.3) apenas mueve el resultado. El límite está en las reglas, no en quién generó los textos.

## Pendiente del propietario

Release en GitHub con `ia-linter-es-1.1.0.tgz` y `ia-linter-es-claude-code-1.1.0.zip`, la etiqueta `v1.1.0` y `npm publish`. Hasta que se publique, el hook de pre-commit `ia-linter-es` (que pide `ia-linter-es@1.1.0`) no funciona, y el README explica cómo instalar desde el `.tgz`.
