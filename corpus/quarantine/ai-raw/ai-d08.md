# Contenedores frente a máquinas virtuales: ventajas e inconvenientes

Cuando se trata de aislar aplicaciones y gestionar infraestructura, contenedores y máquinas virtuales son las dos opciones que casi cualquier equipo técnico acaba comparando en algún momento. Ambas resuelven un problema parecido —ejecutar cargas de trabajo de forma aislada— pero lo hacen desde arquitecturas muy distintas, y esa diferencia tiene consecuencias prácticas importantes.

## Cómo funcionan

Una máquina virtual emula un ordenador completo. Un hipervisor (como VMware ESXi, KVM o Hyper-V) reparte los recursos físicos del host entre varias VMs, y cada una de ellas ejecuta su propio sistema operativo completo, con su propio kernel, sus propios drivers y su propia gestión de memoria. Desde el punto de vista del sistema operativo invitado, está funcionando sobre hardware real, aunque en realidad todo esté virtualizado.

Un contenedor, en cambio, no virtualiza hardware: virtualiza el sistema operativo. Todos los contenedores que corren en una misma máquina comparten el kernel del host, y lo que se aísla son los procesos, el sistema de archivos y la red de cada contenedor mediante mecanismos del propio kernel de Linux, como namespaces y cgroups. Docker y containerd son los motores más habituales para gestionar esto.

## Ventajas de los contenedores

- **Ligereza**: al no incluir un sistema operativo completo, una imagen de contenedor puede pesar unos pocos megabytes, frente a los gigabytes que suele ocupar una VM.
- **Arranque rápido**: un contenedor puede estar listo en cuestión de milisegundos o segundos, mientras que una VM necesita arrancar un sistema operativo entero.
- **Densidad**: en una misma máquina física se pueden ejecutar muchos más contenedores que VMs, porque el overhead de cada uno es mucho menor.
- **Portabilidad**: una imagen de contenedor se comporta igual en el portátil de un desarrollador, en un servidor de pruebas o en producción, siempre que el kernel subyacente sea compatible.

## Ventajas de las máquinas virtuales

- **Aislamiento fuerte**: al tener su propio kernel, una VM ofrece una barrera de seguridad más robusta entre cargas de trabajo. Un fallo o una vulnerabilidad en el kernel del host no compromete automáticamente a las VMs.
- **Compatibilidad de sistemas operativos**: una VM puede ejecutar un sistema operativo distinto al del host (por ejemplo, Windows sobre un host Linux), algo que un contenedor no puede hacer sin recurrir a virtualización adicional.
- **Madurez en entornos regulados**: en sectores donde el aislamiento estricto es un requisito de cumplimiento normativo, las VMs siguen siendo, en muchos casos, la opción preferida.

## Inconvenientes de cada uno

Los contenedores comparten kernel con el host, lo que reduce el aislamiento de seguridad frente a una VM: una vulnerabilidad grave en el kernel puede, en teoría, afectar a todos los contenedores de la máquina. Además, la gestión de redes y almacenamiento persistente en entornos con contenedores (especialmente en orquestadores como Kubernetes) añade una capa de complejidad considerable.

Las máquinas virtuales, por su parte, consumen muchos más recursos por unidad de carga de trabajo. Cada VM necesita su propia asignación de CPU, memoria y disco reservada de forma más rígida, lo que se traduce en menor densidad y mayores costes de infraestructura a igualdad de capacidad.

## Conclusión

En la práctica, muchos entornos de producción combinan ambas tecnologías: máquinas virtuales para establecer el aislamiento de nivel más alto entre clientes o entornos, y contenedores dentro de esas VMs para desplegar y escalar aplicaciones con agilidad. No se trata tanto de elegir un bando como de entender qué problema resuelve cada herramienta y aplicarla donde tiene sentido.
