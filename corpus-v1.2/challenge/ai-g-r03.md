# ValidaDNI

Una biblioteca de Python que valida si un DNI español es correcto. Pasas la cadena con el número de identidad y te dice si es válido o no, incluyendo el cálculo de la letra.

Funciona con DNI nacional, NIE de extranjeros y CIF de empresas. Detecta errores obvios, como cuando alguien mete un dígito mal o los números y la letra no casa.

Se usa en una línea. Importas el módulo, llamas a la función con el DNI y te devuelve verdadero o falso. Nada de configuraciones raras. Si necesitas además extraer la información, tienes métodos para acceder a cada parte por separado.

La letra se calcula siguiendo el algoritmo oficial. Si alguien te pasa un DNI con la letra equivocada, lo sabes. Útil para validar formularios, importar datos de clientes, o revisar lotes de números.

Se instala con pip en tu proyecto Python. Compatible con versiones recientes de Python. No depende de librerías externas raras, solo de cosas que ya tienes.

También comprueba el formato básico. Si metes un DNI con caracteres que no corresponden, te lo dice. No intenta interpretar NIEs con guiones o espacios, tienes que pasar lo que viene.

Hay un caso especial con los DNIs anteriores a los años 80 que en algunas provincias usan otro algoritmo. Lo tengo documentado en el README, pero aplicar eso es manual por ahora.

La usamos en el trabajo para validar cuando alguien crea una cuenta. El tiempo de respuesta es instantáneo. Para lotes grandes, la velocidad es más que aceptable.

Contribuciones son bien recibidas. Si encuentras un caso que no funciona, abre una issue con el número de prueba y lo revisamos.
