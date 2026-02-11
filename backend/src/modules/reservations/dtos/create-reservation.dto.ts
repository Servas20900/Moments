import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  IsNumber,
  IsDateString,
  IsEnum,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateReservationDto {
  @ApiProperty({ example: "cm5xmb3ym00004m7a5wvg6p41", required: false })
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @ApiProperty({ example: "cm5xmb3ym00004m7a5wvg6p42" })
  @IsString()
  paqueteId: string;

  @ApiProperty({ example: "cm5xmb3ym00004m7a5wvg6p43", required: false })
  @IsOptional()
  @IsString()
  vehiculoId?: string;

  @ApiProperty({ example: "cm5xmb3ym00004m7a5wvg6p44", required: false })
  @IsOptional()
  @IsString()
  conductorId?: string;

  @ApiProperty({ example: "Juan Pérez" })
  @IsString()
  nombre: string;

  @ApiProperty({ example: "juan@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "88888888" })
  @IsString()
  telefono: string;

  @ApiProperty({ example: "San José, Escazú, Calle 123", required: false })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({ example: "Cédula", required: false })
  @IsOptional()
  @IsString()
  tipoIdentificacion?: string;

  @ApiProperty({ example: "123456789", required: false })
  @IsOptional()
  @IsString()
  numeroIdentificacion?: string;

  @ApiProperty({ example: "Boda" })
  @IsString()
  tipoEvento: string;

  @ApiProperty({ example: "2026-02-14T00:00:00.000Z" })
  @IsDateString()
  fechaEvento: string;

  @ApiProperty({ example: "2026-02-14T14:00:00.000Z" })
  @IsDateString()
  horaInicio: string;

  @ApiProperty({ example: "2026-02-14T18:00:00.000Z" })
  @IsDateString()
  horaFin: string;

  @ApiProperty({ example: "San José Centro" })
  @IsString()
  origen: string;

  @ApiProperty({ example: "Playa Hermosa" })
  @IsString()
  destino: string;

  @ApiProperty({ example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numeroPersonas: number;

  @ApiProperty({ 
    example: 100.0, 
    description: 'Adelanto mínimo 50% del total (calculado en backend)',
    required: true 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  anticipo: number;

  @ApiProperty({ enum: ["TARJETA", "SINPE", "TRANSFERENCIA"], required: false })
  @IsOptional()
  @IsEnum(["TARJETA", "SINPE", "TRANSFERENCIA"])
  tipoPago?: string;

  @ApiProperty({
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        extraId: { type: 'string' },
        cantidad: { type: 'number' },
        precioUnitario: { type: 'number' },
      },
    },
    description: 'Lista de extras seleccionados para la reserva',
  })
  @IsOptional()
  extras?: Array<{
    extraId: string;
    cantidad?: number;
    precioUnitario?: number;
  }>;

  @ApiProperty({
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        incluidoId: { type: 'string' },
      },
    },
    description: 'Lista de incluidos (bebidas) seleccionados para la reserva',
  })
  @IsOptional()
  incluidos?: Array<{
    incluidoId: string;
  }>;

  @ApiProperty({
    example: 'El cliente solicitó música en vivo durante la reserva',
    required: false,
    description: 'Notas internas adicionales sobre la reserva',
  })
  @IsOptional()
  @IsString()
  notasInternas?: string;
}
