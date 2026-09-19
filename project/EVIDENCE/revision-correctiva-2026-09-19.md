# Revisión correctiva 2026-09-19

## Cambios

- El gate agrega la precisión adjudicada de los tres informes development v1.2.
- Umbral aplicado: precisión mínima 0,70 con cinco adjudicaciones o más.
- Las reglas de longitud global quedan declaradas como no adjudicables por fragmento.
- Vitest usa threads, un worker y ejecución secuencial de archivos para evitar el timeout RPC reproducido en Node 24.12.0.
- La matriz de CI incluye Node 20, 22 y 24; el job de Node 24 se ejecutará en el siguiente push.
- Se añadieron cuatro tests unitarios para el gate.

## Evidencia

- `pnpm test`: 4 tests del gate y 93 tests del linter, todos correctos.
- `pnpm typecheck`: correcto.
- `pnpm build`: correcto; 38 reglas, 23 stable.
- `pnpm gates`: correcto; corpus, imports, reglas, rendimiento, benchmark, situaciones y agents-md.
- Rendimiento: 10.000 palabras en 369 ms, límite 1.500 ms.
- `pnpm lint:self`: correcto; 0 errores y 0 warnings.
- `pnpm pack:check`: correcto; tarball de 65 archivos, instalación limpia, JSON idéntico y funcionamiento offline.
