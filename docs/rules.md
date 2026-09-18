# Reglas oficiales

Rule Pack `ia-linter-es/oficial` v1.0.0. 38 reglas compiladas.

| Regla | Estado | Categoría | Detector | Nivel | Peso |
|---|---|---|---|---|---|
| `densidad/adjetivos-grandilocuentes` | stable | densidad | density | warning | 2 (cap 3) |
| `densidad/adverbios-mente` | stable | densidad | density | warning | 1.5 (cap 3) |
| `densidad/conectores` | candidate | densidad | density | warning | 2 (cap 3) |
| `densidad/emojis` | stable | densidad | density | info | 1 (cap 2) |
| `densidad/exclamaciones` | stable | densidad | density | info | 1 (cap 2) |
| `densidad/intensificadores` | stable | densidad | density | warning | 1.5 (cap 3) |
| `densidad/verbos-comodin` | stable | densidad | density | warning | 1.5 (cap 3) |
| `estructura/cierre-formulario` | stable | estructura | regex | warning | 2 (cap 2) |
| `estructura/conector-inicio-parrafo` | stable | estructura | density | warning | 2 (cap 3) |
| `estructura/encabezado-dos-puntos` | stable | estructura | structure | info | 1 (cap 3) |
| `estructura/enumeracion-ordinal` | stable | estructura | cooccurrence | info | 1.5 (cap 2) |
| `estructura/lista-inicio-uniforme` | candidate | estructura | structure | info | 0.5 (cap 1) |
| `estructura/longitud-uniforme` | stable | estructura | structure | info | 2 (cap 2) |
| `estructura/ritmo-metronomo` | candidate | estructura | structure | off | 2 (cap 2) |
| `estructura/ritmo-plano` | candidate | estructura | structure | off | 2 (cap 2) |
| `formato/comillas-angulares` | candidate | formato | regex | off | 1 (cap 2) |
| `formato/encabezado-title-case` | stable | formato | structure | info | 1.5 (cap 3) |
| `formato/lista-negrita-inicial` | stable | formato | structure | info | 1.5 (cap 2) |
| `formato/negrita-abre-parrafo` | candidate | formato | structure | info | 1.5 (cap 2) |
| `formato/raya` | candidate | formato | regex | off | 1.5 (cap 3) |
| `formato/raya-espaciada` | stable | formato | density | warning | 2 (cap 3) |
| `formato/sentencia-dos-puntos` | candidate | formato | regex | info | 1.5 (cap 3) |
| `lexico/actualidad-generica` | stable | lexico | lexicon | warning | 1.5 (cap 3) |
| `lexico/desde-hasta-pasando` | candidate | lexico | regex | info | 1.5 (cap 2) |
| `lexico/es-importante-destacar` | stable | lexico | regex | warning | 2 (cap 3) |
| `lexico/honestidad-anunciada` | candidate | lexico | lexicon | info | 1.5 (cap 2) |
| `lexico/metaforas-comodin` | candidate | lexico | lexicon | warning | 2 (cap 4) |
| `lexico/muletillas-ia` | stable | lexico | lexicon | warning | 2 (cap 4) |
| `lexico/ya-sea-enumeracion` | stable | lexico | sequence | info | 1 (cap 2) |
| `repeticion/anafora` | stable | repeticion | repetition | warning | 2 (cap 3) |
| `repeticion/inicio-parrafo` | stable | repeticion | repetition | info | 1.5 (cap 2) |
| `repeticion/ngramas` | candidate | repeticion | repetition | info | 1 (cap 3) |
| `retorica/arenga-final` | stable | retorica | lexicon | warning | 1.5 (cap 3) |
| `retorica/no-es-x-es-y` | candidate | retorica | regex | warning | 2 (cap 3) |
| `retorica/no-se-trata-de` | stable | retorica | sequence | warning | 2 (cap 3) |
| `retorica/no-solo-sino` | stable | retorica | sequence | warning | 1.5 (cap 3) |
| `retorica/pregunta-retorica-apertura` | stable | retorica | regex | info | 1 (cap 3) |
| `retorica/triada` | stable | retorica | structure | info | 1 (cap 3) |

## densidad/adjetivos-grandilocuentes

**Exceso de adjetivos grandilocuentes** — Acumulación de «crucial», «fundamental», «innovador», «revolucionario», «imprescindible» y similares.

Estos adjetivos califican sin describir. Un texto que llama «crucial», «fundamental» e «innovador» a todo no distingue nada; la redacción generada los usa como relleno de valoración.

**Cómo reescribir:** Sustituye el adjetivo por el rasgo que lo justifica («innovador» → «el primero que usa X»).

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Publicidad escrita por humanos, donde la densidad es igualmente alta por diseño.

**Ejemplo:**

> Una solución innovadora y revolucionaria. Es fundamental entender que su papel es crucial y sus ventajas, imprescindibles. Este enfoque, además, ofrece una base sólida para cualquier organización que quiera modernizar sus procesos sin asumir riesgos innecesarios ni costes ocultos. Los equipos que la adoptan informan de mejoras en la coordinación, en la trazabilidad de las tareas y en la satisfacción de los clientes, tres indicadores que la dirección revisa cada trimestre para decidir inversiones y prioridades del año siguiente en el plan general.

## densidad/adverbios-mente

**Acumulación de adverbios en -mente** — Tres o más adverbios en -mente en un mismo párrafo con densidad alta.

Los adverbios en -mente alargan la frase y suelen sustituir a un verbo o a un dato. La prosa generada los encadena («realmente», «significativamente», «adecuadamente») con una densidad que la prosa editada evita.

**Cómo reescribir:** Cambia el adverbio por un verbo más preciso o por la cantidad concreta. «Mejora significativamente» → «mejora un 12 %».

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Textos jurídicos con fórmulas adverbiales fijas («expresamente», «subsidiariamente»).

**Ejemplo:**

> Este enfoque mejora significativamente los resultados y, adicionalmente, reduce notablemente los costes, permitiendo finalmente escalar el negocio de manera sostenible durante años.

## densidad/conectores

**Exceso de conectores discursivos** — Densidad alta de «además», «asimismo», «por otro lado», «en este sentido», «cabe destacar» y similares.

Los conectores explicitan una relación que la prosa bien construida deja ver por el orden de las ideas. La redacción generada los usa como andamio en casi todas las frases.

**Cómo reescribir:** Elimina el conector y comprueba si la relación sigue clara. Si no, reordena las frases en lugar de añadir «además».

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Texto académico humano de tipo argumentativo, donde los conectores son parte del género.

**Ejemplo:**

> Además, el sistema es rápido. Asimismo, es barato. Por otro lado, requiere formación. En este sentido, cabe destacar el soporte. Sin embargo, no obstante, por lo tanto, el balance es positivo. De este modo, en definitiva, lo recomendamos a los equipos pequeños y medianos que busquen una herramienta sencilla de mantener, con documentación clara y una comunidad activa que responda a las dudas en pocos días, sin depender de consultoras externas ni de licencias adicionales por usuario, cosa que en otros productos del mercado encarece el despliegue de forma considerable con el paso del tiempo.

## densidad/emojis

**Emojis como marcadores de estructura** — Tres o más emojis en un texto expositivo, usados como viñetas o adornos de encabezado.

El contenido generado para redes y newsletters suele decorar cada punto con un emoji (🚀, ✅, 💡). Es un rasgo de formato, no de lengua, y por eso pesa poco; se notifica como información.

**Cómo reescribir:** Sustituye los emojis por encabezados o viñetas normales, salvo que el canal lo pida.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Mensajería informal y redes sociales escritas por humanos.

**Ejemplo:**

> 🚀 Lanzamos la nueva versión. ✅ Más rápida. 💡 Más simple. 🔥 Pruébala hoy mismo y cuéntanos qué te parece en los comentarios, porque tu opinión nos ayuda a mejorar cada semana con nuevas funciones pensadas para ti y para tu equipo.

## densidad/exclamaciones

**Exceso de frases exclamativas** — Una de cada cuatro frases o más termina en exclamación en un texto expositivo.

El entusiasmo por exclamación es un rasgo del contenido generado para marketing y redes. En prosa expositiva editada la exclamación es excepcional.

**Cómo reescribir:** Deja la exclamación solo donde haya una emoción real que transmitir; el resto, con punto.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Diálogo literario y textos infantiles.

**Ejemplo:**

> ¡Es fácil! ¡Es rápido! ¡Y es gratis! Descárgala hoy y empieza a organizar tus proyectos con un panel claro, avisos útiles y una aplicación móvil que funciona incluso sin conexión durante los viajes en tren o en avión, sincronizando después.

## densidad/intensificadores

**Exceso de intensificadores** — Acumulación en el documento de «sumamente», «realmente», «absolutamente», «sin duda» y similares.

El intensificador afirma sin demostrar. La prosa generada los reparte por todo el texto para sonar convincente; la prosa editada los usa de forma aislada o los sustituye por datos.

**Cómo reescribir:** Quita el intensificador o cámbialo por la medida que lo justifica.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Reseñas y crítica de opinión escritas por humanos con tono entusiasta.

**Ejemplo:**

> Es sumamente útil y realmente fácil de usar. Sin duda, es absolutamente recomendable para cualquier equipo que necesite una herramienta sencilla, estable y bien documentada. Además, resulta especialmente cómoda en dispositivos móviles, donde otras soluciones fallan con frecuencia y obligan a reiniciar. Por último, el soporte responde rápido y con criterio, cosa que no es habitual en este segmento del mercado ni en herramientas de precio similar, según los usuarios consultados durante el último año de pruebas.

## densidad/verbos-comodin

**Exceso de verbos comodín** — Acumulación de «optimizar», «potenciar», «garantizar», «brindar», «fomentar», «impulsar» y similares.

Son verbos que prometen efectos («optimiza», «potencia», «garantiza») sin describir una acción concreta. Su densidad es uno de los rasgos léxicos más estables del texto generado en español.

**Cómo reescribir:** Di qué hace exactamente el sujeto. «Optimiza el proceso» → «reduce el proceso de cinco pasos a dos».

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Textos de marketing humanos, que comparten este repertorio de verbos.

**Ejemplo:**

> Optimiza tus procesos, potencia tu equipo y garantiza resultados. Nuestra plataforma brinda soporte, fomenta la colaboración e impulsa el crecimiento. Además, facilita la integración con las herramientas que ya usas y mejora la visibilidad de cada proyecto para toda la organización, desde dirección hasta los equipos de campo, con informes claros y alertas configurables que evitan sorpresas al cierre de cada mes y permiten anticipar desviaciones en el presupuesto antes de que afecten al calendario de entregas comprometido con los clientes.

## estructura/cierre-formulario

**Cierre formulario** — El último párrafo empieza por «En resumen», «En conclusión», «En definitiva» o fórmula equivalente.

El párrafo final que anuncia «en conclusión» y repite lo dicho es el cierre por defecto del texto generado. Un texto editado termina con la última idea, no con el resumen de las anteriores.

**Cómo reescribir:** Borra el párrafo de resumen o conviértelo en la conclusión real (qué cambia, qué hay que hacer).

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Resúmenes ejecutivos y abstracts, donde el género exige la fórmula.

**Ejemplo:**

> El plan tiene tres fases.
> 
> La primera dura un mes.
> 
> En resumen, es un plan corto.

## estructura/conector-inicio-parrafo

**Párrafos que empiezan por conector** — Al menos tres párrafos, y el 40 % o más, empiezan por «Además», «Asimismo», «Por otro lado», «En este sentido»…

El texto generado encadena párrafos con un conector inicial que simula progresión («Además…», «Por otro lado…», «En definitiva…»). En prosa editada los párrafos empiezan por su sujeto o por la idea nueva.

**Cómo reescribir:** Empieza el párrafo por la información nueva. El conector, si hace falta, va después.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Texto argumentativo académico humano con estructura explícita.

**Ejemplo:**

> Además, el coste baja.
> 
> Asimismo, el plazo se acorta.
> 
> Por otro lado, el riesgo sube.
> 
> El equipo lo aprobó.

## estructura/encabezado-dos-puntos

**Encabezado con dos puntos** — Encabezado del tipo «Tema: explicación» («Guía completa: todo lo que necesitas saber»).

El encabezado de dos partes separadas por dos puntos es el formato por defecto de los títulos generados. En documentación y prensa en español el encabezado suele ser una frase nominal sin subtítulo pegado.

**Cómo reescribir:** Quédate con una de las dos partes o convierte la segunda en la primera frase del párrafo.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Títulos académicos con subtítulo («Título: subtítulo») escritos por humanos.

**Ejemplo:**

> # Guía completa: todo lo que necesitas saber
> 
> Texto.

## estructura/enumeracion-ordinal

**Andamio «En primer lugar… En segundo lugar… Por último»** — Párrafos encadenados con ordinales explícitos al inicio.

Los ordinales explícitos al inicio de párrafo son el esqueleto visible del texto generado. Un texto editado marca el orden con la propia información o con una lista.

**Cómo reescribir:** Convierte los párrafos en una lista numerada o elimina los ordinales y deja que el orden hable.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Instrucciones paso a paso escritas por humanos sin lista numerada.

**Ejemplo:**

> En primer lugar, el precio.
> 
> En segundo lugar, el plazo.
> 
> Por último, la calidad.

## estructura/lista-inicio-uniforme

**Lista con elementos que empiezan igual** — Cuatro o más elementos consecutivos de una lista empiezan por la misma palabra.

Las listas generadas repiten el arranque de cada elemento («Permite…», «Permite…», «Permite…»). La evidencia es todavía débil frente a listas humanas homogéneas; la regla está en estado candidate.

**Cómo reescribir:** Varía el arranque o convierte la lista en una frase con enumeración.

**Evidencia:** Pendiente de benchmark en holdout; ver benchmark/reports.

**Falsos positivos conocidos:**
- Listas de requisitos o comandos humanas con arranque fijo por diseño.

**Ejemplo:**

> - Permite exportar
> - Permite importar
> - Permite compartir
> - Permite borrar
> 

## estructura/longitud-uniforme

**Frases de longitud uniforme** — Las frases del documento tienen casi la misma longitud (coeficiente de variación bajo).

La prosa humana alterna frases largas y cortas; la generada tiende a una longitud media estable. Se calcula el coeficiente de variación de palabras por frase, sin contar encabezados ni frases de menos de tres palabras.

**Cómo reescribir:** Rompe alguna frase larga en dos y une dos cortas. Una frase de cuatro palabras después de una de treinta cambia el ritmo.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Listas de instrucciones y fichas técnicas humanas con frases deliberadamente homogéneas.

**Ejemplo:**

> Esta frase tiene una longitud media bastante normal. La siguiente frase mantiene una longitud parecida también. Otra frase más con el mismo número de palabras. Y seguimos con otra frase de longitud muy similar. Cada frase se parece mucho a la frase anterior. Nada cambia el ritmo de este párrafo tan regular. Las frases siguen y siguen con la misma medida. Ninguna es corta y ninguna es realmente larga. El lector nota una cadencia mecánica en el texto. Todo suena igual y nada llama la atención aquí. Así continúa el documento hasta su última frase. Y termina con otra frase de longitud media.

## estructura/ritmo-metronomo

**Ritmo de metrónomo** — Las frases alternan largo y corto con demasiada regularidad, como si siguieran una plantilla.

Es el defecto contrario a `estructura/ritmo-plano` y aparece cuando se le pide al modelo que varíe el ritmo con una regla numérica. Sale una cadencia de larga-corta-larga-corta que no comete una persona. Se exigen las dos cosas a la vez, alternancia de 0,85 y variación de longitud de 0,50, porque un texto plano oscila una palabra arriba y abajo y alternaría al 100 % sin ser un metrónomo. En 36 mensajes de foro no marca ninguno; en los 96 textos de la clase IA sin esa instrucción, tampoco; en los 8 generados con ella, 6.

**Cómo reescribir:** Pon dos frases seguidas de longitud parecida en algún punto. La irregularidad es lo natural, no el vaivén.

**Evidencia:** 36 mensajes de foro, 96 textos de la clase IA y 8 generados con instrucción numérica de ritmo; ver benchmark/reports/v1.1.md.

**Falsos positivos conocidos:**
- Textos muy cortos, donde pocas frases bastan para alcanzar la proporción.
- Diálogos o listas de preguntas y respuestas, donde el vaivén de longitud viene de la forma del texto.

**Ejemplo:**

> Me han ofrecido un trabajo en otra ciudad con bastante mejor sueldo y más responsabilidad de la que tengo ahora mismo. En principio suena bien. Significa dejar el piso, a los amigos de siempre y a mi pareja, que no se puede mover de aquí por su trabajo. No lo tengo nada claro. El sueldo sube unos cuatrocientos euros al mes, que tampoco es una barbaridad para todo lo que supone el cambio. Ahí está mi duda. Llevo desde el jueves dándole vueltas al asunto sin llegar a ninguna parte concreta ni ver la cosa clara. Nunca me había pasado esto. Si alguien ha vivido algo parecido y quiere contarlo por aquí se lo agradezco mucho de antemano. Gracias por leerme.

## estructura/ritmo-plano

**Ritmo plano en escritura cotidiana** — Todas las frases miden casi lo mismo. En un mensaje o un correo, quien escribe alterna frases largas y sueltas de tres palabras.

Es la diferencia más clara entre un mensaje escrito por una persona y uno generado. En 18 mensajes de foro el coeficiente de variación mediano es 0,61; en 24 textos generados con el mismo encargo, 0,48. Con el umbral en 0,50 se marcan 14 de 24 textos generados y 3 de 18 humanos. El límite de `estructura/longitud-uniforme` (0,32) sirve para prosa editada larga y casi nunca salta en un texto corto.

**Cómo reescribir:** Deja alguna frase en tres o cuatro palabras y que otra siga hasta donde tenga que llegar. Sin alternar largo y corto, que eso cae en el defecto contrario.

**Evidencia:** 18 mensajes de foro y 24 textos generados del corpus v1.1 (development); ver benchmark/reports/v1.1.md.

**Falsos positivos conocidos:**
- Mensajes que enumeran datos o pasos, donde la uniformidad es funcional.
- Textos de menos de ocho frases: la regla no se aplica.

**Ejemplo:**

> Ayer estuve mirando el tema del router en varias tiendas. Los precios varían bastante según el modelo. Me interesa sobre todo la cobertura en toda la casa. El piso tiene tres habitaciones y un pasillo largo. La señal se pierde justo al final del pasillo. He probado a cambiarlo de sitio sin mucho éxito. También he mirado los repetidores de la marca. Algunos comentarios dicen que funcionan regular. Otros dicen que van perfectos sin problemas. No sé muy bien a quién hacer caso.

## formato/comillas-angulares

**Comillas angulares en escritura cotidiana** — Comillas « » en un texto de registro cotidiano, donde lo normal son las comillas del teclado.

Son las correctas en prosa editada, pero no están en el teclado y casi nadie las escribe en un mensaje o en un README. Su presencia sistemática delata un texto pasado por un corrector o por una máquina.

**Cómo reescribir:** Usa comillas normales.

**Evidencia:** Exploración sobre development y sobre el README de un proyecto real (2026-09-17); ver benchmark/reports/v1.1.md.

**Falsos positivos conocidos:**
- Quien escribe con un teclado o un editor que las inserta solo.

**Ejemplo:**

> Te pone «no legible» si no puede leerla.

## formato/encabezado-title-case

**Encabezado con mayúsculas al estilo inglés** — Encabezado con todas las palabras plenas en mayúscula inicial («Cómo Elegir Tu Mejor Estrategia»).

En español solo la primera palabra del título y los nombres propios llevan mayúscula. El «Title Case» con cada palabra en mayúscula es un calco del inglés muy habitual en encabezados generados.

**Cómo reescribir:** Deja en mayúscula solo la primera palabra y los nombres propios.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Nombres propios largos de instituciones u obras en encabezados.

**Ejemplo:**

> # Cómo Elegir Tu Mejor Estrategia Digital
> 
> Texto.

## formato/lista-negrita-inicial

**Lista con negrita inicial en cada elemento** — Tres o más elementos consecutivos de lista con el patrón «**Título:** explicación».

El patrón «- **Concepto:** explicación» repetido en cada viñeta es el formato por defecto de las listas generadas en Markdown. En documentación escrita a mano aparece de forma ocasional, no sistemática.

**Cómo reescribir:** Usa una lista de definiciones, subencabezados o frases completas sin negrita de arranque.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Documentación técnica humana con glosarios en formato «**término:** definición».

**Ejemplo:**

> - **Velocidad:** es rápido.
> - **Precio:** es barato.
> - **Soporte:** responde.
> 

## formato/negrita-abre-parrafo

**Párrafos que abren con negrita** — Dos o más párrafos del documento empiezan con una frase en negrita a modo de titular.

El titular en negrita al principio de cada párrafo es maquetación de texto generado. Quien escribe a mano pone un encabezado si hace falta, o nada.

**Cómo reescribir:** Quita la negrita; si el párrafo necesita título, ponle un encabezado.

**Evidencia:** Exploración sobre development y sobre el README de un proyecto real (2026-09-17); ver benchmark/reports/v1.1.md.

**Falsos positivos conocidos:**
- Glosarios y preguntas frecuentes maquetados a propósito con el término en negrita.

**Ejemplo:**

> **Una cuota cero es un dato.** Las exentas llevan IVA cero.
> 
> **Y si no es una factura, lo dice.** Un albarán se rechaza.

## formato/raya

**Raya de inciso en escritura cotidiana** — Cualquier raya (—) en un texto de registro cotidiano.

En un correo, un mensaje o un README casi nadie escribe rayas, porque no están en el teclado. La gente usa comas, paréntesis o parte la frase. En prosa editada la raya pegada es correcta, por eso la regla solo se activa en los perfiles cotidianos.

**Cómo reescribir:** Cambia el inciso por comas o paréntesis, o parte la frase en dos.

**Evidencia:** Exploración sobre development y sobre el README de un proyecto real (2026-09-17); ver benchmark/reports/v1.1.md.

**Falsos positivos conocidos:**
- Diálogo literario con raya.

**Ejemplo:**

> El programa —que es gratis— funciona sin conexión.

## formato/raya-espaciada

**Raya con espacios a ambos lados** — Uso de « — » (raya con espacio a ambos lados, al modo inglés) dos o más veces en el documento.

En español la raya de inciso va pegada al inciso («la casa —la de antes— era grande») y no se usa como separador de frase. El «palabra — palabra» con espacios es un calco del inglés muy característico del texto generado.

**Cómo reescribir:** Sustituye por coma, dos puntos o punto y seguido; si es un inciso, usa rayas pegadas o paréntesis.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Traducciones del inglés y textos periodísticos que adoptan el espaciado inglés.

**Ejemplo:**

> El plan tiene tres fases — todas cortas — y un presupuesto — pequeño. Nada de lo anterior es nuevo, pero conviene repasarlo antes de la reunión de mañana con el equipo de ventas y con los responsables de las tres oficinas regionales del norte.

## formato/sentencia-dos-puntos

**Frase-sentencia con dos puntos** — Frase corta que se parte con dos puntos para rematar con efecto («un NIF no se adivina: se calcula»).

Los dos puntos usados como redoble antes de un remate corto son un recurso de titular. Uno suelto no dice nada; repetido cada pocos párrafos es una firma del texto generado.

**Cómo reescribir:** Une las dos mitades en una frase normal o quita el remate.

**Evidencia:** Exploración sobre development y sobre el README de un proyecto real (2026-09-17); ver benchmark/reports/v1.1.md.

**Falsos positivos conocidos:**
- Definiciones breves de glosario («CIF: código de identificación fiscal.»).

**Ejemplo:**

> Un NIF no se adivina: se calcula.

## lexico/actualidad-generica

**Marco temporal vacío** — Apertura con un marco temporal genérico («hoy en día», «en la era digital», «en un mundo cada vez más») que no sitúa nada.

«Hoy en día» y sus variantes sirven para empezar a hablar de cualquier cosa sin decir cuándo ni dónde. La redacción generada abre con ellas de forma sistemática.

**Cómo reescribir:** Sustituye por una fecha, un periodo o un hecho concreto, o empieza directamente por el sujeto.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- «en la actualidad» es frecuente en prosa expositiva humana; por eso el peso es menor.

**Ejemplo:**

> Hoy en día, la ciberseguridad es una prioridad en un mundo hiperconectado.

## lexico/desde-hasta-pasando

**Enumeración «desde… hasta…, pasando por»** — Estructura de abanico «desde X hasta Y, pasando por Z» usada para sugerir amplitud sin concretar.

La fórmula finge exhaustividad enumerando extremos y un punto medio. En texto generado aparece con frecuencia muy superior a la de la prosa humana, donde se reserva para enumeraciones reales.

**Cómo reescribir:** Enumera los elementos que importan o indica el criterio de inclusión.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Descripciones de rutas o itinerarios reales.

**Ejemplo:**

> Cubre todo, desde la contabilidad hasta el marketing, pasando por la logística.

## lexico/es-importante-destacar

**Fórmula de énfasis vacía** — «Es importante destacar que», «cabe señalar que», «vale la pena mencionar»: anuncia importancia en lugar de mostrarla.

La fórmula presenta como importante lo que sigue sin justificar por qué. En prosa editada el énfasis se consigue con el orden de la información, no con un anuncio.

**Cómo reescribir:** Borra la fórmula y deja la afirmación. Si hace falta subrayar, empieza el párrafo con ella.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- «cabe señalar» aparece en textos académicos humanos, aunque con menor densidad.

**Ejemplo:**

> Es importante destacar que el plazo termina en marzo.

## lexico/honestidad-anunciada

**Honestidad anunciada** — Fórmulas que anuncian la propia franqueza («para ser honesto», «prefiero decirlo yo») en vez de limitarse a decir las cosas.

Avisar de que se va a ser sincero es un gesto de cara a la galería. El texto generado lo hace mucho cuando le piden sonar humano.

**Cómo reescribir:** Borra el aviso y deja el dato.

**Evidencia:** Exploración sobre development y sobre el README de un proyecto real (2026-09-17); ver benchmark/reports/v1.1.md.

**Falsos positivos conocidos:**
- Conversación informal, donde «la verdad es que» es normal (no está en el léxico).

**Ejemplo:**

> Para ser honesto, el OCR todavía falla.

## lexico/metaforas-comodin

**Metáfora comodín** — Metáfora gastada, a menudo calcada del inglés («sumérgete en», «desbloquear el potencial», «un tapiz de»).

La redacción generada recurre a un repertorio pequeño de imágenes (viaje, tapiz, faro, desbloquear, navegar) que en español editado resultan ajenas o publicitarias.

**Cómo reescribir:** Di literalmente lo que ocurre. «Desbloquear el potencial de X» suele significar «usar X para Y»; escribe Y.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Textos literarios que usan estas imágenes de forma deliberada.
- «en el corazón de» en descripciones geográficas («en el corazón de la ciudad»).

**Ejemplo:**

> Sumérgete en el fascinante mundo de la cerámica y desbloquea tu potencial oculto.

## lexico/muletillas-ia

**Muletilla de redacción generada** — Fórmula fija («en el vertiginoso mundo», «juega un papel crucial») muy frecuente en texto generado y rara en prosa editada.

Estas expresiones aparecen como relleno de apertura o de transición y no aportan información al lector. Su acumulación es uno de los rasgos más reconocibles de la prosa generada en español.

**Cómo reescribir:** Elimina la fórmula o sustitúyela por un dato concreto (quién, qué, cuándo). Si la frase sigue teniendo sentido sin ella, sobraba.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json, fila de la regla.

**Falsos positivos conocidos:**
- Textos de opinión que citan o parodian el estilo publicitario.
- «en el ámbito de» en textos jurídicos e institucionales, donde es fórmula habitual.

**Ejemplo:**

> En el vertiginoso mundo de la tecnología, la formación juega un papel crucial.

## lexico/ya-sea-enumeracion

**Enumeración «ya sea… o…»** — «Ya sea X, Y o Z» como muletilla de amplitud, muy frecuente en texto generado.

Construcción legítima en español, pero la redacción generada la usa en casi cualquier enumeración para simular cobertura total. Se notifica como información y pesa poco en el índice.

**Cómo reescribir:** Si la lista es cerrada, enuméralla sin «ya sea». Si es abierta, di «por ejemplo».

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Enumeraciones disyuntivas reales en textos normativos.

**Ejemplo:**

> Ya sea en casa, en la oficina o en el tren, la app funciona.

## repeticion/anafora

**Anáfora mecánica** — Tres o más frases consecutivas empiezan con las mismas dos palabras.

La anáfora es una figura retórica legítima, pero el texto generado la produce por inercia («Es hora de… Es hora de… Es hora de…») sin intención de énfasis, sobre todo en cierres y en contenido motivacional.

**Cómo reescribir:** Deja una sola de las frases o funde las tres en una con enumeración.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Poesía, discurso político y publicidad humana que usan la anáfora a propósito.
- Tablas con celdas cortas del mismo formato («0 de 48», «3 de 24»), que se leen como frases seguidas.

**Ejemplo:**

> Es hora de actuar. Es hora de cambiar. Es hora de crecer.

## repeticion/inicio-parrafo

**Párrafos que empiezan igual** — Tres o más párrafos del documento empiezan por las mismas dos palabras (no funcionales).

El texto generado sobre un tema repite el sujeto al inicio de cada párrafo («La inteligencia artificial…» ×3). La prosa editada varía el arranque o usa pronombres y elipsis.

**Cómo reescribir:** Empieza el párrafo por la información nueva o usa un pronombre.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Fichas y glosarios donde cada entrada repite el término por diseño.

**Ejemplo:**

> La inteligencia artificial cambia todo.
> 
> Otra cosa.
> 
> La inteligencia artificial cuesta.
> 
> La inteligencia artificial llega.

## repeticion/ngramas

**Secuencia de cuatro palabras repetida** — Una misma secuencia de cuatro palabras aparece tres o más veces en el documento.

El texto generado reutiliza bloques de cuatro o más palabras («la calidad de vida de», «a la hora de tomar») con una frecuencia que un redactor evitaría por oído. Se excluyen secuencias que empiezan o terminan por palabra funcional.

**Cómo reescribir:** Sustituye una de las repeticiones por un pronombre, un sinónimo o una elipsis.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Textos legales y técnicos con denominaciones fijas largas («la Ley Orgánica de Protección de Datos»).

**Ejemplo:**

> La gestión del cambio organizativo importa. La gestión del cambio organizativo cuesta. Sin la gestión del cambio organizativo nada avanza.

## retorica/arenga-final

**Arenga motivacional** — Frases de arenga («no esperes más», «da el primer paso», «el futuro está en tus manos») típicas del cierre generado.

El texto generado para marketing y autoayuda termina casi siempre con una llamada a la acción formularia. En prosa editada la llamada a la acción es concreta (qué hacer, dónde, cuándo).

**Cómo reescribir:** Sustituye la arenga por la acción concreta y el dato que la hace posible («Inscríbete antes del 30 en este enlace»).

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Publicidad humana, donde la fórmula es intencionada.

**Ejemplo:**

> No esperes más: da el primer paso hoy.

## retorica/no-es-x-es-y

**Negación-redefinición «no es X, es Y»** — Niega algo que nadie había dicho para presentar lo propio como revelación («no es un gasto, es una inversión»).

Es la fórmula más repetida del texto generado actual. Una persona la usa para corregir un dato concreto («Endesa no es distribuidora, es comercializadora»); la máquina, para dar solemnidad a cualquier frase.

**Cómo reescribir:** Di directamente la segunda parte. «No es un gasto, es una inversión» → «Se amortiza en dos años».

**Evidencia:** Exploración sobre development y sobre el README de un proyecto real (2026-09-17); ver benchmark/reports/v1.1.md.

**Falsos positivos conocidos:**
- Corrección real de un dato («no es distribuidora, es comercializadora»).

**Ejemplo:**

> Caminar no es un lujo, es una necesidad.

## retorica/no-se-trata-de

**Negación-redefinición «no se trata de… sino de»** — «No se trata de X, sino de Y» y variantes («no es cuestión de… sino de»), típicas del cierre generado.

La fórmula niega una idea que nadie había planteado para presentar la propia como revelación. Es uno de los cierres más característicos del texto generado en español.

**Cómo reescribir:** Afirma directamente la segunda parte. «No se trata de correr, sino de llegar» → «Lo importante es llegar».

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Ensayo humano que usa la fórmula con intención.

**Ejemplo:**

> No se trata de correr, sino de llegar.

## retorica/no-solo-sino

**Contraste «no solo… sino (también)»** — Estructura de contraste amplificador «no solo X, sino también Y», muy frecuente en texto generado.

Es una construcción correcta que el texto generado usa con una frecuencia muy superior a la humana, a menudo para presentar como contraste dos ideas que no se oponen.

**Cómo reescribir:** Si las dos partes no se contraponen, únelas con «y». «No solo es rápido, sino también barato» → «Es rápido y barato».

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Contrastes reales en prosa argumentativa humana.

**Ejemplo:**

> No solo es rápido, sino también barato.

## retorica/pregunta-retorica-apertura

**Pregunta retórica de apertura** — Un párrafo empieza con una pregunta y la responde a continuación («¿Te has preguntado…? La respuesta es…»).

La pregunta retórica seguida de su respuesta es el gancho estándar del contenido generado («¿Qué es X? X es…»). En prosa editada la pregunta abre un párrafo solo cuando hay intención de diálogo.

**Cómo reescribir:** Empieza por la respuesta. «¿Qué es la inflación? La inflación es…» → «La inflación es…».

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Entrevistas y FAQ, donde el formato pregunta-respuesta es el género.

**Ejemplo:**

> ¿Te has preguntado alguna vez cómo funciona? La respuesta es sencilla.

## retorica/triada

**Tríada de adjetivos o nombres** — Enumeración de tres palabras de la misma clase («claro, conciso y directo»; «innovadora, escalable y sostenible»).

La regla de tres es un recurso clásico que el texto generado aplica de forma compulsiva: casi toda enumeración tiene exactamente tres miembros de la misma categoría gramatical.

**Cómo reescribir:** Deja los dos adjetivos que aportan algo o sustituye la tríada por un dato.

**Evidencia:** Frecuencia relativa en corpus propio (development); ver benchmark/reports/development-v1.0.json.

**Falsos positivos conocidos:**
- Enumeraciones humanas legítimas de tres adjetivos; por eso el nivel es info y el peso bajo.

**Ejemplo:**

> Una solución innovadora, escalable y sostenible.

