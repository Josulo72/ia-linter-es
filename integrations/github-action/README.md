# GitHub Action

Pasa el linter a los textos del repositorio y deja los hallazgos anotados en el pull request, en la línea donde están.

## Uso

```yaml
name: Textos
on: [pull_request]

jobs:
  textoneitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm i -D textoneitor
      - uses: jrollon/textoneitor/integrations/github-action@v1
        with:
          paths: docs README.md
          profile: readme
```

El paso `npm i -D textoneitor` no sobra: la Action usa el `textoneitor` que tenga el proyecto, y así la versión del linter la fija tu `package.json`. La copia que lleva la Action dentro (`bundle/`) es un artefacto del build, no está en el repositorio, y solo existe si usas una release empaquetada. Si no hay ninguna de las dos, la Action falla diciéndotelo.

## Entradas

| Entrada | Por defecto | Qué hace |
|---|---|---|
| `paths` | el proyecto entero | archivos, directorios o globs separados por espacios |
| `config` | se busca `textoneitor.yml` | archivo de configuración |
| `profile` | el de la configuración | `general`, `tecnico`, `academico`, `marketing`, `chat`, `correo`, `readme`, `redes` |
| `fail-on` | el de la configuración | `never`, `info`, `warning`, `error` |
| `max-index` | — | falla si algún archivo pasa de ese índice |
| `baseline` | la de la configuración | baseline a aplicar |
| `annotations` | `true` | publica las anotaciones |
| `sarif` | — | ruta donde escribir el SARIF |
| `json` | — | ruta donde escribir el JSON |
| `working-directory` | `.` | desde dónde se ejecuta |

## Salidas

`findings`, `errors`, `warnings`, `max-index` y `passed`.

```yaml
      - uses: jrollon/textoneitor/integrations/github-action@v1
        id: linter
        with:
          fail-on: never
      - run: echo "Índice más alto: ${{ steps.linter.outputs.max-index }}"
```

## Con SARIF, para que salga en la pestaña de seguridad

```yaml
      - uses: jrollon/textoneitor/integrations/github-action@v1
        with:
          sarif: textoneitor.sarif
          fail-on: never
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: textoneitor.sarif
```

## Lo que no hace

No redefine reglas ni umbrales. Todo sale de `textoneitor.yml`, así que si una regla está desactivada en el proyecto, aquí también lo está. Y no sale a la red.
