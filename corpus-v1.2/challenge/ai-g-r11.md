# Rotos

Tengo un blog con ocho años de entradas y un día descubrí que la mitad de los enlaces a periódicos ya no llevaban a ninguna parte. De ahí salió esto. Repasa una web entera, apunta los enlaces que están caídos y te manda un correo con la lista.

Le das una dirección de inicio y va siguiendo los enlaces de cada página. Por defecto solo recorre el dominio que le has indicado; los de fuera los comprueba pero no entra a rastrearlos, porque si no te tira una semana dando vueltas por internet. En el informe aparece el código que devolvió cada uno, la página donde estaba el enlace y el texto del enlace, que suele ser lo que necesitas para encontrarlo luego.

    rotos revisar https://miweb.es --profundidad 4

El correo sale por SMTP corriente. Servidor, puerto, usuario y destinatario van en un fichero de configuración al lado del programa. Si desde la última pasada no ha aparecido nada nuevo roto, no envía nada. Un aviso diario que casi siempre dice "todo bien" acaba en la papelera sin abrirlo, así que prefiero que solo hable cuando tenga algo que contar.

Espera medio segundo entre petición y petición. Se puede bajar, pero he tenido dos avisos de servidores que me cortaron el acceso por ir demasiado rápido y desde entonces lo dejo así.

Lo que no hace: no ejecuta JavaScript. Si tu web monta los enlaces en el navegador, aquí no los va a ver y te dirá que la página no tiene ninguno. Tampoco distingue un 403 de un servidor que bloquea robots de un 403 de verdad, y esos falsos positivos salen en el correo igual. Los voy marcando a mano en una lista de excepciones.

Lo uso con cron, una vez por semana, los lunes a las seis. Sobre un sitio de unas mil páginas tarda cosa de veinte minutos.
