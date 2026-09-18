# euros

euros es una biblioteca pequeña de JavaScript para mostrar cantidades en euros sin tener que repetir `Intl.NumberFormat` por todo el proyecto.

Le pasas un número y devuelve una cadena lista para enseñar en pantalla.

```js
euros(1234.5)
// "1.234,50 €"
```

Por defecto usa el formato habitual de España, con coma para los decimales, punto para los miles y dos decimales.

## Instalación

```bash
npm install euros
```

## Uso

```js
import { euros } from "euros";

euros(12);
euros(12.5);
euros(1234.56);
euros(-9.99);
```

También acepta algunas opciones.

```js
euros(1234.5, {
  decimales: 0
});
```

Puedes ocultar el símbolo si solo necesitas el número:

```js
euros(1234.5, {
  simbolo: false
});
```

Y cambiar la configuración regional cuando la interfaz no esté en español:

```js
euros(1234.5, {
  locale: "en-IE"
});
```

La moneda sigue siendo EUR. Esta biblioteca no convierte divisas ni consulta tipos de cambio.

## Valores incorrectos

`euros` espera un número finito. Si recibe `NaN`, `Infinity`, una cadena o cualquier otra cosa que no sea un número válido, lanza `TypeError`.

```js
euros("12.50");
// TypeError
```

He preferido no convertir cadenas automáticamente porque `"1.234,50"` puede significar cosas distintas según de dónde venga el dato.

## Navegadores y Node.js

La biblioteca usa `Intl.NumberFormat`, así que funciona en navegadores modernos y en versiones actuales de Node.js. No lleva dependencias.

El paquete incluye módulos ESM y tipos para TypeScript.

```ts
import { euros } from "euros";

const total: string = euros(19.95);
```

## Desarrollo

Para instalar las dependencias:

```bash
npm install
```

Y para ejecutar los tests:

```bash
npm test
```

Las pruebas cubren redondeos, cantidades negativas, miles, decimales y varias configuraciones regionales.

## Licencia

MIT.
