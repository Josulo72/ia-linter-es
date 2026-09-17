# Cómo contribuir

## Para empezar

```
pnpm install
pnpm build
pnpm test
pnpm gates
```

Hace falta Node 20 o más y pnpm 10. El build compila TypeScript, genera el Rule Pack desde los YAML y hace el bundle que usan la Action y el plugin de Claude Code.

## Antes de mandar nada

```
pnpm typecheck && pnpm test && pnpm build && pnpm gates && node scripts/pack-check.mjs
```

Los gates comprueban que ningún módulo usa la red, que las expresiones regulares no explotan, que el rendimiento aguanta, que el corpus tiene sus licencias y sus hashes y que la separación del benchmark no baja del mínimo. Si un gate falla, se arregla la causa; bajar el umbral no es una opción.

## Añadir una regla

Está explicado en `docs/rule-authoring.md`. En resumen: un YAML en `packages/linter/rules/definitions/` con sus ejemplos positivos y negativos, que se ejecutan como fixtures en cada build.

Lo que se pide de cada regla:

- Que salga de algo observado, no de una manía. En `provenance.evidence` va de dónde sale.
- Que traiga sus falsos positivos conocidos escritos.
- Que nazca como `candidate`. A `stable` se pasa cuando el benchmark enseña que no marca de más en textos humanos (menos de 1,5 falsos positivos por mil palabras).
- Que el mensaje diga qué pasa, no que regañe.

Las reglas son datos. Si una necesita código nuevo, es que falta un detector, y eso es una discusión aparte.

## Corpus

Los textos humanos tienen que ser de dominio público o CC-BY-4.0 verificable, o no redistribuirse y quedar solo como manifiesto con URL y hash. Los textos generados se registran con modelo, prompt, fecha y arnés. `node scripts/corpus-check.mjs` lo comprueba todo.

No se aceptan datasets de la lista de veto (`quality-policy.yml`).

## Estilo

El español del proyecto es el de `integrations/claude-code/output-styles/humano.md`, y el README pasa su propio linter. Si escribes documentación, pásasela:

```
node packages/linter/dist/cli/main.js lint docs README.md --profile readme
```

El código va comentado solo donde hace falta explicar por qué, no qué.

## Commits

Uno por cambio con sentido. El asunto dice qué cambia, no qué archivos se tocan.
