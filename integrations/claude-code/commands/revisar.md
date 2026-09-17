---
description: Pasa el linter a un archivo, a un texto pegado o a lo último que has escrito, y lo arregla.
argument-hint: "[archivo o nada]"
allowed-tools: Bash(node:*), Bash(ia-linter-es:*), Read, Edit
---

Revisa el español de $ARGUMENTS con `ia-linter-es` y arregla lo que marque.

Cómo hacerlo:

1. Si hay un archivo en los argumentos, analízalo:
   `ia-linter-es lint <archivo> --verbose`
   Si el proyecto no tiene el paquete instalado, el plugin trae su copia de la CLI en `bundle/dist/cli.mjs`, dentro del directorio del plugin. Llámala con `node` y la ruta completa de ese archivo.

2. Si no hay archivo, coge el texto que el usuario acaba de pegar o lo último que hayas escrito tú y pásalo por la entrada estándar con el perfil que toque:
   `ia-linter-es lint --stdin --profile chat --verbose`
   Los perfiles son `chat` para conversación, `correo`, `readme`, `redes`, y `general`, `tecnico`, `academico` o `marketing` para prosa editada.

3. Lee lo que marca. Para entender una regla concreta: `ia-linter-es rules explain <id>`.

4. Arregla el texto. Reescribe de verdad la parte señalada, no la maquilles. Si es un archivo, edítalo; si es un texto de la conversación, enseña la versión corregida.

5. Vuelve a pasar el linter para comprobar que ya no marca. Di qué has cambiado en una línea.

Si algún hallazgo te parece un falso positivo, dilo y déjalo como estaba. El índice mide patrones de escritura, no dice quién ha escrito el texto.
