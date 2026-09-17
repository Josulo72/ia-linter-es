---
name: escribir-en-espanol
description: Escribe o arregla textos en español que tienen que sonar a persona y no a IA. Úsala cuando haya que redactar un correo, un README, un mensaje, una publicación o un texto para otra persona, y cuando el usuario pegue un texto y pida quitarle el olor a IA, humanizarlo, hacerlo natural o revisarlo.
---

# Escribir en español que no suene a IA

Dos cosas distintas: escribir bien a la primera y arreglar lo que ya está escrito. La primera la hace la guía; la segunda, el linter.

## Si vas a escribir tú

<!-- ia-linter-disable-next-line formato/comillas-angulares, lexico/honestidad-anunciada -->
Lee `${CLAUDE_PLUGIN_ROOT}/output-styles/humano.md` y escribe con eso. Es la misma guía que el estilo de salida del plugin, y lo que hace bien es quitar: rayas de inciso, comillas angulares, negritas para abrir párrafo, «no es X, es Y», «para ser honesto», tríadas por costumbre. Eso se corrige solo con leerlo.

Lo que la guía no arregla es el ritmo, y está medido: las frases salen todas del mismo largo por más que se pida lo contrario. Eso lo pilla el linter, así que pásaselo al terminar.

## Si vas a arreglar un texto

```
ia-linter-es lint --stdin --profile chat --verbose
```

o, si el proyecto no tiene el paquete instalado:

```
node "${CLAUDE_PLUGIN_ROOT}/bundle/dist/cli.mjs" lint --stdin --profile chat --verbose
```

El perfil manda, porque no es lo mismo un mensaje que un contrato:

| Perfil | Para qué |
|---|---|
| `chat` | conversación, mensajes |
| `correo` | correos |
| `readme` | README y documentación de un proyecto |
| `redes` | publicaciones cortas |
| `general`, `tecnico`, `academico`, `marketing` | prosa editada |

Para saber qué pide una regla: `ia-linter-es rules explain <id>`. Cada una trae un ejemplo y sus falsos positivos conocidos.

## Al reescribir

Cambia la frase entera, no le des la vuelta a las palabras. Si el linter marca ritmo plano, alguna frase tiene que quedarse en tres o cuatro palabras y otra tiene que seguir hasta donde tenga que llegar; lo que no vale es ir alternando larga y corta, que es el defecto contrario y también está marcado.

El índice va de 0 a 100 y mide patrones de escritura. No dice quién ha escrito el texto y no sirve para acusar a nadie.
