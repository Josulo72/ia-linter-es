# Adjudicación ciega de `retorica/triada` — 2026-09-19

- Corpus: development v1.3; perfiles README y redes; holdout no ejecutado.
- Método: seis hallazgos mezclados con ids opacos, sin id de muestra, clase humano/IA ni estado de regla.
- Resultado previo: 2 correctos y 4 incorrectos.
- Falsos positivos: tres enumeraciones de infinitivos y una coincidencia parcial dentro de una lista de cuatro miembros.
- Corrección: la revisión 2 excluye infinitivos y coincidencias precedidas inmediatamente por otro miembro de lista.
- Resultado recalculado: permanecen los 2 correctos; los 4 incorrectos ya no aparecen. Uno de los correctos repite una muestra de v1.2.
- Evidencia total revisada: 8 hallazgos únicos entre v1.2 y v1.3. Evidencia vigente de la revisión 2: 2 hallazgos únicos correctos, todavía por debajo del mínimo 5.
- Validación: prueba focalizada 17/17; `pnpm gates` en verde; 23 reglas stable; holdout v1.3 intacto.