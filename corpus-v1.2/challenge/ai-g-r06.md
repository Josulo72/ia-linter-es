Guardafuera copia una carpeta a un disco externo. Le dices qué carpeta y a qué disco, y se encarga de copiar lo que ha cambiado, nada más.

Lo hice porque me cansé de arrastrar carpetas a mano y acabar sin saber qué versión tenía copiada. El script mira las fechas de los archivos y solo copia los que son nuevos o se han modificado. Si borras algo en el origen, de momento se queda en el disco externo, no lo borra él.

## Instalación

Necesitas Python 3.10 o más nuevo. No hay más dependencias.

```
git clone https://github.com/usuario/guardafuera
cd guardafuera
python guardafuera.py --origen /home/tu-usuario/documentos --destino /media/disco-externo/copias
```

## Uso

Cada vez que lo ejecutas compara origen y destino y copia la diferencia. Puedes meterlo en una tarea programada, con cron por ejemplo, y olvidarte:

```
0 22 * * * python /ruta/guardafuera.py --origen /home/tu-usuario/documentos --destino /media/disco-externo/copias
```

Con `--simulacion` te dice qué copiaría sin tocar nada, para probar antes de fiarte.

## Qué falta

No comprime ni cifra nada, así que si el disco se pierde, quien lo encuentre ve tus archivos tal cual. Tampoco funciona todavía en Windows, solo lo he probado en Linux y en un Mac viejo que tengo por casa. Y si el disco se desconecta a media copia, el script se para sin avisar por ningún otro lado que la terminal.

Es software libre, licencia MIT. Si lo usas y algo no te cuadra, abre un issue.
