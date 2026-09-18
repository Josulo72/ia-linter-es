# NeighborAccounts

Software de escritorio para llevar las cuentas de un bloque de pisos. Facturas comunes, gastos de comunidad, deudas de vecinos, todo en una app que puedes ejecutar en cualquier ordenador sin necesidad de conectarte a nada en la nube.

Pensado para comunidades sin gestor profesional, donde alguien del bloque se encarga de la administración y necesita algo más simple que un Excel pero no quiere pagar por un software caro.

## Instalación

Descarga el ejecutable de releases. Funciona en Windows, Mac y Linux. No necesita instalación: descomprime y abre. Si quieres compilar desde el código, necesitas Node 18+ y seguir las instrucciones del README de desarrollo.

## Qué puedes hacer

Registra facturas y gastos comunes. El sistema divide automáticamente entre el número de vecinos. Lleva control de cuota asignada a cada piso, quién ha pagado, quién debe. Genera reportes mensuales para ver cómo está la caja. Y emite avisos cuando alguien está atrasado.

Puedes exportar los números a PDF o Excel si necesitas pasarlos a un contador o enseñárselos a la junta.

## Cómo funciona

Todo se guarda en una base de datos local. No se envía nada a internet. Los datos están en tu ordenador y punto. Haces un backup de la carpeta del programa de vez en cuando y listo.

Tienes una pantalla para cada cosa: una lista de vecinos, otra para facturas, otra para pagos recibidos. Los números se actualizan solos cuando registras algo nuevo.

## Limitaciones

No conecta con bancos ni nada de eso. Tienes que meter los pagos a mano cuando el vecino transfiere. No genera documentos automáticos para avisos legales, eso es cosa de un abogado. Y si tu comunidad tiene casas, garajes y trasteros con cuotas distintas, aquí no lo puedes reflejar. Lo simple es lo que funciona.

## Para contribuir

El código es en Electron y JavaScript. Si ves algo que mejore y tienes tiempo, abre un PR. Estamos particularmente abiertos a reportes de bugs reales de usuarios.

GNU GPL v3. Úsalo, modifícalo, comparte.
