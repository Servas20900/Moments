import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AttachImageToVehicleDto {
  @ApiProperty({ example: 'vehiculo-id' })
  @IsString()
  vehiculoId: string;

  @ApiPropertyOptional({ example: 0, default: 0, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orden?: number;
}
