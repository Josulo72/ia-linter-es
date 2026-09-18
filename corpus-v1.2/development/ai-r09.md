# rutabus

Biblioteca en JavaScript para calcular rutas de autobús urbano a partir de datos abiertos publicados por los ayuntamientos y consorcios de transporte. Permite encontrar el trayecto más rápido entre dos paradas, incluyendo trasbordos entre líneas.

## Origen del proyecto

Muchas ciudades publican sus horarios y recorridos en formato GTFS (General Transit Feed Specification), pero no siempre existe una forma sencilla de consultarlos desde una aplicación propia. `rutabus` procesa esos ficheros y expone una API en JavaScript para calcular rutas óptimas entre dos puntos cualesquiera de la red.

## Instalación

```bash
npm install rutabus
```

## Ejemplo de uso

```javascript
const { CalculadorRutas } = require('rutabus');

const calculador = new CalculadorRutas();
await calculador.cargarDatosGTFS('./datos/gtfs.zip');

const ruta = calculador.buscarRuta({
  origen: 'Parada Plaza Mayor',
  destino: 'Parada Estación Norte',
  horaSalida: '08:30'
});

console.log(ruta.tiempoTotal);
console.log(ruta.trasbordos);
console.log(ruta.pasos);
```

## Funcionalidades principales

- Carga de datos GTFS desde un archivo ZIP local o una URL remota.
- Cálculo de la ruta más rápida usando el algoritmo RAPTOR.
- Soporte para trasbordos entre distintas líneas de autobús.
- Cálculo de rutas alternativas por si la principal no es viable.
- Caché en memoria para evitar recalcular el grafo de paradas en cada consulta.

## Formato de los datos

El proyecto espera un conjunto de datos GTFS estándar con, al menos, los archivos `stops.txt`, `routes.txt`, `trips.txt` y `stop_times.txt`. Puedes encontrar datos abiertos de transporte en los portales de datos abiertos de tu ayuntamiento o comunidad autónoma.

## Rendimiento

Para una red de tamaño medio (unas 500 paradas), el cálculo de una ruta suele tardar menos de 50 milisegundos tras la carga inicial del grafo.

## Tests

```bash
npm test
```

## Contribuir

Se aceptan contribuciones para añadir soporte a otros modos de transporte (metro, tranvía) o para mejorar el rendimiento del algoritmo de búsqueda. Consulta `CONTRIBUTING.md`.

## Licencia

Apache 2.0
