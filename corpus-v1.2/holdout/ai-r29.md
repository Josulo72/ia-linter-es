# transcoord

`transcoord` es una biblioteca para convertir coordenadas entre sistemas de referencia geodésicos. Cubre las transformaciones habituales en cartografía, topografía y sistemas de información geográfica, con especial atención a los sistemas utilizados en España y en Latinoamérica.

## Sistemas admitidos

- Geográficas en WGS84, ETRS89, ED50 y SIRGAS2000.
- Proyección UTM en todos sus husos, en cualquiera de los datums anteriores.
- Coordenadas de la Red Geodésica Nacional española.
- Proyección Lambert conforme cónica y Mercator transversa genérica.
- Cualquier sistema definido por su código EPSG, mediante la base de datos incorporada.

## Instalación

```bash
npm install transcoord
```

La biblioteca no tiene dependencias nativas ni necesita PROJ instalado. Funciona igual en Node y en el navegador.

## Uso

```javascript
import { convertir } from "transcoord";

const utm = convertir(
  { lat: 40.4168, lon: -3.7038 },
  { desde: "EPSG:4326", hacia: "EPSG:25830" }
);
// { x: 439888.12, y: 4474184.55, huso: 30 }
```

El sentido inverso funciona igual:

```javascript
const geo = convertir(
  { x: 439888.12, y: 4474184.55 },
  { desde: "EPSG:25830", hacia: "EPSG:4326" }
);
```

## Transformaciones entre datums

El paso de ED50 a ETRS89, y viceversa, admite dos métodos. El de siete parámetros de Helmert es rápido y suficiente para muchos usos:

```javascript
convertir(punto, { desde: "EPSG:4230", hacia: "EPSG:4258", metodo: "helmert" });
```

Para precisión centimétrica hay que usar la rejilla oficial de distorsión del Instituto Geográfico Nacional, que se carga aparte:

```javascript
import { cargarRejilla } from "transcoord/rejillas";
await cargarRejilla("PENR2009.gsb");
```

Sin rejilla cargada, el método `rejilla` lanza un error en lugar de degradarse silenciosamente a Helmert. Es una decisión deliberada: una conversión de precisión que devuelve metros de error sin avisar es peor que una que falla.

## Precisión

Las pruebas comparan más de cuarenta mil puntos de control contra los resultados de PROJ. Las diferencias documentadas se recogen en `PRECISION.md`.

## Licencia

ISC.
