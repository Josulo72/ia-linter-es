# FestivosEspaña

Una biblioteca para consultar qué fechas son festivas en España según cada comunidad autónoma. Le das una fecha y te dice si es festivo donde vives.

Sirve para aplicaciones que necesitan saber si una fecha de trabajo es festivo o no. Si tienes un sistema de reservas, un contador de horas, una nómina, necesitas saber cuándo no se trabaja.

Incluye los festivos nacionales que valen en todo el país, más los específicos de cada comunidad. Diferencia entre Cataluña, Andalucía, Galicia, Vascoamérica, cada una con sus días propios.

La usas importando la librería y preguntando si una fecha es festiva. Te devuelve verdadero o falso, además del nombre del festivo si quieres.

Funciona con cualquier librería de fechas que uses en Python. Compatible con datetime estándar, con Arrow, con Pendulum, con lo que tengas.

Lo difícil es mantenerlo actualizado. Cada año pueden cambiar puentes, días de sustitución, festivos locales nuevos. La librería se actualiza como llega esa información.

Aquí viene lo complicado: algunos festivos locales cambian por decreto. Un municipio dentro de una comunidad puede tener su propio festivo. Eso no está cubierto todavía, la librería funciona a nivel de comunidad.

También está el tema de los puentes. Si el festivo cae entre semana, a veces se traslada al lunes siguiente. Eso depende de dónde trabajes, algunos jefes lo respetan y otros no.

Para un sistema de reservas online, lo tienes cubierto. Para una nómina donde necesites exactitud absoluta, mejor consultas con recursos humanos aparte.

Se instala con pip. Los datos vienen en el paquete, no depende de ningún servicio externo. Así que funciona offline sin problema.
