Vas a trabajar en modo ejecutor. No eres el arquitecto de esta sesión, yo lo soy.
Y no terminas el turno hasta que el trabajo esté acabado y verificado.

CONTEXTO
Proyecto: linter de español que detecta texto con olor a IA, más una guía de estilo.
Estado y problemas: project/STATE.md y benchmark/reports/auditoria-banco-v1.1.md.
Lee los dos antes de planificar. No te fíes de mi resumen, comprueba en el código.
Mira también cómo está montado el corpus v1.1 (corpus/manifests/, corpus-check,
el lock) y replica ese mismo formato para lo nuevo. No inventes un formato propio.

LO QUE HAY QUE ARREGLAR
E1. Toda la separación del holdout v1.1 (14,5) sale de una sola regla,
    estructura/ritmo-plano, que es candidate. Contando solo las 28 stable la
    separación es 0: el producto estable no separa nada.
E2. 20 de las 28 reglas stable no disparan ni una vez en el corpus v1.1, y seis no
    tienen evidencia de corpus en ninguna versión. El gate de falsos positivos las
    aprueba por vacío.
E3. El banco son 132 mensajes de foro. Los perfiles correo, readme y redes están
    sin medir: no hay ni un texto de esos registros.
E4. El holdout v1.1 ya se ha ejecutado, no vale como evaluación independiente.

Hay cambios sin commitear en LICENSE, README.md, packages/linter/LICENSE,
packages/linter/package.json y project/STATE.md. Míralos antes de tocar nada, dime
en una línea qué son, y no los revientes.

DESCARGA DEL CORPUS NUEVO (esto es parte del trabajo, hazlo tú)
E3 se cierra descargando textos humanos reales de internet. Condiciones:
- Corte temporal: nada posterior al 31/12/2021. Un texto de 2022 en adelante puede
  estar escrito con IA y contamina el corpus humano. La fecha se comprueba en el
  dato de origen (fecha de commit, de publicación, del mensaje), no a ojo.
- Español de España. Descarta traducciones automáticas y español de América si se
  nota. Si dudas de un texto, fuera.
- Escrito por una persona para otra persona. Nada generado, nada de plantilla.
- Fuentes con API pública o archivo público, respetando robots.txt y sin scraping
  agresivo (pausa entre peticiones, user-agent identificable). Nada detrás de login.
  Sugerencias, no obligación, si encuentras algo mejor lo justificas:
    readme -> API de GitHub, repos en español con licencia permisiva, último commit
              del README anterior a 2022.
    correo -> archivos públicos de listas de distribución en español (listas de
              proyectos de software libre), que ya son correo real y público.
    redes  -> API pública de Mastodon o archivos públicos de Reddit en español,
              publicaciones anteriores a 2022.
- Objetivo mínimo: 30 textos humanos por perfil (correo, readme, redes), más los
  textos IA equivalentes generados con y sin la guía, igual que en v1.1.
- Los textos NO se redistribuyen: se guardan solo en local, igual que el corpus
  actual, y en el repositorio va el manifiesto con URL, autor/repo, fecha, licencia
  y hash. Mismo criterio que corpus/manifests/ ya usa.
- El script de descarga se guarda en el repositorio y es reejecutable.

FASE 0: NUMERAR EL PLAN (antes de tocar nada)
Lees el estado, la auditoría y el código, y escribes un plan en pasos numerados que
cubra E1, E2, E3 y E4, con la descarga incluida. Condiciones:
- Cada paso es una acción concreta sobre archivos concretos, con su ruta.
- Cada paso lleva su comprobación: cómo se sabe que está bien.
- Nada de pasos tipo "revisar" o "analizar". Verbos de acción.
- Un error sin paso que lo cubra es un plan malo.
Enseñas el plan numerado y sigues tú solo con el paso 1. No esperas mi visto bueno.

TABLERO
Después de cada paso reescribes la lista completa con su estado:
  [x] 1. ...   hecho, comprobación pasada
  [>] 2. ...   en curso
  [ ] 3. ...   pendiente
  [!] 4. ...   bloqueado, motivo en una línea
El plan se numera una vez. Si falta un paso, lo añades al final como 7.bis.

REGLA CERO: NO PARAR
No devuelves el control hasta que todos los pasos estén en [x] y los gates hayan
pasado con su salida pegada. No vale:
- "he hecho el paso 1, ¿sigo?"          -> sigues, sin preguntar.
- "esto es lo que haría a continuación"  -> hazlo.
- "he encontrado un problema, avísame"   -> lo arreglas y lo cuentas al final.
- "necesito textos humanos"              -> los descargas, está explicado arriba.
- entregar con tests, typecheck, build o gates en rojo.
Si una fuente no da lo suficiente, pruebas otra. Si tres fuentes seguidas fallan
para un mismo perfil, marcas ese paso [!] con el error literal y sigues.

ÚNICAS RAZONES PARA PARAR ANTES DE ACABAR
a) Hace falta un dato o una credencial que solo tengo yo.
b) El paso exige permiso mío: push, npm publish, desplegar, borrar datos, instalar
   dependencias nuevas, tocar CI o configuración persistente.
c) El paso rompe algo que ya funciona.
Marcas [!], una línea de motivo, y continúas con el resto. Sin red no es excusa
para no intentarlo: pruébalo primero y cuenta el error real si lo hay.

REGLAS DE ALCANCE
1. Haces lo que pone tu plan. Nada más.
2. Lo que se podría mejorar y no está en el plan va a "Fuera de plan", sin tocarlo.
3. Prohibido de propina: refactorizar, renombrar, reordenar imports, reformatear,
   subir versiones de dependencias, crear archivos no pedidos, tocar CI.
4. Ante una ambigüedad, interpretación de menor cambio, la enuncias y continúas.
5. Lees el código existente antes de escribir encima.

REGLAS DE VERDAD (las importantes aquí)
6. No dices que algo funciona si no lo has ejecutado. Pegas el comando y su salida.
   Si no lo has ejecutado, escribes "no ejecutado".
7. No inventas rutas, nombres de reglas, cifras de separación ni resultados.
8. Prohibido tocar umbrales, pesos o el gate para que las cifras salgan bien. Si una
   cifra no llega, se dice que no llega. Un número maquillado es peor que un fallo.
9. Prohibido meter en el corpus humano texto escrito por ti o por cualquier IA, y
   prohibido apuntar una fecha o una URL que no hayas comprobado.
10. El holdout nuevo se ejecuta UNA vez, al final, cuando las reglas ya están
    cerradas. Si lo miras antes y luego ajustas reglas, ya no vale y hay que
    apartar otra partición. Dilo si pasa.
11. Un test saltado, un TODO nuevo o una función vacía es NO terminado.

CRITERIO DE TERMINADO
- Todos los pasos en [x], o en [!] con motivo real.
- Ejecutados y en verde, con la salida pegada:
    pnpm typecheck
    pnpm test
    pnpm build
    pnpm gates
    pnpm lint:self
    pnpm pack:check
- Ninguna regresión.
- project/STATE.md actualizado con lo que de verdad ha quedado, incluido lo que
  siga sin estar medido.

INFORME FINAL (y solo al final)
- Tablero completo.
- Archivos tocados, ruta exacta.
- Corpus descargado: cuántos textos por perfil, de dónde, rango de fechas.
- Comandos ejecutados y su resultado literal.
- Qué error de E1 a E4 queda resuelto y cuál no, sin adornar.
- Fuera de plan.
Sin recapitulaciones, sin resúmenes de lo obvio, sin felicitarte.

Empieza por la fase 0.
