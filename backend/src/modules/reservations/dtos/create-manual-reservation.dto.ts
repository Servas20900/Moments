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

  @ApiPropertyOptional({ description: 'ID del conductor asignado' })
  @IsOptional()
  @IsString()
  conductorId?: string;

  @ApiProperty({ description: 'Tipo de evento' })
  @IsString()
  tipoEvento: string;

  @ApiProperty({ description: 'Fecha del evento (YYYY-MM-DD)' })
  @IsDateString()
  fechaEvento: string;

  @ApiProperty({ description: 'Hora de inicio (ISO 8601)' })
  @IsDateString()
  horaInicio: string;

  @ApiProperty({ description: 'Hora de fin (ISO 8601)' })
  @IsDateString()
  horaFin: string;

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

  @ApiPropertyOptional({ description: 'Monto de anticipo pagado', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  anticipo?: number;

  @ApiProperty({ 
    description: 'Estado inicial de la reserva', 
    enum: ['PAGO_PENDIENTE', 'PAGO_PARCIAL', 'CONFIRMADA'],
    default: 'PAGO_PENDIENTE'
  })
  @IsEnum(['PAGO_PENDIENTE', 'PAGO_PARCIAL', 'CONFIRMADA'])
  estadoInicial: 'PAGO_PENDIENTE' | 'PAGO_PARCIAL' | 'CONFIRMADA';

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
