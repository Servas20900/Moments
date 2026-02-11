import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator'
import { CategoriaExtra, EstadoActivo } from '@prisma/client'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateExtraDto {
  @ApiProperty({
    description: 'Nombre del extra',
    example: 'Champagne Premium',
  })
  @IsString()
  nombre: string

  @ApiPropertyOptional({
    description: 'Descripción del extra',
    example: 'Botella de Champagne Veuve Clicquot',
  })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({
    description: 'Precio del extra en dólares',
    example: 45.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio: number

  @ApiPropertyOptional({
    description: 'Categoría del extra',
    enum: ['SIN_ALCOHOL', 'PREMIUM_ALCOHOL'],
    example: 'PREMIUM_ALCOHOL',
  })
  @IsOptional()
  @IsEnum(CategoriaExtra)
  categoria?: CategoriaExtra
}
