# Instalación de servidor de correo

## Requisitos previos

Sistema operativo Linux (Ubuntu 20.04 LTS o posterior recomendado). Nombre de dominio configurado y resolutores DNS activos. IP estática asignada. Puertos 25, 110, 143, 587, 993, 995 disponibles y accesibles.

## Instalación de paquetes base

```bash
sudo apt update
sudo apt install postfix dovecot-core dovecot-imapd dovecot-pop3d openssl
```

Durante la instalación de Postfix, selecciona "Internet Site" como tipo de configuración.

## Configuración de Postfix

Edita `/etc/postfix/main.cf`:

```
myhostname = mail.ejemplo.com
mydomain = ejemplo.com
myorigin = $mydomain
inet_interfaces = all
mydestination = $myhostname, $mydomain, localhost.$mydomain, localhost
mynetworks = 127.0.0.0/8, 192.168.1.0/24
```

Reemplaza valores según tu configuración. Reinicia:

```bash
sudo systemctl restart postfix
```

## Configuración de Dovecot

Edita `/etc/dovecot/conf.d/10-mail.conf`:

```
mail_location = maildir:~/Maildir
```

Edita `/etc/dovecot/conf.d/10-auth.conf`:

```
disable_plaintext_auth = no
auth_mechanisms = plain login
```

Edita `/etc/dovecot/conf.d/10-ssl.conf`:

```
ssl = required
ssl_cert = </etc/ssl/certs/mail.ejemplo.com.crt
ssl_key = </etc/ssl/private/mail.ejemplo.com.key
```

Reinicia:

```bash
sudo systemctl restart dovecot
```

## Certificados SSL

Genera certificados autofirmados o utiliza Let's Encrypt:

```bash
sudo certbot certonly --standalone -d mail.ejemplo.com
```

Copia los certificados a las ubicaciones especificadas en la configuración de Dovecot.

## Pruebas de conectividad

```bash
telnet localhost 25
```

Verifica respuesta de Postfix. Similar para puertos 110 (POP3), 143 (IMAP), 587 (SMTP autenticado), 993 (IMAPS), 995 (POP3S).

## Administración de cuentas

Crear usuario para correo:

```bash
sudo useradd -m -s /sbin/nologin usuario@ejemplo.com
sudo passwd usuario@ejemplo.com
```

## Verificación de logs

```bash
sudo tail -f /var/log/mail.log
```

Monitorea errores de conexión, autenticación y envío.

## Firewall

```bash
sudo ufw allow 25/tcp
sudo ufw allow 110/tcp
sudo ufw allow 143/tcp
sudo ufw allow 587/tcp
sudo ufw allow 993/tcp
sudo ufw allow 995/tcp
```

## Mantenimiento

Actualiza regularmente: `sudo apt upgrade`

Monitorea disco: `df -h`

Limpia directorios de correo antiguo según política de retención.

## Respaldo

Copia regulares de `/var/mail/`, `/etc/postfix/`, `/etc/dovecot/`.