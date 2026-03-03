import { IsString, IsEmail, IsDateString, IsInt, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ExtraItemDto {
  @ApiProperty({ description: 'ID del extra' })
  @IsString()
  extraId: string;

  @ApiProperty({ description: 'Cantidad del extra', minimum: 1 })
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty({ description: 'Precio unitario del extra al momento de crear la reserva', minimum: 0 })
  @IsNumber()
  @Min(0)
  precioUnitario: number;
}

export class CreateManualReservationDto {
  @ApiProperty({ description: 'Nombre del cliente' })
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Email del cliente' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Teléfono del cliente' })
  @IsString()
  telefono: string;

  @ApiPropertyOptional({ description: 'Identificación (cédula/pasaporte)' })
  @IsOptional()
  @IsString()
  identificacion?: string;

  @ApiPropertyOptional({ description: 'Notas internas (solo visible para admin)' })
  @IsOptional()
  @IsString()
  notasInternas?: string;

  @ApiProperty({ description: 'ID del paquete seleccionado' })
  @IsString()
  paqueteId: string;

  @ApiProperty({ description: 'ID del vehículo seleccionado' })
  @IsString()
  vehiculoId: string;

  @ApiProperty({ description: 'Tipo de evento' })
  @IsString()
  tipoEvento: string;

  @ApiProperty({ description: 'Fecha del evento (YYYY-MM-DD)' })
  @IsDateString()
  fechaEvento: string;

  @ApiProperty({ description: 'Origen del viaje' })
  @IsString()
  origen: string;

  @ApiProperty({ description: 'Destino del viaje' })
  @IsString()
  destino: string;

  @ApiProperty({ description: 'Número de personas', minimum: 1 })
  @IsInt()
  @Min(1)
  numeroPersonas: number;

  @ApiProperty({ description: 'Tipo de pago', enum: ['TARJETA', 'SINPE', 'TRANSFERENCIA'] })
  @IsEnum(['TARJETA', 'SINPE', 'TRANSFERENCIA'])
  tipoPago: 'TARJETA' | 'SINPE' | 'TRANSFERENCIA';

  @ApiProperty({ 
    description: 'Origen de la reserva', 
    enum: ['WEB', 'ADMIN', 'WHATSAPP', 'INSTAGRAM', 'CORREO', 'MANUAL', 'CORPORATIVO'],
    default: 'MANUAL'
  })
  @IsEnum(['WEB', 'ADMIN', 'WHATSAPP', 'INSTAGRAM', 'CORREO', 'MANUAL', 'CORPORATIVO'])
  origenReserva: 'WEB' | 'ADMIN' | 'WHATSAPP' | 'INSTAGRAM' | 'CORREO' | 'MANUAL' | 'CORPORATIVO';

  @ApiPropertyOptional({ description: 'Monto de anticipo pagado (el backend recalcula total y restante desde paquete + extras)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  anticipo?: number;

  @ApiPropertyOptional({ description: 'Solo informativo; el backend calcula precioBase desde el paquete' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioBase?: number;

  @ApiPropertyOptional({ description: 'Solo informativo; el backend calcula precioTotal desde paquete + extras' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioTotal?: number;

  @ApiPropertyOptional({ description: 'Solo informativo; el backend calcula restante = precioTotal - anticipo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  restante?: number;

  @ApiProperty({ 
    description: 'Estado inicial de la reserva', 
    enum: ['PAGO_PENDIENTE', 'PAGO_PARCIAL', 'CONFIRMADA'],
    default: 'PAGO_PENDIENTE'
  })
  @IsEnum(['PAGO_PENDIENTE', 'PAGO_PARCIAL', 'CONFIRMADA'])
  estadoInicial: 'PAGO_PENDIENTE' | 'PAGO_PARCIAL' | 'CONFIRMADA';

  @ApiPropertyOptional({
    description: 'Alias legacy de estadoInicial',
    enum: ['PAGO_PENDIENTE', 'PAGO_PARCIAL', 'CONFIRMADA'],
  })
  @IsOptional()
  @IsEnum(['PAGO_PENDIENTE', 'PAGO_PARCIAL', 'CONFIRMADA'])
  estado?: 'PAGO_PENDIENTE' | 'PAGO_PARCIAL' | 'CONFIRMADA';

  @ApiPropertyOptional({ description: 'Lista de extras opcionales', type: [ExtraItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtraItemDto)
  extras?: ExtraItemDto[];

  @ApiPropertyOptional({ description: 'Comentario inicial para historial' })
  @IsOptional()
  @IsString()
  comentario?: string;
}
