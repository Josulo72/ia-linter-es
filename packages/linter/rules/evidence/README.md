# Evidencia de las reglas

La evidencia de cada regla es su fila en los informes del benchmark propio:

- `benchmark/reports/development-v1.0.json`: partición usada para diseñar y ajustar.
- `benchmark/reports/holdout-v1.0.json`: partición congelada, evaluada una sola vez por versión.

Cada fila recoge hallazgos por clase, documentos afectados, falsos positivos por mil palabras humanas, resultado por registro y tiempo. Ninguna regla usa datos de AuTexTification, IberAuTexTification ni derivados.
