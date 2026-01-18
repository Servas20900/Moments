import { PartialType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @ApiProperty({ enum: ['PAGO_PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'], required: false })
  @IsOptional()
  @IsEnum(['PAGO_PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
  estado?: string;
}
