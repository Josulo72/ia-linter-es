dibujahorario coge un horario de clase, en un formato sencillo de texto, y genera una imagen con la tabla ya dibujada, lista para imprimir o mandar por el grupo de la clase.

La hice porque cada septiembre alguien del grupo se pone a montar el horario en una hoja de cálculo y queda torcido, con colores que no se ven bien impresos en blanco y negro. Esto lo resuelve dándole el horario en un archivo de texto y sacando una imagen limpia.

## Instalación

```
pip install dibujahorario
```

## Uso

El horario se describe en un archivo YAML:

```yaml
lunes:
  - hora: "09:00-10:00"
    asignatura: "Matemáticas"
    aula: "204"
martes:
  - hora: "10:00-11:00"
    asignatura: "Historia"
    aula: "108"
```

Y se genera así:

```
dibujahorario horario.yaml --salida horario.png
```

Se puede elegir tamaño de imagen y si quieres fondo blanco o transparente, con `--ancho`, `--alto` y `--transparente`.

## Qué falta

Los colores de las asignaturas se asignan solos, por orden, y de momento no se pueden elegir a mano, aunque es de las cosas que más me piden y caerá pronto. Tampoco admite horas que crucen la medianoche, algo que en la universidad no pasa pero en un horario de turnos de trabajo sí, así que para eso todavía no sirve.

Con más de ocho franjas horarias en el mismo día la imagen queda un poco apretada, hay que jugar con el alto para que se lea bien.

Licencia MIT.
