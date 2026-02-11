import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarkPaymentCompleteDto {
  @ApiProperty({ 
    description: 'Tipo de pago recibido', 
    enum: ['SINPE', 'TRANSFERENCIA', 'TARJETA', 'EFECTIVO'],
    default: 'SINPE'
  })
  @IsEnum(['SINPE', 'TRANSFERENCIA', 'TARJETA', 'EFECTIVO'])
  tipoPago: 'SINPE' | 'TRANSFERENCIA' | 'TARJETA' | 'EFECTIVO';

  @ApiPropertyOptional({ description: 'Referencia externa del pago (número de transacción, etc.)' })
  @IsOptional()
  @IsString()
  referenciaExterna?: string;

  @ApiPropertyOptional({ description: 'Comentario adicional para el historial' })
  @IsOptional()
  @IsString()
  comentario?: string;
}
