# Plugin de Claude Code

Tres piezas, y se pueden usar por separado.

**El estilo de salida** (`output-styles/humano.md`) es lo que hace que Claude escriba en español como una persona en vez de como un folleto. Es la pieza principal.

**El comando `/revisar`** pasa el linter a un archivo o a un texto pegado y lo arregla.

**El hook** revisa cada respuesta antes de que la veas y, si huele a IA, se la devuelve a Claude para que la reescriba. Viene desactivado.

## Instalar

El plugin está en este directorio. Si lo tienes clonado:

```
/plugin install ./integrations/claude-code
```

Hace falta `pnpm build` antes, porque el plugin lleva una copia de la CLI en `bundle/` que se genera en el build. Si el proyecto donde trabajas ya tiene `ia-linter-es` instalado, se usa esa y el bundle no hace falta.

Después, el estilo de salida se elige con `/output-style humano`.

## El hook

Está apagado. Para encenderlo, en `.claude/settings.json` del proyecto o en `~/.claude/settings.json`:

```json
{
  "env": {
    "IA_LINTER_REVISAR": "1"
  }
}
```

Lo que hace: coge la última respuesta, la pasa por el linter con el perfil `chat` y, si encuentra algo de nivel warning o error, corta la salida y le dice a Claude qué reescribir. El texto del linter es lo que Claude lee.

Se puede ajustar con más variables:

| Variable | Por defecto | Qué hace |
|---|---|---|
| `IA_LINTER_REVISAR` | vacío | `1` lo enciende |
| `IA_LINTER_REVISAR_PERFIL` | `chat` | perfil con el que revisa |
| `IA_LINTER_REVISAR_NIVELES` | `error,warning` | niveles que cortan |
| `IA_LINTER_REVISAR_INTENTOS` | `2` | cuántas veces insiste antes de dejarlo pasar |
| `IA_LINTER_REVISAR_MIN_PALABRAS` | `40` | por debajo de esto no revisa |
| `IA_LINTER_CLI` | vacío | ruta a otra CLI |

El tope de intentos está para algo: si una respuesta no hay manera de que pase, a la tercera se enseña igual. Sin eso, una regla que el modelo no sepa satisfacer deja la sesión dando vueltas.

Cuesta unos 200 ms por respuesta y no sale a la red.

## Qué no hace

No hay un segundo motor. El comando, la skill y el hook llaman a la misma CLI, con la misma configuración y las mismas reglas del proyecto. Si `ia-linter.yml` desactiva una regla, aquí también está desactivada.
