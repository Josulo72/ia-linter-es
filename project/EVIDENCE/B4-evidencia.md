# B4 Evidencia y voz humana — evidencia (2026-09-17T18:39Z)

```
[2m Test Files [22m [1m[32m6 passed[39m[22m[90m (6)[39m
[2m      Tests [22m [1m[32m61 passed[39m[22m[90m (61)[39m
Corpus v1.1: manifiestos
  ✔ development: 42 muestras con licencia, trazabilidad y hash correctos
  ✔ holdout: 42 muestras con licencia, trazabilidad y hash correctos
  ✔ challenge: 48 muestras con licencia, trazabilidad y hash correctos
Corpus v1.1: congelación del holdout
  ✔ holdout congelado el 2026-09-17
Corpus v1.0 (archivo): manifiestos
  ✔ development: 42 muestras con licencia, trazabilidad y hash correctos
  ✔ holdout: 31 muestras con licencia, trazabilidad y hash correctos
  ✔ challenge: 14 muestras con licencia, trazabilidad y hash correctos
Corpus v1.0 (archivo): congelación del holdout
  ✔ holdout congelado el 2026-09-17
Corpus: veto
  ✔ 309 archivos sin referencias vetadas
Corpus en verde
Gate imports
  ✔ ningún módulo usa red; fs solo en runner/cli/config/baseline/compiler/api
Gate reglas
  ✔ 28 reglas stable (37 en el pack)
  ✔ 6 categorías distintas
  ✔ detectores usados: cooccurrence, density, lexicon, regex, repetition, sequence, structure
Gate rendimiento
  ✔ 10k palabras en 636 ms (límite 1500)
Gate benchmark
  ✔ separación de medianas del índice: 14.5 (mínimo 10)
  ✔ todas las reglas stable con FP/1000 <= 1.5
Todos los gates en verde

development v1.1       {"tp":14,"fp":7,"tn":11,"fn":10,"skipped_short":0} BA 0.597 medianas H/IA 5/12.5
holdout v1.1           {"tp":16,"fp":3,"tn":15,"fn":8,"skipped_short":0} BA 0.75 medianas H/IA 0/14.5
challenge v1.1         {"tp":35,"fp":0,"tn":0,"fn":13,"skipped_short":0} BA null medianas H/IA 0/15

Clase humana rehecha desde el manifiesto: 36 de 36 con el hash correcto.
```

Gates en verde, incluido el de benchmark (separación 14,5 ≥ 10). Informe: benchmark/reports/v1.1.md. El corpus y el informe v1.0, con su resultado negativo, siguen publicados.
