# Copias de seguridad incrementales en una pequeña empresa

## Qué es una copia incremental

Una copia de seguridad **incremental** guarda únicamente los datos que han cambiado desde la última copia realizada, sea esta completa o incremental. Frente a la copia **completa**, que duplica todo el conjunto cada vez, y a la **diferencial**, que copia todo lo modificado desde la última completa, la incremental es la que menos espacio y menos tiempo de ventana consume.

El precio de esa eficiencia se paga en la restauración. Para recuperar el estado de un día concreto hay que aplicar la última copia completa y, después, todas las incrementales posteriores en orden. Si una sola de esas piezas está corrupta o falta, la cadena se rompe a partir de ahí.

| Tipo | Qué copia | Espacio | Tiempo de copia | Tiempo de restauración |
|---|---|---|---|---|
| Completa | Todo | Alto | Alto | Bajo |
| Diferencial | Cambios desde la última completa | Medio | Medio | Medio |
| Incremental | Cambios desde la última copia | Bajo | Bajo | Alto |

## Antes de elegir la frecuencia: RPO y RTO

Dos preguntas al gerente, no al informático:

- **RPO** (*Recovery Point Objective*): ¿cuántas horas de trabajo puede permitirse perder la empresa? Si la respuesta es "una mañana", las copias han de ser al menos cada cuatro horas.
- **RTO** (*Recovery Time Objective*): ¿cuánto puede estar parada la actividad mientras se restaura? Si son dos horas, una cadena de treinta incrementales no sirve, por mucho que ahorre disco.

Estos dos números determinan el esquema. Todo lo demás es consecuencia.

## Un esquema razonable para 5-50 empleados

Un patrón que funciona en la mayoría de los casos:

- **Completa semanal**, en fin de semana o de madrugada del viernes al sábado.
- **Incrementales diarias**, de lunes a viernes, fuera del horario de trabajo.
- **Retención**: cuatro semanas de cadenas completas + incrementales, más una completa mensual conservada doce meses.

Aplicar la regla **3-2-1**: tres copias de los datos, en dos soportes distintos, con una de ellas fuera de las instalaciones. En la práctica: los datos en producción, un NAS local y un destino en la nube o un disco cifrado que rota a otra ubicación.

## Qué hay que copiar (y qué se suele olvidar)

- Servidor de ficheros y unidades compartidas.
- Bases de datos, con volcado consistente, no copiando el fichero en caliente.
- Correo, si está autoalojado. Si está en Microsoft 365 o Google Workspace, conviene una copia de terceros: el proveedor garantiza disponibilidad, no recuperación ante borrados o cifrados por *ransomware*.
- Configuración de servidores, certificados, reglas del cortafuegos.
- Programa de facturación o ERP, incluidos sus ficheros de configuración.

## Protección frente a ransomware

Un atacante que llega al servidor buscará también las copias. Medidas mínimas:

- Almacenamiento **inmutable** o WORM en el destino remoto.
- Credenciales de la copia distintas de las del dominio.
- Al menos una copia sin conexión permanente.

## Verificación

Una copia no probada no es una copia. Establezca dos rutinas:

1. **Mensual**: restaurar un fichero al azar y comprobar que abre.
2. **Anual**: simulacro completo de recuperación de un servidor, cronometrado, para validar el RTO real.

Documente el procedimiento en una página, con quién restaura, dónde están las claves de cifrado y en qué orden se levantan los sistemas. En una emergencia nadie improvisa bien.
