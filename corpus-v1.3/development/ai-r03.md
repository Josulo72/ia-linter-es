# identidad-es

`identidad-es` es una biblioteca de Python para validar de forma sencilla documentos de identidad españoles. Permite comprobar la estructura y los dígitos o letras de control de DNI, NIE y NIF, sin depender de servicios externos.

La biblioteca está pensada para formularios, herramientas administrativas, procesos de importación de datos y aplicaciones que necesiten detectar errores básicos antes de almacenar un identificador.

## Instalación

```bash
pip install identidad-es
```

También puedes instalar la versión de desarrollo:

```bash
git clone https://example.org/identidad-es.git
cd identidad-es
pip install -e .
```

## Uso

```python
from identidad_es import validar_dni, validar_nie, validar_nif

validar_dni("12345678Z")
validar_nie("X1234567L")
validar_nif("B12345678")
```

Las funciones devuelven `True` cuando el documento supera la validación y `False` cuando el formato o el carácter de control no son correctos.

También está disponible una función genérica:

```python
from identidad_es import validar

resultado = validar("12345678Z")

print(resultado.valido)
print(resultado.tipo)
```

## Normalización

La biblioteca puede limpiar espacios, convertir letras a mayúsculas y eliminar determinados separadores antes de validar:

```python
from identidad_es import normalizar

normalizar(" 12345678-z ")
```

## Importante

Una validación correcta solo indica que el identificador tiene una estructura y un carácter de control coherentes. `identidad-es` no comprueba que el documento haya sido expedido realmente, que esté vigente ni que pertenezca a una persona o entidad concreta.

No se realizan consultas a bases de datos oficiales y ningún identificador se envía por Internet.

## Desarrollo

Para ejecutar las pruebas:

```bash
pytest
```

Las contribuciones son bienvenidas mediante incidencias y solicitudes de cambios. Si añades nuevos casos, incluye pruebas unitarias que documenten el comportamiento esperado.

## Licencia

`identidad-es` se distribuye bajo licencia MIT. Consulta el archivo `LICENSE` para más detalles.
