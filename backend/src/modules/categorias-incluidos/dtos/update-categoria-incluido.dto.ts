import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { EstadoActivo } from '@prisma/client'

export class UpdateCategoriaIncluidoDto {
  @ApiProperty({
    description: 'Nombre de la categoría de incluido',
    example: 'BOTELLAS',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string

  @ApiProperty({
    description: 'Estado de la categoría',
    enum: EstadoActivo,
    required: false,
  })
  @IsEnum(EstadoActivo)
  @IsOptional()
  estado?: EstadoActivo
}
