MiConsumo se conecta a la web de tu distribuidora eléctrica, baja los datos de consumo hora a hora y te pinta una gráfica. Nada de apuntarlo a mano ni de mirar el PDF de la factura.

Lo escribí para Iberdrola y Endesa, que son las que he podido probar. Si usas otra distribuidora seguramente haga falta tocar el código, porque cada una expone los datos de una forma distinta y no hay un estándar común. Iré añadiendo más según me vayan haciendo falta o alguien mande un PR.

## Instalación

```
pip install miconsumo
```

Hace falta Python 3.11 y una cuenta activa en la web de tu distribuidora.

## Uso

```
miconsumo --usuario tu_usuario --distribuidora iberdrola --dias 30
```

Te genera un archivo `consumo.png` con la curva de los últimos días y un `consumo.csv` con los datos en bruto, por si los quieres mirar en otro sitio. Si prefieres verlo en el navegador, añade `--web` y monta un servidor local en el puerto 8000.

## Qué falta

Las credenciales se guardan sin cifrar en un archivo de configuración en tu carpeta personal. Ya sé que no es lo ideal, está en la lista, pero de momento es así, así que no lo uses en un ordenador compartido. Tampoco distingue entre potencia contratada y consumo real en la gráfica, solo dibuja el consumo.

Las distribuidoras cambian su web de vez en cuando y esto se rompe. Si un día deja de funcionar, seguramente sea por eso, no dudes en avisar.

Licencia GPL-3.0.
