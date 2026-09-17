# Pre-commit

El hook no tiene lógica propia, llama a la misma CLI. La definición vive en `.pre-commit-hooks.yaml`, en la raíz del repositorio, que es donde la busca el framework.

## Cómo se usa

En el `.pre-commit-config.yaml` del proyecto:

```yaml
repos:
  - repo: https://github.com/jrollon/ia-linter-es
    rev: v1.0.0
    hooks:
      - id: ia-linter-es
```

Eso instala el paquete en el entorno de pre-commit y analiza los archivos del commit. Si prefieres que use la que ya tiene el proyecto en `node_modules`, y así no instalar nada aparte ni que se te descuadren las versiones entre lo que corre en tu máquina y lo que corre en el hook:

```yaml
repos:
  - repo: local
    hooks:
      - id: ia-linter-es-local
        name: ia-linter-es
        entry: node_modules/.bin/ia-linter-es lint
        language: system
        types_or: [markdown, plain-text]
```

## Opciones

Todo lo de la CLI vale aquí, en `args`:

```yaml
      - id: ia-linter-es
        args: [--profile, readme, --fail-on, error]
```

Los umbrales y las reglas salen de `ia-linter.yml`. El hook no los cambia.

## Qué archivos analiza

Por defecto, los Markdown y los de texto que entren en el commit. Para acotarlo tienes `files` y `exclude` en el `.pre-commit-config.yaml`, y la configuración del linter también tiene su propio `exclude`, así que se aplican las dos cosas.

## Si falla y quieres commitear igual

```
SKIP=ia-linter-es git commit -m "..."
```

O, si el proyecto ya tiene mucho texto escrito y no vas a repasarlo entero ahora, crea una baseline con lo que hay y deja el hook vigilando solo lo que escribas a partir de ahora:

```
ia-linter-es baseline create --reason "texto anterior a la revisión"
```
