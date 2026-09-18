# Consumo Eléctrico Distribuidora

Aplicación de escritorio en Python que se conecta a la web de la distribuidora eléctrica, descarga los datos de consumo horario del usuario y genera una gráfica visual para facilitar su interpretación.

## ¿Qué hace este proyecto?

Muchas distribuidoras publican el consumo eléctrico en portales web poco accesibles y difíciles de analizar. Este proyecto automatiza la descarga de esos datos y los transforma en gráficas claras, permitiendo detectar picos de consumo, comparar días y meses, y tomar decisiones informadas sobre el uso de la energía en el hogar.

## Funcionalidades

- Inicio de sesión automático en el portal de la distribuidora mediante credenciales guardadas localmente.
- Descarga de los datos de consumo horario en formato CSV.
- Generación de gráficas diarias, semanales y mensuales con `matplotlib`.
- Exportación de las gráficas en formato PNG y PDF.
- Almacenamiento histórico en una base de datos SQLite local.

## Instalación

```bash
git clone https://github.com/usuario/consumo-electrico.git
cd consumo-electrico
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configuración

Antes de ejecutar la aplicación, crea un archivo `.env` con tus credenciales de acceso al portal de la distribuidora. El archivo `.env.example` incluido en el repositorio muestra las variables necesarias.

## Uso

```bash
python main.py --descargar --desde 2024-01-01 --hasta 2024-01-31
python main.py --graficar --periodo mensual
```

Las gráficas generadas se guardan por defecto en la carpeta `graficas/`.

## Estructura del proyecto

```
consumo-electrico/
├── main.py
├── descargador/
├── graficos/
├── datos/
└── requirements.txt
```

## Aviso importante

Este proyecto no está afiliado a ninguna distribuidora eléctrica. El acceso a los datos se realiza mediante las credenciales personales del usuario y respetando los términos de uso del portal correspondiente.

## Contribuciones

Cualquier aportación es bienvenida, especialmente para dar soporte a nuevas distribuidoras. Consulta el archivo `CONTRIBUTING.md` para más detalles.

## Licencia

Publicado bajo licencia GPL-3.0.
