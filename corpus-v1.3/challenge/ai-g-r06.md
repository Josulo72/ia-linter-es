# Copiafuera

Copiafuera hace copias de seguridad de una carpeta en un disco externo. Le dices qué carpeta quieres guardar y dónde está montado el disco, y copia los archivos que han cambiado desde la última vez.

Está pensado para algo bastante corriente: tener documentos, fotos o proyectos en el ordenador y querer una segunda copia sin montar un servidor ni aprenderse veinte opciones de `rsync`.

## Instalación

Necesitas Python 3.11 o posterior.

```bash
git clone https://github.com/ejemplo/copiafuera.git
cd copiafuera
pip install .
```

Después crea un fichero `copiafuera.toml`:

```toml
origen = "/home/ana/Documentos"
destino = "/media/ana/Backup"
```

Y ejecuta:

```bash
copiafuera
```

La primera copia tarda lo que tenga que tardar porque pasa todo. A partir de ahí compara fechas, tamaños y hashes cuando hace falta, así que normalmente solo copia los archivos nuevos o modificados.

Cada copia se guarda en una carpeta con fecha. Los archivos que no han cambiado se enlazan con la copia anterior, por lo que no ocupan espacio otra vez. Desde fuera parece que tienes varias copias completas, pero el disco no acaba lleno a la tercera semana.

Antes de empezar comprueba que el destino está montado y que parece ser el disco configurado. Si no lo encuentra, sale sin tocar nada. También hay un modo de prueba:

```bash
copiafuera --dry-run
```

Muestra lo que copiaría y borraría, pero no escribe en el disco.

De momento funciona en Linux y macOS. En Windows no lo he probado. Tampoco cifra las copias ni las sube a internet.

## Licencia

Copiafuera se publica bajo licencia MIT. Se aceptan informes de errores y cambios por pull request.
