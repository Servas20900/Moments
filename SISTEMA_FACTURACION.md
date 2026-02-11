# Sistema de Facturación Profesional - Moments Transportation CR

## 📋 Descripción General

Se ha implementado un sistema completo de facturación profesional que genera números de factura únicos, los almacena de manera segura en la base de datos y los incluye en todas las comunicaciones por correo electrónico con clientes y administradores.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **InvoiceService** (`backend/src/common/invoice/invoice.service.ts`)
   - Servicio dedicado a la generación y gestión de números de factura
   - Genera números secuenciales únicos diarios con formato profesional
   - Proporciona métodos de validación, búsqueda y estadísticas

2. **Prisma Schema** (Campo en modelo `Reserva`)
   - Columna `numeroFactura: String @unique` en tabla `reservas`
   - Índice único para garantizar unicidad
   - Índice secundario para búsquedas rápidas

3. **Email Integration**
   - Templates actualizados para mostrar número de factura prominentemente
   - Interfaz `ReservationEmailData` extendida con campo `numeroFactura`
   - Ambos correos (cliente y admin) muestran la factura

## 📊 Formato del Número de Factura

```
MOM-YYYYMMDD-NNNNN

Estructura:
- MOM: Prefijo de la empresa (Moments)
- YYYYMMDD: Fecha actual (ej: 20260210)
- NNNNN: Número secuencial de 5 dígitos con ceros (00001, 00002, etc.)

Ejemplos:
- MOM-20260210-00001  (Primera factura del 10 de febrero de 2026)
- MOM-20260210-00002  (Segunda factura del mismo día)
- MOM-20260211-00001  (Primera factura del 11 de febrero - se reinicia contador)
```

## 🔧 Implementación Técnica

### 1. Generación de Números de Factura

Ubicación: `backend/src/common/invoice/invoice.service.ts`

```typescript
async generateInvoiceNumber(): Promise<string>
```

**Lógica:**
- Obtiene la fecha actual
- Consulta la base de datos para contar facturas del día
- Genera número secuencial: contador del día + 1
- Formatea con ceros a la izquierda: `(contador + 1).toString().padStart(5, '0')`
- Retorna formato completo: `MOM-YYYYMMDD-NNNNN`

**Inyección en Reserva:**
```typescript
// En ReservationsService.createReservation()
const numeroFactura = await this.invoiceService.generateInvoiceNumber();
// Luego se guarda en la base de datos con reserva.create()
```

### 2. Almacenamiento en Base de Datos

Migración aplicada: `20260210221332_add_numero_factura`

**SQL generado:**
```sql
ALTER TABLE "reservas" ADD COLUMN "numeroFactura" TEXT;
CREATE UNIQUE INDEX "reservas_numeroFactura_key" ON "reservas"("numeroFactura");
CREATE INDEX "reservas_numeroFactura_idx" ON "reservas"("numeroFactura");
```

**Estado:**
- ✅ Migración aplicada exitosamente
- ✅ Campo disponible en todas las nuevas reservas
- ✅ Índice único previene duplicados

### 3. Integración en Correos Electrónicos

#### Email del Cliente
```html
<div class="header">
  <h1>Reserva Confirmada</h1>
  <p>Factura #<strong>MOM-20260210-00001</strong></p>
  <p style="font-size: 12px; opacity: 0.8;">Referencia: #[reservaId]</p>
</div>
```

#### Email del Administrador
```html
<div class="header">
  <h1>🆕 Nueva Reserva Recibida</h1>
  <p>Factura #<strong>MOM-20260210-00001</strong> | Reserva #[reservaId]</p>
</div>
```

## 📧 Flujo de Correos Mejorado

### Cliente
1. Recibe correo de confirmación con:
   - Número de factura prominente en encabezado
   - Detalles completos de la reserva
   - Instrucciones de SINPE
   - Información de coordinación

### Administrador
1. Recibe notificación operacional con:
   - Número de factura para referencia rápida
   - ID de reserva como backup
   - Información completa del cliente
   - Checklist de operaciones
   - Resumen financiero (anticipo, pendiente, total)

## 🔍 Métodos Disponibles en InvoiceService

### Generación
```typescript
generateInvoiceNumber(): Promise<string>
```
Genera nuevo número único para siguiente reserva.

### Validación
```typescript
isValidInvoiceFormat(invoiceNumber: string): boolean
```
Valida si un string cumple formato MOM-YYYYMMDD-NNNNN.

### Análisis
```typescript
parseInvoiceNumber(invoiceNumber: string): {
  company: string;      // "MOM"
  date: string;         // "20260210"
  sequence: number;     // 1
}
```
Extrae componentes del número de factura.

### Búsquedas
```typescript
getInvoicesByDate(date: Date): Promise<Reserva[]>
getInvoiceByNumber(invoiceNumber: string): Promise<Reserva | null>
getInvoicesByDateRange(startDate: Date, endDate: Date): Promise<Reserva[]>
```
Recupera reservas por criterios de búsqueda.

### Reportes
```typescript
getInvoiceStats(startDate?: Date, endDate?: Date): Promise<{
  total: number;              // Cantidad de facturas
  totalAmount: Decimal;       // Monto total
  anticipoRecaudado: Decimal; // Anticipos recibidos
  pendienteCobranza: Decimal; // Pendiente por cobrar
  promedio: Decimal;          // Monto promedio por reserva
}>
```
Genera estadísticas financieras.

## 🗂️ Archivos Modificados y Creados

### ✅ Creados
- `backend/src/common/invoice/invoice.service.ts` (200+ líneas)
- `backend/src/common/invoice/invoice.module.ts`

### ✅ Modificados
- `backend/prisma/schema.prisma` - Agregado campo `numeroFactura`
- `backend/src/modules/reservations/reservations.service.ts` - Integración de InvoiceService
- `backend/src/modules/reservations/reservations.module.ts` - Importación de InvoiceModule
- `backend/src/common/email/email.service.ts` - Actualización de templates y interfaz

### ✅ Migraciones
- `backend/prisma/migrations/20260210221332_add_numero_factura/migration.sql`

## 🚀 Flujo Completo de Reserva

```
1. Cliente crea reserva vía web
      ↓
2. Backend recibe solicitud en ReservationsService.createReservation()
      ↓
3. Valida disponibilidad de vehículo y precios
      ↓
4. InvoiceService.generateInvoiceNumber() crea número único
      ↓
5. Reserva se guarda en BD con numeroFactura
      ↓
6. ReservationEmailData se construye incluyendo numeroFactura
      ↓
7. Se envían DOS correos:
   a) EmailService.sendReservationConfirmation() → Cliente
   b) EmailService.sendAdminReservationNotification() → Admin
      ↓
8. Ambos correos muestran factura prominentemente
      ↓
9. Se puede usar número para tracking futuro del servicio
```

## 📱 Ejemplo de Email Generado

### Para Cliente
```
═══════════════════════════════════════════════════════════
RESERVA CONFIRMADA
Factura #MOM-20260210-00001
Referencia: #[reservaId]
═══════════════════════════════════════════════════════════

Hola [Nombre],

¡Gracias por reservar con nosotros! Tu reserva ha sido creada exitosamente.

DETALLES DE TU RESERVA
├─ Paquete: Premium Transportation
├─ Fecha: martes, 10 de febrero de 2026
├─ Hora de Salida: 08:30
├─ Hora de Llegada: 12:45
├─ Personas: 4
├─ Origen: San José Airport
└─ Destino: Hotel Luxury Resort

RESUMEN DE PAGO
├─ Paquete Base: ₡85,000.00
├─ Extras: ₡15,000.00
├─ Subtotal: ₡100,000.00
├─ Anticipo Requerido (50%): ₡50,000.00
├─ A Pagar Antes del Servicio: ₡50,000.00
└─ Total: ₡100,000.00

[Instrucciones SINPE...]
```

## 🔐 Seguridad y Validación

1. **Unicidad**: Índice UNIQUE en base de datos previene duplicados
2. **Formato**: Validación regex `^MOM-\d{8}-\d{5}$`
3. **Secuencial**: Números se generan automáticamente sin exposición
4. **Auditoría**: Cada reserva queda registrada con su factura
5. **Inyección segura**: InvoiceService es inyectable via NestJS

## 📈 Casos de Uso Futuros

Con este sistema implementado, ahora puedes:

1. **Rastreo de Servicio** - Usar número de factura para seguimiento del estado
2. **Portal de Cliente** - Mostrar histórico de facturas en cuenta del usuario
3. **Reportes Financieros** - Generar reportes por rango de fechas
4. **Notificaciones** - Enviar actualizaciones referenciando número de factura
5. **Integraciones** - Conectar con sistemas contables externos
6. **Análisis** - Estadísticas de volumen y monto de transacciones

## ✅ Estado Actual

| Componente | Estado | Detalles |
|-----------|--------|---------|
| Generación de Números | ✅ Completo | Formato MOM-YYYYMMDD-NNNNN funcionando |
| Almacenamiento BD | ✅ Completo | Campo numeroFactura único e indexado |
| Integración Reservas | ✅ Completo | Se genera número al crear reserva |
| Email Cliente | ✅ Completo | Muestra factura en encabezado |
| Email Admin | ✅ Completo | Muestra factura con referencia |
| Compilación | ✅ Exitosa | Backend compila sin errores |
| Migraciones | ✅ Aplicadas | Base de datos actualizada |

## 🔧 Cómo Usar

### En Aplicación
No requiere cambios en frontend - funciona automáticamente:
1. Cliente crea reserva normal vía web
2. Sistema genera factura automáticamente
3. Recibe correo con número de factura

### En Backend (Para Desarrolladores)
```typescript
// Para obtener estadísticas de facturas
const stats = await this.invoiceService.getInvoiceStats(
  new Date('2026-02-01'),
  new Date('2026-02-28')
);

// Para buscar reserva por factura
const reserva = await this.invoiceService.getInvoiceByNumber('MOM-20260210-00001');

// Para validar formato
const isValid = this.invoiceService.isValidInvoiceFormat('MOM-20260210-00001');
```

## 📝 Notas Importantes

- Los números de factura se reinician diariamente (cada día empieza en 00001)
- Los números son únicos aunque se reinicien (incluyen fecha)
- La base de datos admite null para reservas antiguas (antes de la migración)
- El sistema es tolerante a fallos de correo (no cancela reserva si falla email)

## 🎯 Próximas Mejoras Sugeridas

1. Permitir descarga de factura como PDF
2. Portal para clientes visualizar su factura
3. Integración con sistema contable automático
4. Estados de pago por factura (pendiente, parcial, pagado)
5. Recordatorios automáticos por factura impaga

---

**Documentación creada:** 10 de febrero de 2026  
**Versión:** 1.0  
**Sistema:** Moments Transportation CR
