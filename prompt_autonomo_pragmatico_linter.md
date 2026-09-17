# Prompt autónomo de ejecución

```text
Ejecuta el proyecto según `docs/architecture.md`, `AGENTS.md` y `quality-policy.yml`. El objetivo es la v1.0 completa definida allí, sin MVP, demo ni ampliación de alcance. No pidas aclaraciones: ante ambigüedad elige la opción más simple, conservadora y reversible que respete la arquitectura, y regístrala en `docs/decisions.md`.

Primero audita el repositorio y corrige `project/PLAN.md`, `project/WORK.yml` y `project/STATE.md`. Después trabaja un solo bloque end-to-end cada vez: implementación, pruebas, documentación y evidencia. No crees paquetes, capas, protocolos o abstracciones sin necesidad inmediata; no dupliques motor, reglas, scoring ni configuración. No uses AuTexTification, IberAuTexTification ni derivados.

Ejecuta los gates aplicables y corrige los fallos antes de avanzar. No desactives pruebas, no rebajes criterios y no declares terminado sin E2E y evidencia. Si falta una credencial o acción externa, deja preparado el trabajo, registra el bloqueo y continúa con la siguiente tarea no bloqueada. Al cerrar cada sesión actualiza el estado real, los resultados y la próxima acción exacta. Detente cuando se cumplan los criterios de v1.0; no añadas mejoras fuera de alcance.
```
