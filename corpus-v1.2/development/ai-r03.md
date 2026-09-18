# docid-validator

Librería para validar documentos de identidad españoles. Comprueba que un DNI, NIE o pasaporte sea válido sin salir de tu código. Útil si estás haciendo un formulario de registro, un sistema de verificación de usuarios, o simplemente necesitas comprobar que lo que alguien escribió tenga sentido.

## Instalación

```
pip install docid-validator
```

Funcionan Python 3.8+.

## Uso básico

```python
from docid import validate

resultado = validate("12345678Z")
if resultado.es_valido:
    print(f"DNI correcto: {resultado.numero}")
else:
    print(f"Error: {resultado.mensaje}")
```

La función devuelve un objeto con el resultado. Si es válido, tienes el número normalizado. Si no, te dice por qué falló.

## Qué valida

DNI (8 dígitos + letra), NIE (X, Y o Z + 7 dígitos + letra) y pasaportes españoles. También reconoce si están mal formateados pero tienen números válidos y te lo corrige.

El algoritmo de validación es el oficial: los números se reducen con módulo 23 y se comparan con la letra. Para el NIE hay una regla un poco distinta. Todo lo hace la librería sin que tengas que pensar en ello.

## Características

Normaliza la entrada (quita espacios, convierte a mayúsculas). Detecta si es un DNI, NIE o pasaporte automáticamente. Y si pasas un documento duplicado o inválido, te lo dice claro.

## Limitaciones

Solo valida formalmente. No te dice si la persona existe realmente. Para eso necesitarías acceso a bases de datos administrativas que no tenemos aquí. También asume que los pasaportes cumplen el formato español; hay variaciones según el país.

## Contribuir

Si encuentras un formato que no reconocemos, abre un issue. Los tests están en `/tests` si quieres meterte a mirar la lógica de validación.

Licencia MIT. Copia, modifica, usa como quieras.
