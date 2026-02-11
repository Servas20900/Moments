# Flujo de Estados de Reserva

## Estados Disponibles

### EstadoReserva

| Estado | Descripción | Transiciones válidas desde |
|--------|-------------|---------------------------|
| `PAGO_PENDIENTE` | Reserva creada, esperando adelanto (50%) | Inicial |
| `PAGO_PARCIAL` | Adelanto recibido, falta saldo | PAGO_PENDIENTE |
| `CONFIRMADA` | Pago completo recibido (100%) | PAGO_PARCIAL, PAGO_PENDIENTE |
| `COMPLETADA` | Servicio prestado exitosamente | CONFIRMADA |
| `CANCELADA` | Reserva cancelada | Cualquier estado |

## Flujo Principal

```
[NUEVA RESERVA]
      |
      v
PAGO_PENDIENTE (esperando adelanto 50%)
      |
      |--[Adelanto recibido >= 50%]-->
      v
PAGO_PARCIAL (adelanto confirmado, esperando saldo)
      |
      |--[Saldo recibido, total = 100%]-->
      v
CONFIRMADA (pago completo, reserva confirmada)
      |
      |--[Servicio prestado]-->
      v
COMPLETADA (servicio finalizado)
```

## Transiciones Específicas

### 1. Crear nueva reserva
- **Estado inicial**: `PAGO_PENDIENTE`
- **Condición**: Reserva creada con anticipo registrado pero no confirmado
- **Trigger**: POST /reservas

### 2. Marcar adelanto recibido (Admin)
- **Transición**: `PAGO_PENDIENTE` → `PAGO_PARCIAL`
- **Condición**: Adelanto >= 50% del total verificado
- **Trigger**: PATCH /reservas/:id/pago/adelanto
- **Valida**:
  - adelanto >= 50% del precioTotal
  - adelanto < precioTotal

### 3. Marcar pago completo (Admin)
- **Transición**: `PAGO_PARCIAL` → `CONFIRMADA` o `PAGO_PENDIENTE` → `CONFIRMADA`
- **Condición**: Pago total recibido (adelanto + saldo = 100%)
- **Trigger**: PATCH /reservas/:id/pago/completo
- **Valida**:
  - adelanto + saldo = precioTotal

### 4. Marcar servicio completado (Admin)
- **Transición**: `CONFIRMADA` → `COMPLETADA`
- **Condición**: Fecha del evento pasada y servicio prestado
- **Trigger**: PATCH /reservas/:id/estado/completada
- **Valida**:
  - fechaEvento < hoy
  - estado actual = CONFIRMADA

### 5. Cancelar reserva (Admin/Usuario)
- **Transición**: Cualquier estado → `CANCELADA`
- **Condición**: Según políticas de cancelación
- **Trigger**: PATCH /reservas/:id/cancelar
- **Acciones**:
  - Liberar vehículo
  - Procesar reembolso si aplica
  - Registrar en historial

## Lógica de Negocio

### Validaciones según estado

#### PAGO_PENDIENTE
- **Permite**: Cancelar, Marcar adelanto
- **Bloquea**: Completar, Modificar detalles
- **Vehículo**: Reservado temporalmente (libera después de X horas sin pago)

#### PAGO_PARCIAL
- **Permite**: Cancelar, Marcar pago completo
- **Bloquea**: Completar sin pago total
- **Vehículo**: Reservado definitivamente

#### CONFIRMADA
- **Permite**: Cancelar (con penalización), Completar
- **Bloquea**: Modificar pagos
- **Vehículo**: Reservado hasta evento + 24h

#### COMPLETADA
- **Permite**: Ver histórico
- **Bloquea**: Cualquier modificación
- **Vehículo**: Liberado

#### CANCELADA
- **Permite**: Ver histórico
- **Bloquea**: Cualquier modificación
- **Vehículo**: Liberado inmediatamente

## Modelo de Pago (tabla PagoReserva)

Cada pago se registra individualmente:

```typescript
{
  id: string
  reservaId: string
  monto: Decimal
  tipoPago: 'TARJETA' | 'SINPE' | 'TRANSFERENCIA'
  referenciaExterna: string       // Número de referencia SINPE
  comprobantePago: string          // URL del comprobante
  pagadoEn: DateTime               // Fecha de pago confirmado
  estado: 'PENDIENTE' | 'PAGADO' | 'FALLIDO' | 'REEMBOLSADO'
}
```

### Cálculo de estado según pagos

```typescript
const totalPagado = sumOf(pagos.where(estado = 'PAGADO').monto)
const porcentajePagado = (totalPagado / precioTotal) * 100

if (porcentajePagado === 0) {
  estado = 'PAGO_PENDIENTE'
} else if (porcentajePagado >= 50 && porcentajePagado < 100) {
  estado = 'PAGO_PARCIAL'
} else if (porcentajePagado >= 100) {
  estado = 'CONFIRMADA'
}
```

## Historial de Estados

Todos los cambios se registran en `HistorialEstadoReserva`:

```typescript
{
  id: string
  reservaId: string
  estado: EstadoReserva
  comentario: string              // Motivo del cambio
  cambiadoEn: DateTime
  activo: 'ACTIVO' | 'INACTIVO'
}
```

## Notificaciones según estado

| Estado | Email Cliente | Email Admin | SMS |
|--------|---------------|-------------|-----|
| PAGO_PENDIENTE | Si (instrucciones pago) | Si | No |
| PAGO_PARCIAL | Si (adelanto confirmado) | Si | No |
| CONFIRMADA | Si (confirmación final) | Si | Si |
| COMPLETADA | Si (agradecimiento) | No | No |
| CANCELADA | Si (cancelación) | Si | No |

## Ejemplo de Flujo Completo

### Caso 1: Pago en dos partes (flujo normal)

1. Cliente crea reserva con anticipo de $150 (50% de $300)
   - Estado: `PAGO_PENDIENTE`
   - Email enviado con instrucciones SINPE

2. Admin confirma recepción de adelanto $150
   - Estado: `PAGO_PENDIENTE` → `PAGO_PARCIAL`
   - Email confirmación de adelanto
   - Se crea PagoReserva con monto $150

3. Cliente paga saldo $150 antes del evento
   - Admin marca pago completo
   - Estado: `PAGO_PARCIAL` → `CONFIRMADA`
   - Email confirmación final
   - Se crea PagoReserva con monto $150

4. Admin marca servicio completado después del evento
   - Estado: `CONFIRMADA` → `COMPLETADA`
   - Email de agradecimiento

### Caso 2: Pago completo anticipado

1. Cliente crea reserva con anticipo de $300 (100% de $300)
   - Estado: `PAGO_PENDIENTE`

2. Admin confirma recepción de pago completo $300
   - Estado: `PAGO_PENDIENTE` → `CONFIRMADA` (directo)
   - Email confirmación final
   - Se crea PagoReserva con monto $300

3. Admin marca servicio completado
   - Estado: `CONFIRMADA` → `COMPLETADA`

### Caso 3: Cancelación

Cliente cancela con adelanto ya pagado:

1. Estado actual: `PAGO_PARCIAL`
2. Admin procesa cancelación
   - Estado: `PAGO_PARCIAL` → `CANCELADA`
   - Se crea PagoReserva con estado 'REEMBOLSADO' (si aplica)
   - Vehículo liberado
   - Email de cancelación

## Consideraciones Técnicas

1. **Atomicidad**: Transiciones de estado deben ser transaccionales
2. **Validación**: Siempre validar estado previo antes de transición
3. **Historial**: Registrar SIEMPRE en HistorialEstadoReserva
4. **Conflictos**: Verificar disponibilidad de vehículo en cada transición
5. **Rollback**: Implementar reversión de estados en caso de error

## API Endpoints

- `POST /reservas` - Crear reserva (inicial: PAGO_PENDIENTE)
- `PATCH /reservas/:id/pago/adelanto` - Marcar adelanto recibido (ADMIN)
- `PATCH /reservas/:id/pago/completo` - Marcar pago completo (ADMIN)
- `PATCH /reservas/:id/estado/completada` - Marcar completada (ADMIN)
- `PATCH /reservas/:id/cancelar` - Cancelar reserva (ADMIN/USER)
- `GET /reservas/:id/historial` - Ver historial de estados
