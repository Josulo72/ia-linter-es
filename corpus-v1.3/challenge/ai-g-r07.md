# Vatios

Vatios descarga tus datos de consumo eléctrico de la distribuidora y dibuja una gráfica para verlos sin pelearte con hojas de cálculo.

El programa guarda las medidas horarias en un fichero local y genera una gráfica por días. Va bien para comprobar cuánto consume la casa por la noche, qué pasó durante una semana concreta o si ese radiador eléctrico se nota tanto como parece.

## Instalación

Necesitas Python 3.11 o posterior.

```bash
git clone https://github.com/ejemplo/vatios.git
cd vatios
pip install .
```

Configura tus datos en `vatios.toml`:

```toml
distribuidora = "ejemplo"
cups = "ES0000000000000000XX"
salida = "./datos"
```

Las credenciales no van en ese fichero. Se leen de variables de entorno:

```bash
export VATIOS_USUARIO="usuario"
export VATIOS_CLAVE="clave"
```

Para descargar los datos:

```bash
vatios descargar
```

Y para generar la gráfica:

```bash
vatios grafica
```

La imagen se guarda por defecto como `consumo.png`. También puedes elegir un intervalo:

```bash
vatios grafica --desde 2026-01-01 --hasta 2026-01-31
```

Los datos descargados se guardan en CSV, así que puedes abrirlos con LibreOffice, meterlos en otro programa o hacer tus propias cuentas.

Ahora mismo hay conectores para unas pocas distribuidoras. Cada una tiene su web, sus sesiones y sus manías, y a veces cambian cosas sin avisar. Si una descarga deja de funcionar, ejecuta `vatios descargar --debug` y adjunta el registro al abrir una incidencia, quitando antes cualquier dato personal.

No calcula la factura ni intenta adivinar cuánto vas a pagar. Trabaja con consumo en kWh y con los datos que entrega la distribuidora.

## Licencia

Vatios es software libre y se distribuye bajo licencia GPL-3.0.
