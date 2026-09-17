# Seguridad

## Qué hace el programa con tus textos

Leerlos en tu ordenador y ya. No hay red, no hay telemetría y no hay ningún servicio detrás, y eso no es una promesa sino algo que se comprueba en cada build: `scripts/gates.mjs` falla si algún módulo importa `node:http`, `node:https`, `node:net`, `node:dgram` o `fetch`, y `scripts/pack-check.mjs` ejecuta el análisis con la red cortada para ver que el resultado sale idéntico. Los snippets del texto analizado solo aparecen en el informe si pides `--verbose` o el formato SARIF, así que en un CI compartido, si te preocupa que el texto acabe en un log, no los uses.

## Reglas y expresiones regulares

Las reglas son datos, no código: se declaran en YAML y las ejecutan siete detectores con nombre, así que ninguna regla puede ejecutar nada por su cuenta. El compilador rechaza en tiempo de build los patrones que puedan hacer explotar el tiempo de análisis, como los cuantificadores anidados, las alternancias con solapamiento y los retrocesos catastróficos, y además hay un gate de rendimiento sobre un texto adversarial de 1 MB. Si escribes tus propias reglas pasan por ese mismo compilador. Está contado en `docs/rule-authoring.md`.

## Si encuentras un fallo de seguridad

Escribe a jrollon@gmail.com contando qué has encontrado y cómo reproducirlo, y no abras un issue público hasta que esté arreglado. Respondo en lo que pueda. Esto es un proyecto de una persona: no hay acuerdo de plazos ni programa de recompensas.

## Lo que no es

El índice mide patrones de escritura. No identifica al autor de un texto, no detecta plagio y no vale como prueba de nada, y conviene tenerlo claro porque es el uso torcido más fácil de imaginar. Un texto escrito por una persona con prisa puede sacar un índice alto. Usarlo para acusar a alguien de haber usado IA es un mal uso, y no lo respalda ninguna medición de este repositorio.
