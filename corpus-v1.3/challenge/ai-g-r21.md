# LimpiaFoto

LimpiaFoto borra metadatos de imágenes antes de subirlas a internet. Le pasas una foto y crea una copia sin datos EXIF que puedan contar más de la cuenta, como la ubicación GPS, el modelo del móvil, la fecha en la que se hizo o el programa con el que se editó.

La imagen no se modifica ni se vuelve a comprimir. El programa abre el fichero, quita los metadatos y guarda el resultado aparte. El original se queda como estaba.

Funciona con JPEG, PNG y WebP.

## Instalación

Necesitas Python 3.11 o posterior.

```bash
pip install limpiafoto
```

También puedes instalar la versión del repositorio:

```bash
git clone https://github.com/ejemplo/limpiafoto.git
cd limpiafoto
pip install .
```

## Uso

Para limpiar una foto:

```bash
limpiafoto foto.jpg
```

Se guardará como `foto_limpia.jpg` en la misma carpeta.

Puedes pasar varias de una vez:

```bash
limpiafoto vacaciones/*.jpg
```

Y elegir otra carpeta para los resultados:

```bash
limpiafoto fotos/*.jpg --salida publicables/
```

Si solo quieres ver qué metadatos tiene un fichero sin tocarlo:

```bash
limpiafoto foto.jpg --mostrar
```

Por defecto no sobrescribe nada. Si ya existe un fichero con el nombre de salida, avisa y lo deja quieto.

## Qué elimina

Quita los campos EXIF, XMP e IPTC que pueda leer del formato. Ahí suelen aparecer coordenadas GPS, fabricante y modelo de cámara, fechas, comentarios y datos del programa de edición.

Algunos programas meten información fuera de esos bloques. No puedo asegurar que una imagen creada con cualquier aplicación rara quede completamente vacía. Para JPEG, PNG y WebP normales lo he probado con fotos de móviles Android, iPhone y varias cámaras y no he encontrado metadatos después de limpiarlas.

## Licencia

LimpiaFoto se publica con licencia MIT.
