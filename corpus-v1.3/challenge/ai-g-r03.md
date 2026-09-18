# dni-es

dni-es es una biblioteca de Python para comprobar documentos de identidad españoles. Valida DNI, NIE y CIF/NIF de personas jurídicas, incluyendo la letra o el dígito de control.

La idea es hacer una cosa pequeña y hacerla bien. Le pasas un valor y te dice si cumple las reglas del documento. No consulta registros oficiales y no puede decirte si ese documento pertenece de verdad a una persona o empresa.

## Instalación

```bash
pip install dni-es
```

Requiere Python 3.9 o posterior y no tiene dependencias externas.

## Uso

```python
from dni_es import validar_dni, validar_nie, validar_nif

validar_dni("12345678Z")
validar_nie("X1234567L")
validar_nif("B12345678")
```

Las funciones devuelven `True` o `False`.

También hay una función general cuando no sabes qué tipo de documento vas a recibir:

```python
from dni_es import validar

validar("12345678Z")
```

Antes de validar se quitan espacios y guiones y se pasan las letras a mayúsculas. Por ejemplo, `12 345 678-z` se trata igual que `12345678Z`.

Si necesitas saber el tipo detectado:

```python
from dni_es import identificar

identificar("X1234567L")
```

Devuelve `"nie"`, `"dni"`, `"nif"` o `None`.

## Qué comprueba

Para DNI y NIE se calcula la letra de control según el número. Para NIF de entidades se aplican las reglas correspondientes a la letra inicial y se comprueba el carácter de control cuando toca.

La biblioteca valida el formato y los cálculos. Nada más. Un número puede ser matemáticamente válido y no existir en ningún registro real.

## Errores

Las funciones de validación normales no lanzan una excepción por recibir un documento mal escrito. Devuelven `False`.

Sí lanzan `TypeError` si les pasas algo que no sea una cadena:

```python
validar_dni(12345678)
```

## Desarrollo

Los tests se ejecutan con:

```bash
pytest
```

He incluido casos válidos, letras incorrectas, longitudes raras y entradas con espacios o guiones. Si encuentras un caso que se nos haya escapado, abre un issue con un ejemplo que no contenga datos personales reales.

## Licencia

MIT.
