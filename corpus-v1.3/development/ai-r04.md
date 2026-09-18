# euroformat

`euroformat` es una pequeña biblioteca de JavaScript para mostrar cantidades de dinero en euros de forma consistente. Está diseñada para aplicaciones web, paneles de administración, tiendas, facturas y cualquier interfaz que necesite convertir valores numéricos en cadenas legibles para el usuario.

La biblioteca utiliza las capacidades de internacionalización del entorno JavaScript y permite controlar aspectos como la configuración regional, los decimales y la posición del símbolo del euro.

## Instalación

Con npm:

```bash
npm install euroformat
```

Con pnpm:

```bash
pnpm add euroformat
```

## Uso básico

```js
import { formatEuro } from "euroformat";

formatEuro(1234.5);
// "1234,50 €" según la configuración utilizada
```

Puedes indicar una configuración regional:

```js
formatEuro(1234.5, { locale: "es-ES" });
```

También es posible controlar el número de decimales:

```js
formatEuro(19, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
```

## API

### `formatEuro(value, options?)`

Formatea un número como una cantidad expresada en euros.

```js
formatEuro(2500.99);
```

`value` debe ser un número finito. Si se recibe un valor no válido, la biblioteca lanza un `TypeError` para evitar resultados ambiguos.

Las opciones disponibles incluyen:

* `locale`: configuración regional utilizada para separadores y formato.
* `minimumFractionDigits`: número mínimo de decimales.
* `maximumFractionDigits`: número máximo de decimales.
* `useGrouping`: activa o desactiva los separadores de miles.

## Compatibilidad

`euroformat` funciona en navegadores modernos y en versiones recientes de Node.js que implementen `Intl.NumberFormat`.

La biblioteca se limita al formato visual. No realiza conversiones de divisas, cálculos fiscales ni operaciones con tipos de cambio.

## Desarrollo

```bash
npm install
npm test
```

Se aceptan informes de errores, mejoras de documentación y solicitudes de cambios acompañadas de pruebas.

## Licencia

`euroformat` es software libre distribuido bajo licencia MIT. Consulta `LICENSE` para obtener el texto completo de la licencia.
