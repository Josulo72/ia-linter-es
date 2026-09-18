# Configuración

Un único archivo YAML por proyecto: `ia-linter.yml` (también `ia-linter.yaml`, `.ia-linter.yml`, `.ia-linter.yaml`). Se busca desde el directorio de trabajo hacia arriba. El directorio que lo contiene es la raíz del proyecto. Ejemplo completo en `examples/ia-linter.yml`.

## Claves

| Clave | Valor por defecto | Descripción |
|---|---|---|
| `schema_version` | `1` | Versión del formato. |
| `profile` | `general` | `general`, `tecnico`, `academico`, `marketing` (prosa editada) y `chat`, `correo`, `readme`, `redes` (escritura cotidiana por situación). Ajusta niveles de reglas. En la línea de órdenes también vale `--profile auto`, que elige el perfil por la ruta según `packages/linter/rules/situaciones.yml` (`README.md` → `readme`, `correos/…` → `correo`…); lo que no encaja en ninguna situación no se analiza, y los overrides de este archivo siguen mandando. |
| `register` | `general` | `general`, `tecnico`, `academico`, `marketing`, `literario`, `periodistico`, `institucional`. Silencia reglas impropias del género. |
| `include` | `**/*.md`, `**/*.markdown`, `**/*.txt` | Globs de archivos a analizar. |
| `exclude` | `node_modules`, `.git`, `dist`, `CHANGELOG.md`, `LICENSE*` | Globs excluidos. |
| `respect_gitignore` | `true` | Omite lo ignorado por `.gitignore` de la raíz. |
| `rules` | `{}` | Mapa `id` o `categoria/*` → `off`, `info`, `warning`, `error`. |
| `overrides` | `[]` | Lista de `{ files, rules?, profile? }` por ruta. |
| `baseline.path` | `null` | Archivo de baseline. |
| `baseline.require_reason` | `false` | Exige `--reason` al crear o ampliar la baseline. |
| `fail_on` | `warning` | Nivel mínimo que hace fallar: `never`, `info`, `warning`, `error`. |
| `max_index` | `null` | Falla si el índice de un archivo lo supera (0–100). |
| `privacy.snippets` | `true` | Si es `false`, los informes no contienen texto del documento. |
| `reporter` | `terminal` | `terminal`, `json`, `sarif` o `revision`. `revision` es orientación para quien reescribe: por cada regla, qué busca, la orientación (`rewrite_guidance`) y dónde está cada caso. Cada hallazgo se puede aceptar, ignorar o reinterpretar según el contexto. Lleva los hallazgos error y warning, y con `--verbose` también los info. Es lo que usan el hook y `/revisar` de Claude Code. |
| `cache.enabled` / `cache.dir` | `true` / `.ia-linter-cache` | Caché por contenido, configuración y Rule Pack. |
| `min_words_for_index` | `150` | Por debajo se muestran hallazgos pero no índice. |

## Precedencia

De menor a mayor:

1. Valores internos (nivel por defecto de cada regla).
2. Perfil (`profile`).
3. Registro (`register`).
4. Proyecto (`rules`, primero `categoria/*` y después el `id`).
5. Override por ruta (`overrides[].rules["categoria/*"]`).
6. Regla concreta dentro del override (`overrides[].rules["id"]`).
7. Supresión inline en el documento.

`ia-linter-es config explain <archivo>` muestra la configuración efectiva y el origen de cada nivel. `config validate` comprueba el archivo y que las reglas nombradas existan.

## Supresiones inline

Comentarios HTML, válidos en Markdown y en texto plano:

```markdown
<!-- ia-linter-disable-file lexico/muletillas-ia -->
<!-- ia-linter-disable-next-line retorica/triada -- motivo: cita literal -->
Texto. <!-- ia-linter-disable-line -->
<!-- ia-linter-disable lexico/* -->
…
<!-- ia-linter-enable -->
```

Sin lista de reglas se aplican a todas. Los hallazgos suprimidos aparecen en JSON y SARIF marcados como tales y no cuentan para el índice ni para la política.

## Baseline

```bash
ia-linter-es baseline create --reason "texto heredado"
ia-linter-es baseline update            # elimina entradas obsoletas
ia-linter-es baseline update --add-new  # además acepta los hallazgos actuales
```

La baseline guarda huellas (`sha256` de regla, ruta, fragmento normalizado y ordinal), nunca texto. Los hallazgos presentes en ella no fallan; los nuevos sí. `lint` informa de cuántas entradas han quedado obsoletas.

## Códigos de salida

`0` correcto · `1` la política falla · `2` error de uso o de configuración.

## Índice

El índice (0–100) mide densidad de patrones editoriales por cada mil palabras, con peso y tope por regla y rendimientos decrecientes por repetición. No es una probabilidad de autoría y no debe usarse como tal. Ver `docs/benchmark.md`.
