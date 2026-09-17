# Autoría de reglas

Las reglas son YAML declarativo en `packages/linter/rules/definitions/`. El runtime no interpreta YAML: `pnpm build` las valida, las prueba y genera `rulepack/rulepack.json` y `docs/rules.md`. Ninguna regla contiene código ejecutable.

## Archivo

Nombre: `<categoria>--<nombre>.yml` para el id `<categoria>/<nombre>`. Esquema: `packages/linter/schemas/rule.schema.json`.

Campos obligatorios: `schema_version`, `id`, `revision`, `status`, `title`, `summary`, `category`, `scope`, `detector`, `conditions`, `default_level`, `score {weight, cap}`, `message`, `explanation`, `rewrite_guidance`, `examples {positive, negative}`, `provenance {evidence, known_false_positives, reviewed_by}`. Opcionales: `exceptions`, `profiles`.

Categorías: `lexico`, `estructura`, `repeticion`, `densidad`, `retorica`, `formato`.

## Detectores y `conditions`

| Detector | Condiciones |
|---|---|
| `regex` | `patterns[]`, `flags?`, `anchor?` (`block_start`, `block_end`, `first_block`, `last_block`), `kinds?` |
| `lexicon` | `lexicon` o `lexicons[]` o `terms[]`, `kinds?` |
| `sequence` | `steps[]` (cada paso con `lexicon`/`terms`), `max_gap` en palabras; dentro de una frase |
| `density` | términos, `window` (`block`, `document`), `unit` (`match`, `sentence`, `block_start`), `min_count`, `per_1000?`, `ratio?`, `min_words?`, `kinds?` |
| `repetition` | `unit` (`sentence_start`, `block_start`, `ngram`), `n`, `min_repeats`, `consecutive?` |
| `structure` | `kind`: `triad`, `heading_colon`, `heading_title_case`, `sentence_length_cv`, `list_bold_lead`, `list_uniform_start` y sus parámetros |
| `cooccurrence` | `groups[]`, `window` (`sentence`, `block`, `document`), `ordered?`, `anchor?` |

Términos de léxico: literal (límites de palabra Unicode, espacios flexibles), `re:` (expresión con límites de palabra) o `raw:` (expresión sin límites, para símbolos). Los léxicos viven en `rules/lexicons/*.yml`.

`exceptions.patterns[]` descarta una coincidencia cuando la excepción solapa con ella.

En `message` se interpolan `{term}`, `{count}`, `{per_1000}`, `{ratio}`, `{cv}` según el detector.

## Seguridad de patrones

El compilador rechaza: patrón vacío o que coincide con la cadena vacía, retroreferencias, `.*`, `.+`, clases negadas sin máximo, `{n,}`, máximos superiores a 200, cuantificadores anidados y patrones de más de 400 caracteres. Cada regla se ejecuta además sobre 1 MB de texto adversarial con el límite de tiempo de `quality-policy.yml`.

## Estados

`draft → candidate → stable → deprecated`. Una regla `stable` exige al menos dos ejemplos positivos y dos negativos, evidencia, falsos positivos conocidos, revisión y cumplir en el benchmark los límites de `quality-policy.yml` (falsos positivos por mil palabras humanas). Una regla `deprecated` no se ejecuta.

## Flujo

1. Escribe la regla como `candidate` con sus ejemplos.
2. `pnpm --filter ia-linter-es exec tsx scripts/compile-check.ts` para iterar rápido.
3. `pnpm build && pnpm test`.
4. `ia-linter-es benchmark run --corpus corpus --partition development` y revisa la fila de la regla.
5. Si cumple la política, pásala a `stable` y documenta los falsos positivos observados. No ajustes reglas mirando `holdout`.

Las fixtures largas opcionales van en `rules/fixtures/<categoria>--<nombre>.yml` con el mismo formato que `examples`.
