# Guía de implantación de la autenticación en dos pasos (2FA)

Dirigida a organizaciones de entre 5 y 50 personas sin departamento de sistemas dedicado.

## 1. Por qué, en una línea

La inmensa mayoría de los accesos no autorizados a cuentas corporativas se producen mediante contraseñas robadas, reutilizadas o adivinadas. Un segundo factor corta ese vector casi por completo, y la implantación se mide en horas, no en semanas.

## 2. Elegir el segundo factor

Ordenados de mayor a menor seguridad:

| Método | Resistente a phishing | Coste | Comentario |
|---|---|---|---|
| Llave de seguridad FIDO2 / passkey | Sí | 25-60 € por llave | Recomendado para administradores y dirección |
| Aplicación TOTP (Authy, Aegis, Microsoft/Google Authenticator) | No | 0 € | Opción por defecto para el resto de la plantilla |
| Notificación push con número coincidente | Parcial | Incluido en la suscripción | Aceptable si el proveedor lo ofrece |
| **SMS** | **No** | Bajo | **Desaconsejado.** Vulnerable a *SIM swapping*. Úsese solo como último recurso |

Criterio práctico: **TOTP para todos, llave física obligatoria para quien tenga privilegios de administrador.**

## 3. Inventario previo

Antes de tocar nada, haz una lista de los servicios que contienen datos de la empresa. Suele haber más de los esperados:

- Proveedor de identidad y correo (Microsoft 365, Google Workspace)
- Gestor de contraseñas
- Banca electrónica y plataformas de pago
- Alojamiento web, DNS y registrador de dominios
- Repositorios de código (GitHub, GitLab)
- CRM, ERP, facturación
- Redes sociales corporativas
- VPN y acceso remoto

Marca cuáles admiten 2FA y cuáles permiten **imponerlo** a nivel de organización. Esa segunda columna es la importante: la activación voluntaria alcanza al 20 % de la plantilla y se queda ahí.

## 4. Orden de despliegue

1. **Cuentas de administrador.** Empieza por ti. Si te bloqueas, es mejor descubrirlo con una cuenta y no con cuarenta.
2. **Registrador de dominios y DNS.** Quien controla el dominio controla el correo, y quien controla el correo recupera cualquier otra contraseña.
3. **Proveedor de identidad para toda la plantilla**, con periodo de gracia de 14 días.
4. **Resto de servicios**, por orden de sensibilidad.

## 5. Códigos de recuperación

Cada servicio genera entre 8 y 10 códigos de un solo uso en el momento de activar el 2FA. Es el punto que más incidencias provoca.

- Guárdalos en el gestor de contraseñas corporativo, **nunca** en la misma bóveda protegida por el factor que quieren recuperar.
- Conserva además una copia impresa de los códigos de las cuentas críticas en un lugar cerrado con llave.
- Designa a dos personas con capacidad de restablecer el segundo factor de otros usuarios. Una sola persona es un punto único de fallo; tres, un riesgo innecesario.

## 6. Procedimiento de teléfono perdido

Documéntalo en una página y difúndelo antes de que haga falta:

1. El usuario avisa por un canal alternativo (llamada, no correo).
2. El administrador verifica la identidad **por videollamada o en persona**, nunca solo por mensaje.
3. Se revoca la sesión activa en todos los dispositivos.
4. Se restablece el segundo factor y se registra el nuevo dispositivo.
5. Se anota la incidencia con fecha y responsable.

## 7. Comunicación a la plantilla

Anuncia con dos semanas de antelación, explica el motivo con un ejemplo real y ofrece una sesión de quince minutos para hacer el registro en grupo, con el móvil en la mano. La resistencia al 2FA casi siempre es desconocimiento, no rechazo.

## 8. Verificación posterior

Al mes, revisa el informe de cobertura del proveedor de identidad y confirma que no queda ninguna cuenta sin segundo factor, incluidas las genéricas del tipo `info@` o `administracion@`. Repite la revisión cada trimestre.
