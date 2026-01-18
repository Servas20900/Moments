import { IsString, IsEmail, IsOptional, IsInt, IsNumber, IsDateString, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @ApiProperty({ example: 'cm5xmb3ym00004m7a5wvg6p41', required: false })
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @ApiProperty({ example: 'cm5xmb3ym00004m7a5wvg6p42' })
  @IsString()
  paqueteId: string;

  @ApiProperty({ example: 'cm5xmb3ym00004m7a5wvg6p43' })
  @IsString()
  vehiculoId: string;

  @ApiProperty({ example: 'cm5xmb3ym00004m7a5wvg6p44', required: false })
  @IsOptional()
  @IsString()
  conductorId?: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '88888888' })
  @IsString()
  telefono: string;

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  identificacion?: string;

  @ApiProperty({ example: 'Boda' })
  @IsString()
  tipoEvento: string;

  @ApiProperty({ example: '2026-02-14T00:00:00.000Z' })
  @IsDateString()
  fechaEvento: string;

  @ApiProperty({ example: '2026-02-14T14:00:00.000Z' })
  @IsDateString()
  horaInicio: string;

  @ApiProperty({ example: '2026-02-14T18:00:00.000Z' })
  @IsDateString()
  horaFin: string;

  @ApiProperty({ example: 'San José Centro' })
  @IsString()
  origen: string;

  @ApiProperty({ example: 'Playa Hermosa' })
  @IsString()
  destino: string;

  @ApiProperty({ example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numeroPersonas: number;

  @ApiProperty({ example: 150.00, required: false })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioBase?: number;

  @ApiProperty({ example: 200.00, required: false })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioTotal?: number;

  @ApiProperty({ example: 100.00, required: false })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  anticipo?: number;

  @ApiProperty({ example: 100.00, required: false })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  restante?: number;

  @ApiProperty({ enum: ['TARJETA', 'SINPE', 'TRANSFERENCIA'], required: false })
  @IsOptional()
  @IsEnum(['TARJETA', 'SINPE', 'TRANSFERENCIA'])
  tipoPago?: string;
}
