# Auditoría del banco de pruebas v1.2

Fecha: 2026-09-18 · Reproducible con `node benchmark/scripts/auditoria-banco-v1.2.mjs`

Esta auditoría contesta en los tres registros nuevos las mismas preguntas que la de v1.1:
qué reglas disparan, qué queda de la separación sin las reglas de ritmo y qué queda contando
solo las `stable`. Cada texto se analiza con el perfil de su registro.

## Un fallo en el instrumento, antes de las cifras

La primera versión de este script llamaba a `api.lintText(texto, { profile, format })`. `lintText`
no tiene parámetro `profile`: la opción se ignoraba sin avisar y, al no pasar configuración, el
análisis cargaba el `ia-linter.yml` del propio repositorio (perfil `readme` y sus overrides). Las
cifras salían de una configuración que no era la del registro. Está corregido en los dos scripts de
auditoría, que ahora pasan `config: { profile }`. Con el arreglo, la auditoría de redes coincide con
el informe del benchmark (mediana humana 0, IA 18); antes daba 12 contra 18.

La auditoría de v1.1 tenía el mismo fallo y se ha corregido igual. Su cifra publicada no cambia:
separación 14,5 con todas las reglas y 0 sin las de ritmo.

Las reglas estaban cerradas antes de la primera lectura del holdout y no se han tocado después. Lo
que se arregló entre una lectura y otra fue el instrumento de medida, no el producto.

## Qué dispara

De las 38 reglas del pack, 26 disparan en los 270 textos del corpus v1.2 (16 de las 25 `stable`).

| Registro | Textos | Reglas que disparan | De ellas `stable` |
|---|---|---|---|
| correo | 90 | 14 | 10 |
| readme | 90 | 20 | 13 |
| redes | 90 | 15 | 7 |

Es bastante más de lo que ejercitaba v1.1, donde solo disparaban 14 reglas en total y 4 en el holdout.

## Las seis reglas sin evidencia de la auditoría anterior

| Regla | v1.2 | Qué se ha hecho |
|---|---|---|
| `densidad/conectores` | sigue sin disparar | baja a `candidate` |
| `lexico/desde-hasta-pasando` | sigue sin disparar | baja a `candidate` |
| `lexico/metaforas-comodin` | sigue sin disparar | baja a `candidate` |
| `densidad/intensificadores` | 1 texto IA en correo, 1 en redes | se queda `stable` |
| `lexico/ya-sea-enumeracion` | 1 IA en correo, 2 en readme, 1 humano en redes | se queda `stable` |
| `densidad/verbos-comodin` | 1 texto humano en readme, ninguno IA | se queda `stable`, pero conviene mirarla |

`densidad/verbos-comodin` pasa el criterio por los pelos: su única aparición en tres versiones del
corpus es en un README humano. Cumple la letra y no el olfato; queda anotada.

Con las tres degradadas quedan 25 reglas `stable`, por encima del mínimo de 24 de `quality-policy.yml`.
Ninguna regla se ha promovido: sin adjudicación de hallazgos, la precisión adjudicada es `null` y la
política pide 0,70 en development para pasar a `stable`.

## Reglas `stable` que no disparan en v1.2

Nueve, frente a las veinte que señalaba la auditoría de v1.1:

- `densidad/adjetivos-grandilocuentes`
- `densidad/exclamaciones`
- `estructura/cierre-formulario`
- `estructura/conector-inicio-parrafo`
- `formato/raya-espaciada`
- `lexico/es-importante-destacar`
- `lexico/muletillas-ia`
- `repeticion/anafora`
- `retorica/no-se-trata-de`

Para estas, el gate de falsos positivos sigue aprobando por vacío.

## Lo que sigue sin resolverse

La separación del índice sigue dependiendo entera de `estructura/ritmo-plano`, que es `candidate`.
Contando solo las `stable`, en holdout v1.2 la separación es 0 en correo, 0 en redes y −6 en README.
El gate de `pnpm gates` mide sobre el holdout v1.1 y da 14,5, que es el mismo número de siempre y
tiene el mismo dueño: una regla candidata.
