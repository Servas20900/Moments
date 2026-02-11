import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckAvailabilityDto {
  @ApiProperty({ example: 'cm5xmb3ym00004m7a5wvg6p43' })
  @IsString()
  vehiculoId: string;

  @ApiProperty({ example: '2026-02-15' })
  @IsDateString()
  fecha: string;
}
