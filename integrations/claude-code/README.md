# Plugin de Claude Code

Hace que Claude escriba en español como una persona y revisa lo que escribe, sin quitarte nada. Puedes usar la skill que quieras para la tarea y el estilo de salida que quieras: esto va por debajo y no ocupa ninguno de esos sitios.

Son tres piezas.

La guía (`guia/humano.md`) se carga sola al empezar cada sesión, con un hook `SessionStart`. Es la pieza principal: le dice a Claude cómo suena el español de una persona normal, en la conversación y en los archivos. Viene encendida.

Los hooks de revisión pasan el linter a lo que Claude acaba de escribir y, si ven señales de texto generado, le devuelven la orientación del linter. Uno mira cada respuesta al terminarla y el otro los archivos de texto que se escriben con `Write` o `Edit`, los escriba la skill que sea. Claude decide qué corrige y qué deja. Los hooks no reescriben nada. Vienen apagados.

El comando `/revisar` hace lo mismo cuando tú lo pides, con un archivo o con un texto pegado.

## Instalar

El plugin está en este directorio. Con el repositorio clonado, se carga apuntando ahí al arrancar:

```
pnpm build
claude --plugin-dir ./integrations/claude-code
```

El `pnpm build` importa: genera `bundle/`, que es la copia de la CLI que usa el plugin cuando el proyecto donde trabajas no tiene `ia-linter-es` en su `node_modules`. Si lo tiene, se usa esa y el bundle no hace falta.

## La guía

Se carga como contexto de la sesión, así que convive con cualquier estilo de salida. Si no la quieres, la apagas con `IA_LINTER_GUIA=0`.

## Los hooks de revisión

Están apagados. Para encenderlos, en `.claude/settings.json` del proyecto o en `~/.claude/settings.json`:

```json
{
  "env": {
    "IA_LINTER_REVISAR": "1",
    "IA_LINTER_REVISAR_ARCHIVOS": "1"
  }
}
```

El de respuestas coge la última respuesta, la pasa por el linter con el perfil `chat` y, si hay algo de nivel warning o error, no deja terminar el turno y le pasa a Claude la orientación (`--format revision`): por cada regla, qué busca, una orientación para reescribir y dónde está cada caso. La respuesta original ya la has visto, y debajo sale la revisada si Claude decide cambiar algo.

El de archivos hace lo mismo con cada archivo que se escribe, pero solo con los tipos de archivo de texto que están en `situaciones.yml` del linter: README, documentación, correos, publicaciones. El perfil sale de la ruta (`--profile auto`): un `README.md` se revisa como README y un `correos/respuesta.md` como correo. Un archivo de código o que no encaja en ninguna situación no se toca. Si tu `ia-linter.yml` tiene overrides por ruta, mandan ellos.

En los dos casos lo que llega es orientación, no órdenes. Un hallazgo se puede aceptar, ignorar o reinterpretar según el contexto, y Claude lo decide.

Se ajustan con estas variables:

| Variable | Por defecto | Qué hace |
|---|---|---|
| `IA_LINTER_REVISAR` | vacío | `1` enciende la revisión de respuestas |
| `IA_LINTER_REVISAR_ARCHIVOS` | vacío | `1` enciende la revisión de archivos |
| `IA_LINTER_REVISAR_PERFIL` | `chat` | perfil con el que se revisan las respuestas |
| `IA_LINTER_REVISAR_NIVELES` | `error,warning` | niveles que hacen que se devuelva |
| `IA_LINTER_REVISAR_INTENTOS` | `2` | cuántas veces insiste con lo mismo antes de dejarlo pasar |
| `IA_LINTER_REVISAR_MIN_PALABRAS` | `40` | por debajo de esto no revisa |
| `IA_LINTER_NIVEL` | `normal` | nivel de intervención; de momento solo existe `normal`, y cualquier otro valor se trata igual |
| `IA_LINTER_GUIA` | vacío | `0` apaga la guía |
| `IA_LINTER_CLI` | vacío | ruta a otra CLI |

El tope de intentos está para algo: si una respuesta o un archivo no hay manera de que pase, a la tercera se deja. Sin eso, una regla que el modelo no sepa satisfacer deja la sesión dando vueltas. En los archivos el tope cuenta por contenido, así que si el archivo cambia se revisa otra vez.

Cuesta unos 200 ms por revisión y no sale a la red.

## Qué no hace

No hay un segundo motor ni una segunda IA. El comando y los hooks llaman a la misma CLI, con la misma configuración y las mismas reglas del proyecto, y quien reescribe es el propio Claude. Si `ia-linter.yml` desactiva una regla, aquí también está desactivada.
