# Arquitectura pragmática de producción

**Proyecto:** Linter determinista de patrones de escritura de IA en español  
**Objetivo:** producto v1.0 completo, útil y publicable, sin convertir el desarrollo en una arquitectura innecesariamente grande  
**Criterio:** terminar con calidad mediante una línea de trabajo continua, alcance cerrado y una sola implementación

---

# 1. Decisión principal

La arquitectura anterior se sustituye por esta versión reducida.

El producto seguirá siendo serio y completo, pero se eliminan capas, paquetes y procesos que no aportan valor directo a la primera versión estable.

La regla general es:

> Cada pieza debe justificar su existencia por una necesidad real de la v1.0. Si puede resolverse dentro del núcleo sin duplicación ni acoplamiento grave, no se crea otro paquete.

No se construirá un MVP ni una demostración. Se construirá una **v1.0 acotada**, con todas las funciones necesarias para utilizarla de verdad.

---

# 2. Alcance cerrado de la v1.0

## 2.1 Incluido

- Motor determinista offline.
- Texto plano y Markdown.
- Reglas declarativas en YAML.
- Compilación de reglas antes de publicar.
- Entre 24 y 30 reglas estables, repartidas entre categorías distintas.
- CLI.
- API programática desde el mismo paquete.
- Configuración por proyecto.
- Perfiles general, técnico, académico y marketing.
- Supresiones en Markdown.
- Baseline.
- Reporters de terminal, JSON y SARIF.
- Hook de pre-commit.
- GitHub Action.
- Plugin para Claude Code.
- Corpus propio y benchmark reproducible.
- Tests unitarios, integración y end-to-end.
- Compatibilidad con Windows, macOS y Linux.
- Publicación npm.
- Documentación de uso y contribución.

## 2.2 Excluido de la v1.0

- Dashboard alojado.
- Servidor MCP.
- HTML, MDX, DOCX y PDF como formatos de entrada.
- Marketplace de reglas externas.
- Reglas ejecutables en JavaScript.
- Auto-fix.
- Reescritura con IA.
- Telemetría.
- Binarios nativos.
- Paquete Python.
- Sistema de plugins genérico.
- Microservicios.
- Base de datos.
- Cuentas de usuario.
- Infraestructura en la nube.

Estas exclusiones son una decisión de alcance, no una carencia temporal del producto principal.

---

# 3. Principios obligatorios

1. Una sola implementación del motor.
2. Una sola definición de las reglas.
3. Una sola fórmula de puntuación.
4. Las integraciones son adaptadores finos.
5. El análisis no usa red, LLM ni GPU.
6. El resultado es determinista.
7. El índice mide patrones editoriales, no autoría.
8. Las reglas oficiales se compilan durante el build.
9. No se ejecuta código incluido en una regla.
10. No se añade una capa por previsión hipotética.
11. Una tarea no está terminada sin prueba y evidencia.
12. El alcance no crece durante la ejecución salvo defecto crítico.

---

# 4. Arquitectura general

```text
                  AUTORÍA

     reglas YAML + léxicos + fixtures
                      │
                      ▼
            validación y compilación
                      │
                      ▼
            Rule Pack oficial compilado


                  EJECUCIÓN

 texto / Markdown / archivo / proyecto
                      │
                      ▼
              modelo documental
                      │
                      ▼
                motor de reglas
                      │
                      ▼
       supresiones + baseline + scoring
                      │
                      ▼
               resultado común
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
      terminal       JSON         SARIF
         │
         ▼
 CLI / pre-commit / Action / Claude Code
```

No se crea un motor distinto para ninguna integración.

---

# 5. Estructura del repositorio

```text
/
├── packages/
│   └── linter/
│       ├── src/
│       │   ├── contracts/
│       │   ├── document/
│       │   ├── markdown/
│       │   ├── rules/
│       │   │   ├── compiler/
│       │   │   ├── detectors/
│       │   │   └── runtime/
│       │   ├── scoring/
│       │   ├── suppressions/
│       │   ├── baseline/
│       │   ├── config/
│       │   ├── runner/
│       │   ├── reporters/
│       │   ├── api/
│       │   └── cli/
│       ├── rules/
│       │   ├── definitions/
│       │   ├── lexicons/
│       │   ├── profiles/
│       │   ├── fixtures/
│       │   ├── evidence/
│       │   └── manifest.yml
│       └── test/
│
├── integrations/
│   ├── github-action/
│   ├── claude-code/
│   └── pre-commit/
│
├── corpus/
│   ├── policy/
│   ├── manifests/
│   ├── development/
│   ├── holdout/
│   ├── challenge/
│   └── quarantine/
│
├── benchmark/
│   ├── annotations/
│   ├── configs/
│   ├── reports/
│   └── scripts/
│
├── docs/
│   ├── architecture.md
│   ├── configuration.md
│   ├── rule-authoring.md
│   ├── benchmark.md
│   └── decisions.md
│
├── project/
│   ├── PLAN.md
│   ├── STATE.md
│   ├── WORK.yml
│   └── EVIDENCE/
│
├── examples/
├── scripts/
├── .github/
│   └── workflows/
│
├── AGENTS.md
├── quality-policy.yml
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
└── LICENSE
```

## 5.1 Razón de esta estructura

- El motor, la API y la CLI viven en un único paquete.
- Los módulos internos mantienen límites claros sin convertirse en paquetes publicados.
- Las reglas oficiales viven junto al motor, pero se compilan como artefacto independiente.
- Las tres integraciones externas son adaptadores.
- El control del proyecto utiliza cuatro elementos, no una burocracia documental completa.

---

# 6. Núcleo del producto

## 6.1 Contratos

Los contratos públicos viven en `src/contracts`.

Incluyen:

- `RuleDefinition`
- `CompiledRule`
- `Document`
- `SourceRange`
- `Finding`
- `ScanResult`
- `PolicyResult`
- `BaselineEntry`
- `Config`

Se versiona el formato JSON mediante un campo `schema_version`.

No se crea un paquete separado hasta que exista un consumidor externo que lo necesite realmente.

## 6.2 Modelo documental

Debe conservar:

- Texto original.
- Líneas.
- Párrafos.
- Frases.
- Tokens.
- N-gramas.
- Bloques elegibles.
- Posiciones exactas.
- Relación entre texto analizado y texto original.

Debe resolver correctamente:

- Unicode.
- Tildes.
- Emojis.
- CRLF y LF.
- BOM.
- Caracteres compuestos.
- Columnas y offsets.

## 6.3 Markdown

Se analiza mediante AST.

Se excluyen por defecto:

- Bloques de código.
- Código inline.
- Front matter.
- URLs y destinos de enlaces.
- Comentarios.
- Definiciones.
- HTML técnico.

Se analizan:

- Párrafos.
- Encabezados.
- Listas.
- Citas.
- Texto visible de enlaces.

## 6.4 Runtime

El runtime:

- Recibe un documento normalizado.
- Recibe reglas compiladas.
- Ejecuta detectores.
- Devuelve hallazgos.
- No lee archivos.
- No imprime.
- No conoce GitHub ni Claude Code.
- No decide por sí solo si el proyecto falla.

## 6.5 Runner

El runner:

- Descubre archivos.
- Respeta `.gitignore`.
- Resuelve configuración.
- Lee documentos.
- Usa caché.
- Ejecuta el runtime.
- Aplica supresiones, baseline y política.
- Ordena resultados.

---

# 7. Reglas

## 7.1 Formato

YAML validado con JSON Schema.

Campos mínimos:

```text
schema_version
id
revision
status
title
summary
category
scope
detector
conditions
exceptions
default_level
score
message
explanation
rewrite_guidance
examples
provenance
```

## 7.2 Detectores admitidos

- `regex`
- `lexicon`
- `sequence`
- `density`
- `repetition`
- `structure`
- `cooccurrence`

No se añade otro detector sin necesidad demostrada.

## 7.3 Compilación

Durante el build:

1. Se valida el schema.
2. Se comprueban IDs.
3. Se resuelven léxicos.
4. Se validan patrones.
5. Se ejecutan fixtures.
6. Se genera el Rule Pack.
7. Se genera la documentación de reglas.

El runtime no interpreta YAML.

## 7.4 Seguridad

Se rechazan:

- Coincidencias vacías.
- Cuantificadores peligrosos.
- Patrones no acotados.
- Retroreferencias complejas.
- Código dinámico.
- Reglas sin fixtures.
- Reglas sin evidencia.

Además, cada regla se prueba contra textos largos y casos adversariales.

## 7.5 Estados

```text
draft → candidate → stable → deprecated
```

No se necesitan más estados.

Una regla estable requiere:

- Ejemplos positivos.
- Ejemplos negativos.
- Evidencia.
- Falsos positivos conocidos.
- Test.
- Resultado de benchmark.
- Revisión técnica y editorial.

---

# 8. Puntuación y política

## 8.1 Separación

El motor detecta. La política decide:

- Severidad.
- Umbral.
- Fallo.
- Baseline.
- Supresión.
- Índice.

Ambas responsabilidades pueden estar en módulos del mismo paquete.

## 8.2 Índice

El índice:

- Mide densidad de señales.
- Aplica peso por regla.
- Limita la contribución de una regla.
- Reduce el impacto de repeticiones.
- Normaliza por palabras elegibles.
- Expone los principales contribuyentes.

Nunca se denomina probabilidad de IA.

## 8.3 Documentos cortos

Se muestran hallazgos. El índice agregado se omite cuando no hay suficiente texto.

## 8.4 Baseline

La baseline:

- Usa huellas.
- No almacena texto completo.
- Identifica hallazgos existentes.
- Impide que entren hallazgos nuevos.
- Detecta entradas obsoletas.
- Puede exigir razón.

No se construye un sistema de gestión de deuda más complejo.

---

# 9. Configuración

Un único archivo YAML por proyecto.

Capacidades:

- Perfil.
- Registro.
- Includes y excludes.
- `.gitignore`.
- Reglas.
- Overrides por ruta.
- Baseline.
- Condición de fallo.
- Privacidad.
- Reporter.
- Caché.

Precedencia:

1. Valores internos.
2. Perfil.
3. Registro.
4. Proyecto.
5. Override por ruta.
6. Regla concreta.
7. Supresión inline.

Debe existir:

```text
config explain <archivo>
```

Ese comando muestra la configuración efectiva y su origen.

---

# 10. Interfaces

## 10.1 CLI

Comandos necesarios:

```text
lint
rules list
rules explain
config validate
config explain
baseline create
baseline update
benchmark run
```

## 10.2 API

El paquete principal exporta funciones para:

- Analizar texto.
- Analizar archivo.
- Analizar proyecto.
- Cargar configuración.
- Explicar reglas.

No se crea un SDK independiente.

## 10.3 Pre-commit

Usa la CLI instalada en el proyecto. No contiene lógica.

## 10.4 GitHub Action

- Invoca la API o el bundle del paquete principal.
- Publica anotaciones.
- Puede generar SARIF.
- Respeta la configuración del repositorio.
- No redefine reglas ni umbrales.

## 10.5 Claude Code

Incluye:

- Skill.
- Comando explícito.
- Hook opcional, desactivado por defecto.
- Bundle de la misma CLI.

No contiene un segundo motor.

---

# 11. Corpus propio

## 11.1 Qué significa propio

Se construyen desde cero:

- Selección.
- Manifiestos.
- Limpieza.
- Anotación.
- Deduplicación.
- Particiones.
- Prompts.
- Generaciones IA.
- Benchmark.
- Metodología.

Los textos humanos pueden proceder de fuentes abiertas verificadas.

## 11.2 Licencias admitidas

Por defecto:

- Dominio público.
- CC0-1.0.
- CC-BY-4.0.

Se rechazan:

- Licencia desconocida.
- NC.
- ND.
- SA en el corpus principal.
- Términos no revisados.

## 11.3 Clase humana

Cada muestra necesita:

- Fuente.
- Licencia.
- Autor o entidad.
- Fecha.
- Evidencia de autoría humana.
- Registro.
- Variante, cuando sea posible.
- Hash.
- Deduplicación.
- Trazabilidad.

Niveles:

- `H1`: verificada.
- `H2`: alta confianza institucional.
- `H3`: solo challenge.
- `HX`: rechazada.

Una licencia abierta no demuestra autoría humana.

## 11.4 Fuentes

### BNE

Solo por obra o registro con derechos demostrables.

Los textos históricos se usan principalmente en challenge.

### ALIA / GPLSI

Solo datasets y revisiones concretas incluidas en allowlist.

### Common Corpus

Solo como fuente de candidatos. Cada registro se filtra por licencia, procedencia, autoría y calidad.

## 11.5 Veto

Quedan prohibidos para reglas, calibración, ejemplos y benchmark:

- AuTexTification.
- IberAuTexTification.
- Forks.
- Conversiones.
- Derivados.
- Copias sin trazabilidad.

Pueden citarse como trabajo relacionado.

## 11.6 Clase IA

Se genera expresamente para el proyecto.

Se registra:

- Proveedor.
- Modelo.
- Versión.
- Fecha.
- Prompt.
- Sistema.
- Parámetros.
- Registro.
- Texto bruto.
- Ediciones.
- Hash.

## 11.7 Particiones

```text
development
holdout
challenge
quarantine
```

No se añade otra partición.

El holdout se congela antes de fijar pesos y umbrales. No se reutiliza para corregir la misma versión evaluada.

---

# 12. Benchmark

## 12.1 Por regla

- Hallazgos.
- Precisión adjudicada.
- Falsos positivos por mil palabras humanas.
- Documentos afectados.
- Resultado por registro.
- Tiempo.

## 12.2 Agregado

- Matriz de confusión.
- Tasa de verdaderos positivos.
- Tasa de falsos positivos.
- Precisión.
- Balanced accuracy.
- Resultado por registro.
- Intervalos de confianza.

No se publica recall si el corpus no está anotado exhaustivamente.

## 12.3 Proceso

1. Diseñar reglas en development.
2. Ajustar pesos y umbrales.
3. Congelar configuración.
4. Ejecutar holdout.
5. Publicar resultados completos.
6. No retocar y volver a presentar el mismo holdout como independiente.

---

# 13. Calidad y seguridad

Todo cambio debe superar:

- TypeScript.
- Unitarios.
- Integración.
- End-to-end.
- Reglas y fixtures.
- Unicode y offsets.
- Dependencias internas.
- Seguridad de regex.
- Rendimiento.
- Corpus y licencias.
- Empaquetado.
- Windows, macOS y Linux.

No se exige una infraestructura de certificación mayor.

## 13.1 Prohibiciones

- Desactivar pruebas para pasar CI.
- Rebajar umbrales sin decisión registrada.
- Regenerar snapshots sin revisión.
- Ocultar una regresión.
- Declarar completo un adaptador sin E2E.
- Crear stubs que cuenten como avance final.

---

# 14. Control ligero del proyecto

Solo se mantienen estos archivos:

## `project/PLAN.md`

- Alcance v1.0.
- Orden de trabajo.
- Dependencias.
- Gates.
- Criterios de aceptación.

## `project/WORK.yml`

Cada bloque:

```yaml
id:
title:
objective:
depends_on:
deliverables:
tests:
acceptance:
status:
```

## `project/STATE.md`

- Último commit.
- Trabajo terminado.
- Trabajo actual.
- Bloqueos.
- Próxima tarea.
- Estado de CI.

## `project/EVIDENCE/`

- Informes.
- Resultados E2E.
- Benchmark.
- Artefactos de release.

Las decisiones arquitectónicas se registran en `docs/decisions.md`. Solo una decisión difícil de revertir merece una entrada formal.

No se crean RFC, ADR, registros y matrices separados para cada modificación rutinaria.

---

# 15. Método de ejecución

## 15.1 Límite de trabajo en curso

Solo puede haber **un bloque principal en desarrollo**.

Se permite trabajo paralelo únicamente cuando:

- No comparte archivos.
- No depende de una decisión pendiente.
- Puede verificarse de forma independiente.

## 15.2 Bloques internos

No son lanzamientos parciales.

### Bloque 1. Base

- Repositorio.
- Contratos.
- Modelo documental.
- Configuración.
- Build y CI.

### Bloque 2. Motor

- Detectores.
- Compilador.
- Runtime.
- Scoring.
- Supresiones.
- Baseline.

### Bloque 3. Producto local

- CLI.
- API.
- Reporters.
- Texto y Markdown.
- Reglas estables.

### Bloque 4. Evidencia

- Corpus.
- Benchmark.
- Calibración.
- Documentación de límites.

### Bloque 5. Integraciones

- Pre-commit.
- GitHub Action.
- Claude Code.
- Paridad E2E.

### Bloque 6. Cierre

- Seguridad.
- Rendimiento.
- Multiplataforma.
- Empaquetado.
- Release estable.

## 15.3 Regla de avance

No se abre el siguiente bloque principal hasta que el actual:

- Funciona.
- Tiene tests.
- Está documentado.
- Pasa sus gates.
- Deja evidencia.

## 15.4 Evitar sobrearquitectura

La IA ejecutora no debe:

- Crear paquetes sin consumidor.
- Crear abstracciones con una sola implementación si no reducen complejidad.
- Diseñar un marketplace.
- Preparar compatibilidad con lenguajes no incluidos.
- Añadir formatos fuera de alcance.
- Crear un framework general de linters.
- Reescribir componentes que ya cumplen.
- Posponer funcionalidad real para construir infraestructura hipotética.

---

# 16. Prompt autónomo

```text
Ejecuta el proyecto según `docs/architecture.md`, `AGENTS.md` y `quality-policy.yml`. El objetivo es la v1.0 completa definida allí, sin MVP, demo ni ampliación de alcance. No pidas aclaraciones: ante ambigüedad elige la opción más simple, conservadora y reversible que respete la arquitectura, y regístrala en `docs/decisions.md`.

Primero audita el repositorio y corrige `project/PLAN.md`, `project/WORK.yml` y `project/STATE.md`. Después trabaja un solo bloque end-to-end cada vez: implementación, pruebas, documentación y evidencia. No crees paquetes, capas, protocolos o abstracciones sin necesidad inmediata; no dupliques motor, reglas, scoring ni configuración. No uses AuTexTification, IberAuTexTification ni derivados.

Ejecuta los gates aplicables y corrige los fallos antes de avanzar. No desactives pruebas, no rebajes criterios y no declares terminado sin E2E y evidencia. Si falta una credencial o acción externa, deja preparado el trabajo, registra el bloqueo y continúa con la siguiente tarea no bloqueada. Al cerrar cada sesión actualiza el estado real, los resultados y la próxima acción exacta. Detente cuando se cumplan los criterios de v1.0; no añadas mejoras fuera de alcance.
```

---

# 17. Criterios de aceptación de v1.0

- Motor offline y determinista.
- Texto y Markdown.
- Entre 24 y 30 reglas estables.
- Rule Pack compilado.
- CLI completa.
- API programática.
- Configuración y perfiles.
- Supresiones.
- Baseline.
- Terminal, JSON y SARIF.
- Pre-commit.
- GitHub Action.
- Claude Code.
- Corpus propio y trazable.
- Veto automatizado de datasets prohibidos.
- Benchmark publicado.
- E2E de todas las superficies.
- Paridad de resultados.
- Windows, macOS y Linux.
- Seguridad de patrones.
- Rendimiento aceptable.
- Documentación.
- Paquete npm instalable.
- Release reproducible.
- Sin telemetría ni red durante el análisis.

---

# 18. Cierre

Esta arquitectura conserva lo necesario para que el producto sea fiable y adoptable, pero elimina la tendencia a construir una plataforma antes de terminar el linter.

La prioridad es clara:

> Primero terminar bien el producto definido. Después, únicamente si existe uso real, se amplía.
