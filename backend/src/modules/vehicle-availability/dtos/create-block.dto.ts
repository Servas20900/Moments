import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum MotivoBloqueoAdmin {
  MANTENIMIENTO = 'MANTENIMIENTO',
  BLOQUEADO_ADMIN = 'BLOQUEADO_ADMIN',
  OTRO = 'OTRO',
}

export class CreateBlockDto {
  @ApiProperty({ example: 'cm5xmb3ym00004m7a5wvg6p43' })
  @IsString()
  vehiculoId: string;

  @ApiProperty({ example: '2026-02-15' })
  @IsDateString()
  fecha: string;

  @ApiProperty({ enum: MotivoBloqueoAdmin, example: 'BLOQUEADO_ADMIN' })
  @IsEnum(MotivoBloqueoAdmin)
  motivo: MotivoBloqueoAdmin;

  @ApiProperty({ example: 'Servicio de mantenimiento programado', required: false })
  @IsOptional()
  @IsString()
  detalles?: string;

  @ApiProperty({ example: 'admin@moments.com', required: false })
  @IsOptional()
  @IsString()
  creadoPor?: string;
}
