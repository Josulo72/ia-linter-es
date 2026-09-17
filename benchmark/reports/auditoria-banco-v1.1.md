# Auditoría del banco de pruebas v1.1

Fecha: 2026-09-18 · Reproducible con `node benchmark/scripts/auditoria-banco.mjs`

El informe `v1.1.md` publica una separación de medianas de 14,5 y una exactitud equilibrada de 0,75. Las dos cifras son ciertas. Esta auditoría mira de qué están hechas, y el resultado obliga a reescribir cómo se presentan.

## Lo que sostiene la separación

| Qué se cuenta | Mediana humano | Mediana IA | Separación |
|---|---|---|---|
| Todas las reglas | 0 | 14,5 | 14,5 |
| Sin `estructura/ritmo-plano` ni `estructura/ritmo-metronomo` | 0 | 0 | 0 |
| Solo con las 28 reglas `stable` | 0 | 0 | 0 |

El peso lo lleva entero la regla del ritmo. Quitadas las dos reglas de ritmo, la mediana de la clase IA es cero, igual que la humana, y el índice deja de separar. Y como las dos son `candidate`, la parte del producto que se presenta como estable separa cero en este corpus.

Eso cambia lo que significa el 14,5. No mide que el linter distinga textos generados: mide que una regla de longitud de frase distingue estos textos generados.

## Lo que el banco no ha ejercitado

De las 38 reglas del pack, 14 han disparado alguna vez en los 132 textos del corpus, 8 de ellas `stable`. Las 24 restantes no han aparecido nunca, y 20 de ellas son `stable`. Si se mira solo el holdout, que es lo que lee el gate, bajan a 4 las reglas `stable` que marcan algo.

El gate `FP/1000 ≤ 1.5` las aprueba a todas, pero a las que no marcan nada las aprueba por vacío: no tienen falsos positivos porque no han encontrado nada que marcar.

De esas 20, seis no tienen evidencia de corpus en ninguna versión, ni en v1.1 ni en el v1.0 archivado:

- `densidad/conectores`
- `densidad/intensificadores`
- `densidad/verbos-comodin`
- `lexico/desde-hasta-pasando`
- `lexico/metaforas-comodin`
- `lexico/ya-sea-enumeracion`

Funcionan, porque saltan en `examples/muestra-ia.md` y en sus fixtures, pero su estado `stable` no lo respalda ninguna medición sobre corpus.

Y cuatro tienen evidencia que apunta al revés, porque en el corpus v1.0 marcaron más documentos humanos que generados.

| Regla | Documentos IA | Documentos humanos |
|---|---|---|
| `retorica/triada` | 7 | 11 |
| `lexico/muletillas-ia` | 1 | 5 |
| `retorica/no-solo-sino` | 1 | 3 |
| `densidad/adjetivos-grandilocuentes` | 0 | 1 |

Los textos humanos de v1.0 eran prosa formal de dominio público, del XIX y principios del XX, así que la tríada retórica y las muletillas de redacción están en su sitio ahí. Pero una regla que aparece más en la clase humana que en la generada no sostiene el estado `stable` por sí sola. Las otras diez sí dispararon más en la clase IA, aunque con uno, dos o cuatro documentos: es poco para llamarlo evidencia.

## El banco tiene un solo eje de forma

Los 132 textos son mensajes de foro. Los 36 humanos son de Mediavida, elhacker.net e Infojardín; los 96 generados piden exactamente eso, un mensaje de foro.

El producto declara ocho perfiles y cuatro situaciones distintas. `correo`, `readme` y `redes` tienen cero casos en el banco, y son justamente las situaciones donde aparecen las reglas de tipografía y de formato que aquí nunca disparan. El caso que originó el proyecto, un README generado, no está representado por ningún texto del corpus.

Así que la separación de 14,5 vale para conversación de foro medida con el perfil `chat`. Para las otras tres situaciones no hay medición, ni buena ni mala.

## Precisión adjudicada: no hay

`benchmark/annotations/` solo tiene el directorio de v1.0. Para v1.1 no hay ninguna adjudicación, así que `adjudicated.precision` es `null` en las 38 reglas y el informe lo dice en una nota. Nadie ha revisado a mano si los hallazgos eran correctos; lo que hay medido es cuántas veces salta cada regla, no cuántas veces acierta.

La arquitectura pide precisión adjudicada por regla en §12.1. Ese entregable está a medias.

## Lo que sí aguanta

- El corpus humano viene de una fuente ajena al proyecto, con URL, fecha y hash por muestra. No lo generó nada de aquí.
- El holdout se congeló antes de fijar los umbrales y su lock lo comprueba `corpus-check`.
- El tercer estado está bien tratado: un texto demasiado corto para tener índice se cuenta aparte (`skipped_short`) y no entra como acierto. En este holdout no hubo ninguno.
- La medición es por regla, no un porcentaje global.
- El umbral se calibró sobre development y el barrido está publicado.

## Lo que hay que arreglar, por orden

1. **Las cifras públicas.** Donde se diga «casi toda la separación viene de una regla», poner lo que sale aquí: sin las dos reglas de ritmo la separación es cero. Hecho en `v1.1.md`, `README.md`, `docs/benchmark.md` y `project/STATE.md`.
2. **El gate de FP.** No se baja el umbral, pero el mensaje tiene que distinguir las reglas con evidencia de las que no la tienen, para que «todas las reglas stable con FP/1000 ≤ 1,5» deje de sonar a lo que no es. Hecho en `scripts/gates.mjs`.
3. **Las seis reglas sin evidencia de corpus.** O se les busca evidencia, o vuelven a `candidate`. Es decisión del propietario, no se toca aquí.
4. **Las otras tres situaciones.** Un banco con correos, README y publicaciones cortas, humanos y generados. Sin eso, tres de los ocho perfiles están sin medir.
5. **Adjudicación.** Revisar a mano los hallazgos de las reglas que más disparan y guardar el veredicto en `benchmark/annotations/v1.1`, que es lo que convierte «cuántas veces salta» en «cuántas veces acierta».

## Lo que no se arregla con más casos

La clase IA la generaron subagentes de Claude Code, y las reglas las escribió el mismo modelo mirando esos textos. Aunque el corpus creciera a mil textos, seguiría midiendo lo bien que un modelo reconoce su propia manera de escribir. Está registrado como límite desde el principio, pero conviene decirlo aquí con todas las letras: **esto no es una evaluación independiente, y ninguna cifra de este repositorio debe presentarse como tal.**
