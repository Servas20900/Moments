import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MotivoDisponibilidad } from '@prisma/client';

export class CreateBlockDto {
  @ApiProperty({ example: 'cm5xmb3ym00004m7a5wvg6p43' })
  @IsString()
  vehiculoId: string;

  @ApiProperty({ example: '2026-02-15' })
  @IsDateString()
  fecha: string;

  @ApiProperty({ enum: MotivoDisponibilidad, example: 'BLOQUEADO_ADMIN' })
  @IsEnum(MotivoDisponibilidad)
  motivo: MotivoDisponibilidad;

  @ApiProperty({ example: 'Servicio de mantenimiento programado', required: false })
  @IsOptional()
  @IsString()
  detalles?: string;

  @ApiProperty({ example: 'admin@moments.com', required: false })
  @IsOptional()
  @IsString()
  creadoPor?: string;
}
