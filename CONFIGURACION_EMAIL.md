# Configuración de Email/SMTP - Moments

## Descripción
El sistema de Moments envía dos tipos de emails cuando se crea una reserva:
1. **Email de confirmación al cliente** - Con toda la información de la reserva y instrucciones de pago SINPE
2. **Email de notificación al administrador** - Con detalles de la reserva y acciones requeridas

## Pasos para Configurar Gmail (Recomendado)

### 1. Habilitar "App Password" en tu cuenta de Gmail

1. Abre tu cuenta de Google: https://myaccount.google.com
2. Ve a **Seguridad** en el menú izquierdo
3. Si no ves esta opción, primero necesitas **habilitar 2FA (Autenticación de Dos Factores)**:
   - En **Seguridad**, busca **Verificación en dos pasos**
   - Sigue los pasos para habilitarlo
4. Una vez habilitado el 2FA, vuelve a **Seguridad**
5. Busca **Contraseñas de aplicación** (App passwords)
6. Selecciona:
   - Apps: **Correo**
   - Dispositivo: **Windows / Mac / Linux** (según tu SO)
7. Google generará una contraseña de 16 caracteres
8. **Copia esta contraseña** - la necesitarás en el paso siguiente

### 2. Configurar las Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido (reemplaza los valores entre `<>`):

```dotenv
# ================================
# EMAIL - SMTP (Gmail)
# ================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<tu_email_gmail@gmail.com>
SMTP_PASS=<contraseña_de_app_de_16_caracteres>
COMPANY_EMAIL=noreply@moments.cr
ADMIN_EMAIL=<tu_email_administrativo@gmail.com>
SINPE_PHONE=8888-8888
```

### Ejemplo Completo:
```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=moments.transportation@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
COMPANY_EMAIL=noreply@moments.cr
ADMIN_EMAIL=admin@moments.cr
SINPE_PHONE=8888-8888
```

⚠️ **IMPORTANTE**: 
- NO uses tu contraseña de Gmail normal
- Usa la "App Password" generada por Google
- Mantén el archivo `.env` seguro y no lo commits a Git

## Variables Disponibles

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SMTP_HOST` | Servidor SMTP de Google | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto de conexión SMTP | `587` |
| `SMTP_USER` | Tu email de Gmail | `tuusuario@gmail.com` |
| `SMTP_PASS` | Contraseña de aplicación (16 caracteres) | `abcd efgh ijkl mnop` |
| `COMPANY_EMAIL` | Email de empresa (aparece en los correos) | `noreply@moments.cr` |
| `ADMIN_EMAIL` | Email donde recibes notificaciones de reservas | `admin@moments.cr` |
| `SINPE_PHONE` | Número de SINPE para recibir pagos | `8888-8888` |

## Verificar que está Funcionando

### 1. Revisa los Logs del Backend
Cuando se crea una reserva, deberías ver en la consola:
```
[Moments] Log - Correo de confirmación enviado para reserva #cm5xmb3ym00004m7a5wvg6p41
[Moments] Log - Notificación admin enviada para reserva #cm5xmb3ym00004m7a5wvg6p41
```

### 2. Si No Ves Logs de Email
- Verifica que las variables de entorno están correctas en `.env`
- Reinicia el backend: `npm run start:dev`
- Revisa si hay errores:
  ```
  error TS2339: Unable to connect to SMTP
  error TS2339: SMTP_HOST/SMTP_USER/SMTP_PASS no están configurados
  ```

### 3. Prueba una Reserva
1. Ve a la web de Moments: http://localhost:5173
2. Crea una reserva completamente
3. En el paso de pago, selecciona SINPE
4. Completa todos los datos y confirma
5. Deberías recibir dos correos:
   - Uno a tu email del cliente
   - Otro a tu email administrativo

## Solucionar Problemas

### "No recibo los correos"
1. Verifica spam/promociones en Gmail
2. Confirma que las variables están en `.env` (no en `.env.example`)
3. Revisa los logs del backend para ver si hay errores
4. Si ves "SMTP transporter listo" en los logs, la conexión es correcta

### "Error: Invalid login: 535-5.7.8"
- La contraseña de app es incorrecta
- Regenera una nueva "App Password" en tu cuenta de Google

### "Error: timeout"
- El puerto SMTP (587) podría estar bloqueado por tu firewall/ISP
- Intenta con puerto 465: `SMTP_PORT=465` y `SMTP_SECURE=true`

### "Error: Invalid SMTP Host"
- Verifica que `SMTP_HOST=smtp.gmail.com` esté sin espacios
- No incluyas `https://` ni protocolo

## Usar Otro Proveedor de Email

Si prefieres usar otro proveedor (Sendgrid, Mailgun, etc.), solo cambia:
- `SMTP_HOST`: Host del proveedor
- `SMTP_PORT`: Puerto (25, 465, 587, etc.)
- `SMTP_USER`: Tu usuario/API Key
- `SMTP_PASS`: Tu contraseña/Token

Todos los proveedores usan el protocolo SMTP estándar.

## Contenido de los Emails

### Email al Cliente
- ✅ Información completa de la reserva
- ✅ Detalles del paquete y vehículo
- ✅ Desglose de precios y extras
- ✅ Instrucciones para enviar dinero por SINPE
- ✅ Número de SINPE para realizar el pago
- ✅ Información de contacto

### Email al Admin
- ✅ Alerta de nueva reserva
- ✅ Información del cliente
- ✅ Detalles del evento
- ✅ Resumen financiero
- ✅ Lista de extras seleccionados
- ✅ Checklist de próximos pasos

---

**¿Necesitas ayuda?** Revisa los logs del backend o contacta al equipo de desarrollo.
