# Integración SendGrid - Guía de Configuración

## 📧 ¿Qué es SendGrid?

SendGrid es un servicio de email en la nube que permite enviar emails transaccionales de forma confiable y escalable. Lo usamos para:
- Confirmación de reservas
- Notificaciones de pago
- Recuperación de contraseña
- Etc.

## 🚀 Pasos para Configurar SendGrid

### 1. Crear Cuenta en SendGrid

1. Ve a [SendGrid](https://sendgrid.com/)
2. Haz clic en "Sign Up"
3. Completa el formulario con tus datos
4. Verifica tu email
5. Completa el onboarding inicial

### 2. Obtener API Key

1. Ve al [SendGrid Dashboard](https://app.sendgrid.com/)
2. En el menú lateral, ve a **Settings** → **API Keys**
3. Haz clic en "Create API Key"
4. Asigna un nombre descriptivo: `Moments_Backend`
5. Selecciona los permisos necesarios:
   - ✅ Mail Send (Full Access)
   - ✅ Mail Send (restricted - si solo quieres enviar)
6. Haz clic en "Create & View"
7. **Copia la API Key** (solo la verás una vez)

### 3. Configurar Variables de Entorno

En tu archivo `.env` del backend, agrega:

```dotenv
# SendGrid Email Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
COMPANY_EMAIL=noreply@moments.cr
SINPE_PHONE=8888-8888
```

**Reemplaza:**
- `SG.xxxx...` con tu API Key real
- `noreply@moments.cr` con tu email verificado en SendGrid
- `8888-8888` con el número real de SINPE Móvil

### 4. Verificar Email Remitente en SendGrid

Para que SendGrid envíe emails con tu dominio:

**Opción A: Single Sender (Desarrollo)**
1. Ve a **Settings** → **Sender Authentication** → **Single Sender**
2. Haz clic en "Create New Sender"
3. Completa con:
   - **From Email Address:** `noreply@moments.cr`
   - **From Name:** `Moments Transportation`
   - **Reply To Email:** `pagos@moments.cr` (o tu email de contacto)
4. Completa con información de contacto
5. Verifica el email

**Opción B: Domain Authentication (Producción)**
1. Ve a **Settings** → **Sender Authentication** → **Authenticate Your Domain**
2. Sigue las instrucciones para agregar registros CNAME a tu DNS
3. Espera verificación (puede tomar 24-48 horas)

### 5. Probar la Integración

En el backend, cuando se crea una reserva con método de pago SINPE:

1. Se activa automáticamente el envío de email
2. El cliente recibe un correo con:
   - Detalles de la reserva
   - Número de SINPE a enviar el dinero
   - Instrucciones paso a paso
   - Información de coordinación

### 6. Monitorear Emails

En SendGrid Dashboard:
1. Ve a **Mail Activity**
2. Filtra por:
   - **Status:** Delivered, Bounce, etc.
   - **From:** noreply@moments.cr
3. Revisa logs de errores si es necesario

## 📋 Campos Configurables en el Email

En `src/common/email/email.service.ts` puedes personalizar:

```typescript
// Número de SINPE
private readonly SINPE_PHONE = process.env.SINPE_PHONE || '8888-8888';

// Email de contacto
private readonly COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'pagos@moments.cr';

// Nombre de la empresa
private readonly COMPANY_NAME = 'Moments Transportation CR';
```

## 🔐 Mejores Prácticas de Seguridad

1. **Nunca commits APIs Keys** en git
   - Usa variables de entorno
   - Agrega `.env` a `.gitignore`

2. **Rotación de APIs Keys**
   - Cambia la API Key cada 3-6 meses
   - Revoca keys antiguas en SendGrid

3. **Límites de tasa (Rate Limiting)**
   - SendGrid tiene límites según tu plan
   - Plan gratuito: 100 emails/día
   - Planes pagos: muchísimo más

4. **IP Whitelisting (Opcional)**
   - Ve a **Settings** → **IP Whitelisting**
   - Agrega solo las IPs de tu servidor

## 📊 Plan SendGrid Recomendado

| Plan | Emails/Mes | Precio | Ideal Para |
|------|-----------|--------|-----------|
| **Free** | 100 | $0 | Desarrollo |
| **Essentials** | 100,000+ | $9.95 | Pequeño negocio |
| **Pro** | Ilimitado | $99.95+ | Escala |
| **Enterprise** | Personalizado | Contactar | Grandes volúmenes |

## 🆘 Troubleshooting

### Error: "Invalid API Key"
- Verifica que copiaste correctamente la API Key
- Revisa que la key empiece con `SG.`
- Recrea la key si es necesario

### Error: "Unauthorized email sender"
- El email remitente no está verificado en SendGrid
- Ve a Sender Authentication y verifica el email

### Los emails no llegan
- Revisa **Mail Activity** en SendGrid para el estado
- Verifica que el email del cliente sea válido
- Revisa la carpeta de SPAM

### Rate Limit alcanzado
- Plan gratuito tiene límite de 100 emails/día
- Upgrade a plan pagado si necesitas más

## 📝 Template de Email

El template actual incluye:
- ✅ Detalles de la reserva
- ✅ Información de precio
- ✅ Instrucciones de SINPE Móvil
- ✅ Pasos para completar el pago
- ✅ Información de coordinación de pickup
- ✅ Términos y condiciones
- ✅ Diseño responsive

Para personalizar el template, edita el método `buildReservationEmailHTML()` en `email.service.ts`.

## 🎯 Próximos Pasos

1. Crear account en SendGrid
2. Obtener API Key
3. Configurar variables de entorno (.env)
4. Verificar email remitente
5. Hacer una prueba de reserva
6. Verificar que el email llegue correctamente

¡Listo! 🎉
