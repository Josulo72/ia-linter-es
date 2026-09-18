# Malla

Empiezo por lo que casi nunca se cuenta y luego ya vemos lo demás. Pasar de ETRS89 a WGS84 aquí sale bien al centímetro, porque para lo que hace falta en la práctica son el mismo sistema. Pasar a ED50, que es lo que llevan los mapas españoles anteriores a 2007 y buena parte de los datos catastrales antiguos, es una transformación aproximada, y con los parámetros de tres factores que trae por defecto el error anda por los dos metros según la zona. Si estás situando una linde eso no te vale.

Con la rejilla NTv2 del Instituto Geográfico Nacional, que se descarga aparte y se le indica en la configuración, ese mismo cambio baja a unos veinte centímetros. La rejilla no la incluyo porque tiene su propia licencia.

Hecha la advertencia, esto convierte coordenadas entre geográficas y UTM en los husos 28 al 31, que son los de España con Canarias, y entre ETRS89, WGS84 y ED50. Sirve como biblioteca y como comando.

    malla convertir --de EPSG:4326 --a EPSG:25830 -3.7038 40.4168

No pretende ser proj. Si necesitas el catálogo EPSG entero, proyecciones raras o trabajar en medio mundo, usa proj y olvídate de esto. Aquí la gracia es que no arrastra dependencias ni bases de datos y cabe en un par de ficheros, que para un proyecto que solo toca España es bastante alivio.

Solo trabaja en horizontal. Las alturas las deja pasar sin tocarlas y no convierte altura elipsoidal en altura ortométrica, que es lo que uno llama altura sobre el nivel del mar. Para eso hace falta un modelo de geoide y tampoco lo trae.

Las pruebas comparan contra los puntos de la red geodésica publicados por el IGN, que son unos cuantos y vienen con sus coordenadas en los tres sistemas.
