# Garita

Tengo en el tejado una de esas estaciones meteorológicas de cuarenta euros que se venden en cualquier sitio, con su consola de plástico dentro de casa conectada por USB. La consola trae un programa para Windows del que mejor no hablar y una web del fabricante donde suben tus datos. Esta biblioteca habla directamente con la consola y te devuelve las lecturas en Python, sin pasar por ninguna de las dos cosas.

    from garita import Estacion
    e = Estacion("/dev/ttyUSB0")
    m = e.leer()
    print(m.temperatura_exterior, m.humedad, m.presion)

Te da temperatura de dentro y de fuera, humedad de las dos, presión, velocidad y racha de viento, dirección y lluvia acumulada. Además, la consola guarda un histórico en su memoria interna, normalmente de varios meses según cada cuánto esté configurada, y se puede volcar entero de una vez. Ese volcado es lo que uso yo: la estación apunta cada cinco minutos y el ordenador solo se enciende los domingos a recogerlo.

Funciona con la mía, que es de las compatibles con el protocolo WH1080, y con otro modelo distinto de marca que un conocido probó y me contó. Si la tuya usa ese mismo protocolo debería ir; si no, no.

La presión la devuelve tal como la mide el sensor, sin corregir. Para tener el valor al nivel del mar, que es el que dan los partes y con el que puedes comparar, tienes que aplicarle tu altitud. Hay una función que lo hace, pero la altitud se la pones tú porque la estación no tiene ni idea de dónde está.

El sensor de fuera pierde la señal de vez en cuando, sobre todo con lluvia fuerte. Lo malo es que la consola no avisa: te sigue enseñando la última lectura buena como si fuera de ahora. Ahora se compara la marca de tiempo y, si no ha cambiado, la medida viene marcada como dudosa en lugar de colarse en tus datos.
