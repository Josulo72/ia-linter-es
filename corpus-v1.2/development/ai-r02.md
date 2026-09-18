# PhotoRename

Tienes una carpeta llena de fotos de vacaciones, de la boda, del viaje de negocios. La cámara las nombra con esos códigos raros que no significan nada: DSC00523, IMG_3301, eso. Este script las renombra en lote usando la fecha que está guardada dentro de la foto.

El resultado es que tus fotos quedan organizadas con nombres que puedes leer: 2024-06-15_14-32-45, y así puedes buscarlas o entender cuándo fueron sin abrir cada una.

## Para empezar

Descarga el código y corre `node rename.js`. Necesitas Node 14 o más nuevo. En Mac y Linux funciona sin problema. Windows también, pero algunos caracteres raros pueden dar lata en las rutas.

## Cómo usarlo

Mete tus fotos en una carpeta. Abre el terminal y ejecuta el comando con la ruta de esa carpeta. El programa lee el metadata de cada imagen, agarra la fecha de cuándo se sacó, y renombra el archivo. Deja los originales intactos en la misma carpeta.

```
node rename.js /ruta/a/mis/fotos
```

Eso es. Si todo va bien, en un segundo ves el cambio. Si algo falla, te lo dice.

## Características

Mantiene la extensión original (.jpg, .png, .raw). Si hay dos fotos de exactamente el mismo segundo, añade un número al final para que no se sobrescriba una a la otra. El formato de nombre es configurable, puedes cambiar si quieres que sea ISO o un estilo distinto.

## Limitaciones

Depende de que la cámara haya guardado bien la fecha. Si descargaste fotos de internet o alguien las editó, a veces la fecha desaparece. En esos casos, el script ignora la foto y te avisa. También funciona mejor con JPEG y PNG que con formatos más raros.

## Contribuir

Si la cámara que usas guarda la fecha de una forma extraña, abre un issue. Nos interesa soportar más dispositivos.

MIT License. Úsalo libremente.
