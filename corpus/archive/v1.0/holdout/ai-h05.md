# ¿Qué es una API REST?

Una API REST (Interfaz de Programación de Aplicaciones Representacional State Transfer) es un conjunto de reglas y estándares que permite que diferentes aplicaciones se comuniquen entre sí a través de Internet. REST es un estilo arquitectónico que simplifica cómo los sistemas intercambian información.

## Conceptos fundamentales

Una API REST se basa en HTTP, el protocolo que usan los navegadores web. En lugar de inventar un nuevo sistema de comunicación, REST aprovecha tecnología existente y conocida. Esto hace que sea relativamente fácil de entender e implementar.

El concepto central de REST es el **recurso**. Un recurso es cualquier entidad que quieras exponer: un usuario, una publicación, un producto, un pedido. Cada recurso tiene una **dirección única**, llamada URL o endpoint. Por ejemplo:

```
/api/usuarios/123
/api/productos/456
/api/ordenes
```

## Operaciones básicas: métodos HTTP

REST define cinco operaciones fundamentales usando métodos HTTP estándar:

**GET**: Obtener datos. Solicita información sin modificar nada.
```
GET /api/usuarios/123
```
Devuelve los datos del usuario con ID 123.

**POST**: Crear un nuevo recurso.
```
POST /api/usuarios
```
Con datos en el cuerpo, crea un nuevo usuario.

**PUT**: Actualizar un recurso existente completamente.
```
PUT /api/usuarios/123
```
Reemplaza todos los datos del usuario 123 con los nuevos.

**PATCH**: Actualización parcial.
```
PATCH /api/usuarios/123
```
Modifica solo ciertos campos del usuario 123.

**DELETE**: Eliminar un recurso.
```
DELETE /api/usuarios/123
```
Borra el usuario con ID 123.

## Características de REST

**Sin estado**: Cada solicitud contiene toda la información necesaria. El servidor no necesita recordar estado previo. Esto simplifica escalabilidad.

**Representación de recursos**: Los datos se envían típicamente en JSON, aunque pueden usarse otros formatos. JSON es legible y universal.

**Códigos de respuesta**: El servidor indica el resultado con códigos HTTP:
- 200: OK, solicitud exitosa
- 201: Created, recurso creado
- 400: Bad Request, error del cliente
- 404: Not Found, recurso no existe
- 500: Internal Server Error, error del servidor

## Ejemplo práctico

Imagina una aplicación de biblioteca:

```
GET /api/libros → Devuelve lista de libros
POST /api/libros → Añade un nuevo libro
GET /api/libros/5 → Obtiene detalles del libro 5
PUT /api/libros/5 → Actualiza el libro 5
DELETE /api/libros/5 → Elimina el libro 5
```

## Ventajas

REST es simple de usar y entender. Aprovecha herramientas estándar de web. Es flexible: funciona con cualquier tipo de dato. Escala bien: muchos servidores pueden servir la misma API sin coordinación compleja.

REST ha se convertido en el estándar de facto para APIs web porque funciona, es predecible y cualquier desarrollador puede entenderlo rápidamente.