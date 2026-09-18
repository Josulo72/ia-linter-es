# euro-format

Una librería JS para darle forma a números cuando hablas de dinero en euros. Te cansa estar haciendo `parseFloat().toFixed(2)` cada vez que necesitas mostrar un precio. Esta hace eso, pero bien.

## Instalación

```
npm install euro-format
```

O si usas yarn:

```
yarn add euro-format
```

## Usar

```javascript
import { format } from 'euro-format';

console.log(format(1234.5));      // 1.234,50 €
console.log(format(99));           // 99,00 €
console.log(format(0.1));          // 0,10 €
```

Eso es todo. Toma un número, lo deja con dos decimales, pone el símbolo del euro y listo. 

## Opciones

Si quieres cambiar algo:

```javascript
format(1234.5, { 
  symbol: false,           // Sin el símbolo €
  decimals: 0,            // Sin decimales
  locale: 'en-US'         // Otro formato
});
```

## Lo que es normal

Respeta el formato de España. Coma para decimales, punto para miles. Si necesitas otro país, tienes la opción locale. Maneja números negativos, muy grandes, y incluso valores que no se pueden representar bien en JavaScript (que pasa, ya lo sé).

## Lo que no

No hace conversiones de divisa. Si tienes dólares y quieres euros, la cambiar el número y ya está. Tampoco valida si el número es realista o no; si le pasas 999999999999, lo formatea sin problemas.

## Casos especiales

Cuando el número es cero, devuelve "0,00 €". Los números negativos tienen el signo delante. Si le pasas algo que no es número, lanza un error así que ten cuidado.

## Contribuir

Si encuentras un bug o se te ocurre una opción que falta, abre un issue. Los tests están en jasmine si quieres correr los propios.

MIT License. Libre para usar.
