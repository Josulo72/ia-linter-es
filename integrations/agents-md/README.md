# Para Codex y otros asistentes

`escribir-en-espanol.md` es la misma guía que usa el plugin de Claude Code, con una sección más al final que dice cómo pasar el linter después de escribir. Se pega en el `AGENTS.md` de tu proyecto, o se enlaza desde allí, y el asistente la tiene presente en todo lo que hace.

No es una skill ni hay que activarla. Vale para cualquier tarea, así que puedes seguir usando las skills o herramientas que quieras y lo que escriba el asistente pasa por la misma guía.

Lo que devuelve el linter es orientación. El asistente decide qué corrige y qué deja, y el linter no reescribe nada.

El archivo se genera a partir de la guía, así que no lo edites a mano. Si cambias la guía, vuelve a generarlo:

```
node integrations/agents-md/build.mjs
```

Si se te olvida, `pnpm gates` falla y te lo dice.
